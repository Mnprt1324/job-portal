const jobModel = require("../models/job.model");

const canManageJobs = (user) => ["recruiter", "company"].includes(user?.role);

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

  const jobObject = { title, company, location, salary, requirement: requirementArray, description, jobType, postedBy: req.user._id }
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
const query = keyword
      ? {
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { location: { $regex: keyword, $options: "i" } },
            { jobType: { $regex: keyword, $options: "i" } },
          ],
        }
      : {}; 

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
    const job = await jobModel.findById(jobId).populate("applicants").populate("company", "companyName logo location description website");
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
    const jobs = await jobModel.find({ postedBy: recruiterId }).populate("company").sort({ createdAt: -1 });
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

    const updateData = { title, company, location, salary, requirement: requirementArray, description, jobType };
    const updateJob = await jobModel.findByIdAndUpdate(jobId, updateData);

    return res.status(200).json({ updateJob, message: "Update scussfully", success: true });
  } catch (error) {
    console.log("update Job", error);
    res.status(404).json({ message: "server error :recruiter" });
  }
}
