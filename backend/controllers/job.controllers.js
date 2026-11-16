const jobModel = require("../models/job.model");
const mongoose = require("mongoose");

const canManageJobs = (user) => ["recruiter", "company"].includes(user?.role);

const readOptionalJobDetails = (body) => {
  const data = {};
  for (const [field, max] of Object.entries({department:120, responsibilities:10000, education:2000, benefits:5000})) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || body[field].trim().length > max) throw new Error(`Please check ${field}. Maximum ${max} characters.`);
    data[field] = body[field].trim();
  }
  for (const [field, values] of Object.entries({workMode:['','On-site','Hybrid','Remote'],experienceLevel:['','Entry level','Mid level','Senior','Lead','Manager']})) {
    if (body[field] === undefined) continue;
    if (!values.includes(body[field])) throw new Error(`Choose a valid ${field}.`);
    data[field] = body[field];
  }
  if (body.openings !== undefined) {
    if (body.openings !== null && !['string','number'].includes(typeof body.openings)) throw new Error('Enter a valid number of openings.');
    const value = body.openings === '' || body.openings === null ? null : Number(body.openings);
    if (value !== null && (!Number.isInteger(value) || value < 1 || value > 1000)) throw new Error('Openings must be a whole number from 1 to 1000.');
    data.openings = value;
  }
  if (body.applicationDeadline !== undefined) {
    const date = body.applicationDeadline;
    if (typeof date !== 'string' || (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date))) throw new Error('Enter a valid application deadline.');
    data.applicationDeadline = date;
  }
  return data;
};

const normalizeRequirements = (requirement) => {
  if (Array.isArray(requirement)) {
    return requirement.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(requirement || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// controller for job creating  
module.exports.createJob = async (req, res, next) => {
  if (!canManageJobs(req.user)) {
    return res.status(403).json({ message: "access denied" });
  }

  const { title, company, location, salary, requirement, description, jobType } = req.body;
  if (!title || !company || !location || !salary || !requirement || !description || !jobType) {
    return res.status(400).json({ message: "all field must be required" });
  }

  const requirementArray = normalizeRequirements(requirement);
  if (requirementArray.length === 0) {
    return res.status(400).json({ message: "At least one requirement is required" });
  }

  let details;
  try { details = readOptionalJobDetails(req.body); } catch (error) { return res.status(400).json({success:false,message:error.message}); }
  const jobObject = { title, company, location, salary, requirement: requirementArray, description, jobType, ...details, postedBy: req.user._id }
  try {
    const job = await jobModel.create(jobObject);
    console.log()
    return res.status(201).json({ message: "job created scussfully", job, success: true });
  } catch (error) {
    console.log(error)
    return res.status(404).json({ message: "server error" })

  }
}

module.exports.getAlljob = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "new";
    const limit = req.query.limit ||6;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const skip = (page - 1) * limit;
const searchQuery = keyword
      ? {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { location: { $regex: keyword, $options: "i" } },
            { jobType: { $regex: keyword, $options: "i" } },
          ],
        }
      : {}; 
    const query = {...searchQuery, deletedAt: null};

    // Sorting logic: "new" => Descending (latest jobs first), "old" => Ascending (oldest jobs first)
    const totalJobs = await jobModel.countDocuments(query);

    const sortOrder = sortBy === "old" ? 1 : -1;

    const jobs = await jobModel
      .find(query)
      .populate("company")
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limit);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found.", success: false });
    }

    return res.status(200).json({ jobs, totalJobs, totalPages: Math.ceil(totalJobs / limit), currentPage: page, message: "Fetched successfully", success: true });
  } catch (error) {
    console.error("Error in getAllJob:", error);
    return res.status(500).json({ message: "Server error in getAllJob", success: false });
  }
};



module.exports.getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await jobModel.findOne({_id:jobId,deletedAt:null}).populate("applicants").populate("company", "companyName logo location description website");
    if (!job) return res.status(404).json({ message: "Jobs not found." })
    return res.status(200).json({ job, message: "job fecth successfully", success: true });
  } catch (error) {
    console.log("error from :getJobById", error)
    return res.status(404).json({ message: "server error :getJobById" })
  }
}


//recruiter ne kitne jobs create kare hai

module.exports.recruiterJobCreated = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const jobs = await jobModel.find({ postedBy: recruiterId, deletedAt: null }).populate("company").sort({ createdAt: -1 });
    if (!jobs) res.status(404).json({ message: "Jobs not found", success: false });
    return res.status(200).json({ jobs, message: "fetch scussfully", success: true });
  } catch (error) {
    console.log("error fetching recruiter jobs", error);
    res.status(404).json({ message: "server error :recruiter" });
  }
}


module.exports.UpdateJob = async (req, res) => {
  try {
    if (!canManageJobs(req.user)) {
      return res.status(403).json({ message: "access denied" });
    }

    const jobId = req.params.id
    const { title, company, location, salary, requirement, description, jobType } = req.body;
    console.log(title, company);
    if (!title || !company || !location || !salary || !requirement || !description || !jobType) {
      return res.status(400).json({ message: "all field must be required" });
    }
    const requirementArray = normalizeRequirements(requirement);
    if (requirementArray.length === 0) {
      return res.status(400).json({ message: "At least one requirement is required" });
    }

    let details;
    try { details = readOptionalJobDetails(req.body); } catch (error) { return res.status(400).json({success:false,message:error.message}); }
    const updateData = { title, company, location, salary, requirement: requirementArray, description, jobType, ...details };
    const updateJob = await jobModel.findOneAndUpdate({_id:jobId,postedBy:req.user._id,deletedAt:null}, updateData, {new:true,runValidators:true});
    if (!updateJob) return res.status(404).json({success:false,message:'Job not found.'});

    return res.status(200).json({ updateJob, message: "Update scussfully", success: true });
  } catch (error) {
    console.log("update Job", error);
    res.status(404).json({ message: "server error :recruiter" });
  }
}

module.exports.deleteJob = async (req, res) => {
  if (!canManageJobs(req.user)) return res.status(403).json({success:false,message:'Access denied.'});
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({success:false,message:'Invalid job ID.'});
  try {
    const job = await jobModel.findOneAndUpdate(
      {_id:req.params.id,postedBy:req.user._id,deletedAt:null},
      {$set:{deletedAt:new Date()}},
      {new:true}
    );
    if (!job) return res.status(404).json({success:false,message:'Job not found.'});
    return res.status(200).json({success:true,message:'Job deleted.',jobId:job._id});
  } catch {
    return res.status(500).json({success:false,message:'Unable to delete this job. Please try again.'});
  }
};
