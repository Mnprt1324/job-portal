/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const Job = require('../models/job.model');
const Application = require('../models/application.model');
const Interview = require('../models/interview.model');

const COMPANY_EMAIL = 'nvidia@mailinator.com';
const PASSWORD = 'company@123456';
// Existing accounts shown in the MongoDB collection. Override for another environment:
// $env:INTERVIEW_JOBSEEKER_ID='...'; $env:INTERVIEW_COMPANY_ID='...'; npm run seed:nvidia-interviews
const TARGET_JOBSEEKER_ID = process.env.INTERVIEW_JOBSEEKER_ID || '68a6b947ee6a5d50a96b35db';
const TARGET_COMPANY_ID = process.env.INTERVIEW_COMPANY_ID || '6afb217903762ecff0e14132';

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  if (!mongoose.isValidObjectId(TARGET_JOBSEEKER_ID) || !mongoose.isValidObjectId(TARGET_COMPANY_ID)) throw new Error('The target account IDs are invalid.');
  const recruiter = await User.findOne({ _id: TARGET_COMPANY_ID, role: 'company' });
  const applicant = await User.findOne({ _id: TARGET_JOBSEEKER_ID, role: 'jobseeker' });
  if (!recruiter) throw new Error(`Company user ${TARGET_COMPANY_ID} was not found.`);
  if (!applicant) throw new Error(`Jobseeker user ${TARGET_JOBSEEKER_ID} was not found.`);
  const company = await Company.findOneAndUpdate({ createdByUserId: recruiter._id }, { $set: { companyName: 'Nvidia', website: 'https://www.nvidia.com', location: 'Bengaluru, Karnataka', logo: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128', tagline: 'The engine of AI computing', industry: 'Semiconductors and AI computing', companySize: '1001+', foundedYear: 1993, contactEmail: COMPANY_EMAIL, description: 'Nvidia designs accelerated computing platforms that power AI, high-performance computing, graphics, and robotics.', createdByUserId: recruiter._id } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  let jobs = await Job.find({ postedBy: recruiter._id, title: { $in: ['Software Engineer, AI Infrastructure', 'Machine Learning Engineer', 'Technical Program Manager'] } }).limit(3);
  if (jobs.length < 3) { jobs = await Job.insertMany(['Software Engineer, AI Infrastructure', 'Machine Learning Engineer', 'Technical Program Manager'].map((title, index) => ({ title, company: company._id, postedBy: recruiter._id, location: 'Bengaluru, Karnataka', salary: 'INR 18-32 LPA', requirement: ['Python', 'Systems design', 'Collaboration'], description: `Join Nvidia as a ${title} and help build advanced computing products.`, jobType: 'Full-time', workMode: index === 1 ? 'Hybrid' : 'On-site', experienceLevel: 'Mid level', department: 'Engineering', openings: 1 })) ); }
  for (let index = 0; index < jobs.length; index += 1) {
    const job = jobs[index % jobs.length];
    const application = await Application.findOneAndUpdate({ job: job._id, applicant: applicant._id }, { $set: { status: 'accepted' } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    if (!job.applicants.some((id) => String(id) === String(application._id))) { job.applicants.push(application._id); await job.save(); }
    const date = new Date(Date.now() + (index + 2) * 86400000); date.setHours(11 + index, 0, 0, 0);
    await Interview.findOneAndUpdate({ application: application._id, round: index === 0 ? 'technical' : index === 1 ? 'hr' : 'final' }, { $set: { job: job._id, applicant: applicant._id, scheduledBy: recruiter._id, scheduledAt: date, durationMinutes: index === 2 ? 60 : 45, mode: index === 1 ? 'in_person' : 'online', meetingUrl: index === 1 ? '' : `https://meet.google.com/nvidia-interview-${index + 1}`, location: index === 1 ? 'Nvidia Office, Bengaluru, Karnataka' : '', notes: 'Please join five minutes early and keep a government-issued photo ID available.', status: index === 0 ? 'confirmed' : 'scheduled', candidateResponseNote: index === 0 ? 'I confirm that I will attend.' : '', statusHistory: [{ status: index === 0 ? 'confirmed' : 'scheduled', actor: index === 0 ? applicant._id : recruiter._id, note: 'Sample interview data' }] } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  }
  console.log(`Created ${jobs.length} Nvidia interview records for ${applicant.name} and ${recruiter.name}.`);
  await mongoose.disconnect();
}
main().catch(async (error) => { console.error(error); await mongoose.disconnect().catch(() => {}); process.exitCode = 1; });
