const express =require("express");
const router =express.Router();
const applicationControllers=require("../controllers/application.controllers");
const { authenticate, requireCompany, requireJobseeker } = require("../middleware/auth");

router.post("/apply/:id", authenticate,requireJobseeker,applicationControllers.applyJob)
router.get("/getAppliedJob",authenticate,requireJobseeker,applicationControllers.getAppliedJobs)
router.get("/:id/applicants", authenticate,requireCompany,applicationControllers.getApplicants)
router.post("/status/:id/applicants", authenticate,requireCompany,applicationControllers.updateStatus)
 
module.exports=router;
