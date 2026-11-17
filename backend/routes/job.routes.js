const express=require("express");
const router=express.Router();
const { authenticate, requireCompany } = require("../middleware/auth");
const jobControllers=require("../controllers/job.controllers")

router.post("/createJob",authenticate,jobControllers.createJob);
router.get("/getAllJobs",jobControllers.getAlljob);
router.get("/company/jobs",authenticate,requireCompany,jobControllers.getCompanyJobs);
router.get("/getJob/:id",authenticate,jobControllers.getJobById);
router.post("/updateJob/:id",authenticate,jobControllers.UpdateJob);
router.delete("/deleteJob/:id",authenticate,jobControllers.deleteJob);
module.exports=router;
