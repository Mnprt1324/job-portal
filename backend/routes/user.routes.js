const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user.controllers");
const upload = require("../middleware/multer");
const { authenticate } = require("../middleware/auth");

router.post("/register", userControllers.registerUser);
router.post("/login", userControllers.loginUser);
router.post("/logout", userControllers.logoutUser);
router.get("/company/settings", authenticate, userControllers.getCompanySettings);
router.patch("/company/settings", authenticate, userControllers.updateCompanySettings);
router.post("/password/change", authenticate, userControllers.changePassword);
router.post("/password/forget",userControllers.forgetUserPassword);
router.post("/password/verify",userControllers.verifyPass);
router.post("/password/update",userControllers.updateUserPass)
router.post("/profile/update",upload.single("profileImage"),authenticate,userControllers.updateUserProfile);
router.post("/profile/resume",upload.single("resume"),authenticate,userControllers.resumeUpload);
//extra
// router.get("/auth",userControllers.auth);

module.exports = router;
// ,upload.single("image")
