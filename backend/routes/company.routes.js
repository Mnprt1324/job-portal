const express =require("express");
const router =express.Router();
const companyControllers=require("../controllers/company.controllers");
const { authenticate, requireCompany } = require("../middleware/auth");
const upload = require("../middleware/multer");
router.use(authenticate, requireCompany);

router.post('/register',upload.single("logo"),companyControllers.registerCompany)
router.post('/get',companyControllers.getOwnedCompanies)
router.post('/get/:id',companyControllers.getComapnyById)
router.post('/update/:id',upload.single("logo"),companyControllers.updateCompanyProfile)

module.exports=router;
