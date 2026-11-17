const applicationModel = require("../models/application.model");
// const ApplicationModel = require("../models/application.model");
const jobModel = require('../models/job.model');

module.exports.applyJob = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobId = req.params.id;
      
        if (!jobId) return res.status(404).json({ message: "Job Id is required" ,success: false });

        const existingApplication = await applicationModel.findOne({ job:jobId, applicant: userId });

        if (existingApplication) return res.status(400).json({ message: "You have already applied for this job" ,success: false });

        const job = await jobModel.findById(jobId);
            if (!job || job.deletedAt) return res.status(404).json({ message: "job not found" ,success: false });
        if (job.applicationDeadline && Date.now() > Date.parse(`${job.applicationDeadline}T23:59:59.999Z`)) {
            return res.status(400).json({success:false,message:'Applications for this role have closed.'});
        }
     
        const newApplication = await applicationModel.create({
            job: jobId,
            applicant: userId,
        });
        //jobModel applicant filled
        if (!job.applicants) {
            job.applicants = [];
        }

        job.applicants.push(newApplication._id);
        await job.save();
        return res.status(201).json({ message: "job applied successfully", success: true })

    } catch (error) {
        console.log("error from :applyJob", error);
        return res.status(404).json({ message: "server error :applyJob" });
    }
}

module.exports.getAppliedJobs = async (req, res) => {
    try {
        const userId = req.user._id;
        const application = await applicationModel.find({ applicant: userId }).populate(
            {
                path: "job",
                select: "title company", 
                populate: {
                  path: "company",
                  select: "companyName location" 
                }
              }

        );
        if (!application) return res.status(404).json({ message: "No applications" ,success: false });
        return res.status(200).json({ application, success: true });
    } catch (error) {
        console.log("error from :getAppliedJobs", error);
        return res.status(404).json({ message: "server error :getAppliedJobs" });
    }
}

// for admin
module.exports.getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        console.log(jobId);
        const job = await jobModel.findOne({_id:jobId,postedBy:req.user._id}).populate({
            path:'applicants',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant'
            }
        });

        if (!job) return res.status(404).json({ message: "job not found", success: false });

    

        return res.status(201).json({ applicants:job.applicants, success: true });
    } catch (error) {
        console.log("error from :getAppliedJobs", error);
        return res.status(404).json({ message: "server error :getAppliedJobs" });
    }
}

// update status
module.exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        if (typeof status !== 'string' || !['pending','accepted','rejected'].includes(status.toLowerCase())) {
            return res.status(400).json({ message: "Status is required", success: false });
        }

        const application = await applicationModel.findById(applicationId).populate('job','postedBy');
        if (!application) {
            return res.status(404).json({ message: "Application not found.", success: false });
        }
        if (String(application.job?.postedBy) !== String(req.user._id)) return res.status(403).json({success:false,message:'Access denied.'});

        application.status = status.toLowerCase();
        await application.save(); 

        return res.status(200).json({ message: "Status updated successfully.", success: true });
    } catch (error) {
        console.error("Error in updateStatus:", error);
        return res.status(500).json({ message: "Server error in updateStatus", success: false });
    }
};
