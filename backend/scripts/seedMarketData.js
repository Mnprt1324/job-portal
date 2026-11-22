/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');

const apply = process.argv.includes('--apply');
const SEED_PASSWORD = 'company@123456';

const companies = [
  ['Infosys', 'infosys.com', 'Bengaluru, Karnataka', 'Technology consulting and digital services', 1981, '1001+'],
  ['Nagarro', 'nagarro.com', 'Gurugram, Haryana', 'Digital engineering and AI transformation', 1996, '1001+'],
  ['Quark', 'quark.com', 'Mohali, Punjab', 'Enterprise software', 1981, '201-500'],
  ['Finvasia', 'finvasia.com', 'Mohali, Punjab', 'Financial technology', 2009, '201-500'],
  ['Net Solutions', 'netsolutions.com', 'Chandigarh, India', 'Digital product engineering', 2000, '201-500'],
  ['Daffodil Software', 'daffodilsw.com', 'Gurugram, Haryana', 'Software product engineering', 1999, '201-500'],
  ['TO THE NEW', 'tothenew.com', 'Noida, Uttar Pradesh', 'Digital technology services', 2008, '1001+'],
  ['HCLTech', 'hcltech.com', 'Noida, Uttar Pradesh', 'IT services and consulting', 1976, '1001+'],
  ['Wipro', 'wipro.com', 'Bengaluru, Karnataka', 'Technology services and consulting', 1945, '1001+'],
  ['LTIMindtree', 'ltimindtree.com', 'Bengaluru, Karnataka', 'Technology consulting and digital solutions', 1999, '1001+'],
  ['Persistent Systems', 'persistent.com', 'Pune, Maharashtra', 'Digital engineering and enterprise modernization', 1990, '1001+'],
  ['Zensar Technologies', 'zensar.com', 'Pune, Maharashtra', 'Technology services and experience engineering', 1991, '1001+'],
  ['Cybage', 'cybage.com', 'Pune, Maharashtra', 'Software product engineering', 1995, '1001+'],
  ['Darwinbox', 'darwinbox.com', 'Hyderabad, Telangana', 'Human resources technology', 2015, '501-1000'],
  ['Razorpay', 'razorpay.com', 'Bengaluru, Karnataka', 'Financial technology and payments', 2014, '1001+'],
];

const roles = [
  ['Frontend Engineer', 'Engineering', 'Mid level', ['React', 'JavaScript', 'TypeScript', 'CSS'], 'Build accessible, responsive web experiences with product and engineering partners.'],
  ['Backend Engineer', 'Engineering', 'Mid level', ['Node.js', 'REST APIs', 'MongoDB', 'SQL'], 'Design dependable services, APIs, and data integrations for customer-facing products.'],
  ['Full Stack Engineer', 'Engineering', 'Mid level', ['React', 'Node.js', 'TypeScript', 'PostgreSQL'], 'Deliver product features across the web application and backend services.'],
  ['DevOps Engineer', 'Platform', 'Mid level', ['AWS', 'Docker', 'CI/CD', 'Kubernetes'], 'Improve deployment reliability, observability, and cloud platform operations.'],
  ['QA Automation Engineer', 'Quality Engineering', 'Mid level', ['Playwright', 'JavaScript', 'API Testing', 'CI/CD'], 'Build automated test coverage and help teams ship reliable releases.'],
  ['Data Analyst', 'Data', 'Entry level', ['SQL', 'Excel', 'Power BI', 'Python'], 'Turn business data into clear dashboards, analysis, and practical recommendations.'],
  ['Product Designer', 'Design', 'Mid level', ['Figma', 'UX Research', 'Prototyping', 'Design Systems'], 'Shape useful, clear experiences from research through polished product delivery.'],
  ['Cloud Engineer', 'Cloud', 'Mid level', ['AWS', 'Terraform', 'Linux', 'Monitoring'], 'Develop secure, scalable cloud foundations for application teams.'],
  ['Business Analyst', 'Product', 'Entry level', ['Requirements Analysis', 'SQL', 'Agile', 'Stakeholder Management'], 'Translate business needs into well-defined requirements and measurable outcomes.'],
  ['Technical Support Specialist', 'Customer Experience', 'Entry level', ['Troubleshooting', 'Communication', 'Documentation', 'Ticketing Systems'], 'Help customers solve product issues with timely, clear, and thoughtful support.'],
];

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const seedEmail = (name) => `${slug(name)}@mailinator.com`;
const companyDescription = (name, industry, location) =>
  `${name} is represented in this JobOrbit seed dataset as a ${industry.toLowerCase()} employer with a presence in ${location}. Review the company website before relying on this profile for hiring decisions.`;

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');

  if (!apply) {
    console.log(`Dry run: ${companies.length} company profiles and ${companies.length * roles.length} job listings would be created. Run with --apply to write to MongoDB.`);
    return;
  }

  await mongoose.connect(process.env.MONGO_URI);
  const password = await User.hashPassword(SEED_PASSWORD);
  let companyCount = 0;
  let jobCount = 0;

  for (const [companyName, domain, location, industry, foundedYear, companySize] of companies) {
    const email = seedEmail(companyName);
    const recruiter = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: `${companyName} Talent Team`,
          password,
          role: 'company',
          isSuspended: false,
          companySettings: { defaultLocation: location, defaultJobType: 'Full-time', defaultWorkMode: 'Hybrid' },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const company = await Company.findOneAndUpdate(
      { createdByUserId: recruiter._id },
      {
        $set: {
          companyName,
          website: `https://www.${domain}`,
          location,
          logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          tagline: `${industry} opportunities in ${location.split(',')[0]}`,
          industry,
          companySize,
          foundedYear,
          contactEmail: email,
          linkedin: `https://www.linkedin.com/company/${slug(companyName)}/`,
          benefits: 'Health coverage, learning support, flexible work options, paid leave, and career development.',
          description: companyDescription(companyName, industry, location),
          createdByUserId: recruiter._id,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await Job.deleteMany({ postedBy: recruiter._id });
    const salaryBase = industry.includes('Financial') ? 7 : 6;
    const jobs = roles.map(([title, department, experienceLevel, requirement, responsibility], index) => ({
      title,
      company: company._id,
      postedBy: recruiter._id,
      location,
      salary: `INR ${salaryBase + index}-${salaryBase + index + 5} LPA`,
      requirement,
      description: `Seed listing for ${title} at ${companyName}. ${responsibility} This is representative discovery data, not a claim that the role is currently open.`,
      jobType: 'Full-time',
      workMode: index % 3 === 0 ? 'Remote' : index % 3 === 1 ? 'Hybrid' : 'On-site',
      experienceLevel,
      department,
      openings: index % 4 === 0 ? 2 : 1,
      applicationDeadline: '2027-01-31',
      responsibilities: responsibility,
      education: 'Relevant degree or equivalent practical experience.',
      benefits: 'Health coverage, learning support, flexible work options, and paid leave.',
    }));
    await Job.insertMany(jobs);
    companyCount += 1;
    jobCount += jobs.length;
  }

  console.log(`Seeded ${companyCount} companies and ${jobCount} job listings.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
