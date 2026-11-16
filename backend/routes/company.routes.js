const express =require("express");
const router =express.Router();
const companyControllers=require("../controllers/company.controllers");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/multer");

router.post('/register',authenticate,upload.single("logo"),companyControllers.registerCompany)
router.post('/get',authenticate,companyControllers.getCompanyCreateByrecruiter)
router.post('/get/:id',authenticate,companyControllers.getComapnyById)
router.post('/update/:id',authenticate,upload.single("logo"),companyControllers.updateCompanyProfile)

module.exports=router;
