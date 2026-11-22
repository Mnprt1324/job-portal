const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref:'Company', require: true },
    location: { type: String, required: true },
    salary: { type: String, },
    requirement: { type: [String] },
    description: { type: String, required: true },
    descriptionHtml: { type: String, maxlength: 60000 },
    jobType: { type: String, required: true },
    workMode: { type: String, enum: ['', 'On-site', 'Hybrid', 'Remote'] },
    experienceLevel: { type: String, enum: ['', 'Entry level', 'Mid level', 'Senior', 'Lead', 'Manager'] },
    department: { type: String, maxlength: 120 },
    openings: { type: Number, min: 1, max: 1000 },
    applicationDeadline: { type: String },
    responsibilities: { type: String, maxlength: 10000 },
    education: { type: String, maxlength: 2000 },
    benefits: { type: String, maxlength: 5000 },
    source: { type: String, default: 'JobOrbit' },
    sourceUrl: { type: String, maxlength: 2000 },
    externalJobId: { type: String, maxlength: 300 },
    sourceLastSyncedAt: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,require:true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Application" }],
    deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);

