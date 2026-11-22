/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');

const apply = process.argv.includes('--apply');
const IMPORT_LIMIT = 150;
const COMPANY_PASSWORD = 'company@123456';

// These public ATS endpoints return only roles published on each employer's
// own job board. They are deliberately not scraped from LinkedIn or Indeed.
const sources = [
  {
    provider: 'Lever',
    key: 'paytmpayments',
    companyName: 'Paytm Payments Services',
    domain: 'paytmpayments.com',
    location: 'Noida, Uttar Pradesh',
    industry: 'Financial technology and payments',
    foundedYear: 2012,
    companySize: '1001+',
    fetchUrl: 'https://api.lever.co/v0/postings/paytmpayments?mode=json',
  },
  {
    provider: 'Greenhouse',
    key: 'zscaler',
    companyName: 'Zscaler',
    domain: 'zscaler.com',
    location: 'Bengaluru, Karnataka',
    industry: 'Cloud security',
    foundedYear: 2007,
    companySize: '1001+',
    fetchUrl: 'https://boards-api.greenhouse.io/v1/boards/zscaler/jobs?content=true',
  },
  {
    provider: 'Lever',
    key: 'extremenetworks',
    companyName: 'Extreme Networks',
    domain: 'extremenetworks.com',
    location: 'Bengaluru, Karnataka',
    industry: 'Network infrastructure',
    foundedYear: 1996,
    companySize: '1001+',
    fetchUrl: 'https://api.lever.co/v0/postings/extremenetworks?mode=json',
  },
];

const india = /india|bengaluru|bangalore|pune|gurgaon|gurugram|noida|delhi|hyderabad|mohali|chandigarh/i;
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const cleanText = (value = '') => value
  .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ')
  .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
  .replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const summary = (value) => cleanText(value).slice(0, 9500);
const richHtml = (value = '') => String(value)
  .replace(/&amp;/gi, '&').replace(/&nbsp;/gi, ' ')
  .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
  .slice(0, 60000);
const recruiterEmail = (companyName) => `${slug(companyName)}@mailinator.com`;
const legacyRecruiterEmail = (companyName) => `talent+${slug(companyName)}@joborbit.example`;
const jobType = (value = '') => /part.?time/i.test(value) ? 'Part-time' : /contract/i.test(value) ? 'Contract' : /intern/i.test(value) ? 'Internship' : 'Full-time';
const workMode = (location = '') => /remote/i.test(location) ? 'Remote' : /hybrid/i.test(location) ? 'Hybrid' : 'On-site';
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchJson(url, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'JobOrbit public-job importer' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await wait(attempt * 750);
    }
  }
  throw new Error(`${label} job feed could not be reached: ${lastError.message}`);
}

async function companyWebsiteMetadata(domain) {
  const fallback = {
    description: `Public company profile for ${domain}. Details are refreshed from the employer's website when available.`,
    logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  };
  try {
    const response = await fetch(`https://www.${domain}`, { signal: AbortSignal.timeout(8000), headers: { 'user-agent': 'JobOrbit public-job importer' } });
    if (!response.ok) return fallback;
    const html = (await response.text()).slice(0, 300000);
    const description = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i)?.[1];
    const logo = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i)?.[1];
    return { description: cleanText(description || fallback.description), logo: logo || fallback.logo };
  } catch {
    return fallback;
  }
}

function mapJobs(source, payload) {
  const rawJobs = source.provider === 'Greenhouse' ? payload.jobs || [] : payload;
  return rawJobs.map((job) => {
    const location = source.provider === 'Greenhouse'
      ? job.location?.name || job.offices?.map((office) => office.location).filter(Boolean).join(', ') || source.location
      : job.categories?.location || source.location;
    if (!india.test(location)) return null;
    const sourceDescription = source.provider === 'Greenhouse' ? job.content : job.description || job.descriptionPlain;
    const descriptionHtml = richHtml(sourceDescription);
    const description = summary(descriptionHtml);
    const title = source.provider === 'Greenhouse' ? job.title : job.text;
    if (!title) return null;
    return {
      externalJobId: `${source.provider}:${source.key}:${job.id}`,
      title,
      location,
      description: description || `View the original ${source.companyName} job posting for the full role description.`,
      descriptionHtml,
      sourceUrl: source.provider === 'Greenhouse' ? job.absolute_url : job.hostedUrl,
      jobType: jobType(source.provider === 'Greenhouse' ? '' : job.categories?.commitment),
      workMode: workMode(location),
      department: source.provider === 'Greenhouse' ? job.departments?.[0]?.name || 'Hiring' : job.categories?.team || 'Hiring',
      requirement: ['See the original employer listing for complete requirements.'],
      responsibilities: description || 'See the original employer listing for responsibilities.',
    };
  }).filter(Boolean);
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  const remoteJobs = [];

  for (const source of sources) {
    const jobs = mapJobs(source, await fetchJson(source.fetchUrl, source.companyName));
    console.log(`${source.companyName}: ${jobs.length} active India-based roles available.`);
    remoteJobs.push(...jobs.map((job) => ({ ...job, source })));
  }

  const jobsBySource = new Map(sources.map((source) => [source.companyName, []]));
  remoteJobs.forEach((job) => jobsBySource.get(job.source.companyName).push(job));
  const selected = [];
  const perSourceTarget = Math.floor(IMPORT_LIMIT / sources.length);
  for (const source of sources) selected.push(...jobsBySource.get(source.companyName).splice(0, perSourceTarget));
  for (const source of sources) {
    if (selected.length >= IMPORT_LIMIT) break;
    selected.push(...jobsBySource.get(source.companyName).splice(0, IMPORT_LIMIT - selected.length));
  }
  if (selected.length < IMPORT_LIMIT) throw new Error(`Only ${selected.length} live India-based roles were available; expected ${IMPORT_LIMIT}.`);
  if (!apply) {
    console.log(`Dry run: ${selected.length} live job listings would be imported from ${sources.length} public employer feeds. Run with --apply to write to MongoDB.`);
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  const password = await User.hashPassword(COMPANY_PASSWORD);
  const companiesByName = new Map();
  const recruiters = [];

  for (const source of sources) {
    const metadata = await companyWebsiteMetadata(source.domain);
    const email = recruiterEmail(source.companyName);
    let recruiter = await User.findOne({ email: { $in: [email, legacyRecruiterEmail(source.companyName)] } });
    if (recruiter) {
      recruiter.name = `${source.companyName} Talent Team`;
      recruiter.email = email;
      recruiter.password = password;
      recruiter.role = 'company';
      recruiter.isSuspended = false;
      await recruiter.save();
    } else {
      recruiter = await User.create({ name: `${source.companyName} Talent Team`, email, password, role: 'company', isSuspended: false });
    }
    const company = await Company.findOneAndUpdate(
      { createdByUserId: recruiter._id },
      {
        $set: {
          companyName: source.companyName, website: `https://www.${source.domain}`, location: source.location,
          logo: metadata.logo, description: metadata.description, industry: source.industry,
          companySize: source.companySize, foundedYear: source.foundedYear, contactEmail: recruiter.email,
          tagline: `${source.industry} careers in India`, linkedin: `https://www.linkedin.com/company/${slug(source.companyName)}/`,
          benefits: 'See the original employer listing for location-specific benefits.', createdByUserId: recruiter._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    recruiters.push(recruiter);
    companiesByName.set(source.companyName, { company, recruiter });
  }

  // Remove only previously imported records owned by these importer accounts.
  await Job.deleteMany({ postedBy: { $in: recruiters.map((recruiter) => recruiter._id) }, source: { $in: ['Greenhouse', 'Lever'] } });
  const sampleSeedUsers = await User.find({ email: /^talent\+.*@joborbit\.example$/ }).select('_id');
  await Job.deleteMany({
    postedBy: { $in: sampleSeedUsers.map((user) => user._id) },
    description: /^Seed listing for /,
  });

  await Job.insertMany(selected.map(({ source, ...job }) => {
    const owner = companiesByName.get(source.companyName);
    return {
      ...job,
      company: owner.company._id,
      postedBy: owner.recruiter._id,
      source: source.provider,
      sourceLastSyncedAt: new Date(),
      experienceLevel: '',
      openings: 1,
      applicationDeadline: '',
      salary: '',
      benefits: 'See the original employer listing for benefits.',
    };
  }));

  console.log(`Imported ${selected.length} live public listings from ${sources.map((source) => source.companyName).join(', ')}.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
