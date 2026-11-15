const userModel = require('../models/user.model');
const sendmail = require('../utils/nodemailer');
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs")
const getDataUri = require('../utils/datauri');
const cloudinary = require("../utils/cloudinary");

module.exports.registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const allowedRoles = ["jobseeker", "recruiter", "company"];
    if (!name || !email || !password || !role) {
        return res.status(404).json({ message: "something went wrong...", success: false })
    }
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid user role", success: false });
    }
    const isUesrAlreadyExist = await userModel.findOne({ email });
    //if  user already exits
    if (isUesrAlreadyExist) return res.status(400).json({ message: "user already exist", success: false });


    const hashPassword = await userModel.hashPassword(password);

    const user = await userModel.create({ name, email, password: hashPassword, role });;
    const token = user.generateAuthToken();
    return res.status(201).json({ token, user, success: true });
}

//loginUser
module.exports.loginUser = async (req, res, next) => {
    const { email, password, role } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid eamil and password', success: false });
    }
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid eamil and password', success: false });
    }

    if (user.role === role) {
        const token = user.generateAuthToken();
        return res.status(200).json({ token, user, success: true, message: ":Login successful " });
    }
    else {
        return res.status(400).json({ message: 'user cannot exist with current role', success: false });

    }
}


//logout user
module.exports.logoutUser = async (req, res, next) => {
    res.clearCookie("token");
    return res.json({ message: "logout user successful", success: true });
}

module.exports.forgetUserPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required", success: false });
        }
        const isUserExist = await userModel.findOne({ email });
        if (!isUserExist) {
            return res.status(400).json({ message: "Invalid email", success: false });
        }
        const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

        isUserExist.otp.otp = otp;
        isUserExist.otpExpiry = Date.now() + 2 * 60 * 1000;

        await isUserExist.save();

        console.log("Generated OTP:", otp);
        sendmail(otp, email);

        return res.status(200).json({ message: "OTP sent to your email", success: true });
    } catch (error) {
        console.error("Error in forgetUserPassword:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

module.exports.verifyPass = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not Found", success: false });
        if (user.otp.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.otp.otp = null;
        user.otpExpiry = null;
        await user.save();
        return res.status(200).json({ message: "OTP verified successfully", success: true });
    } catch (error) {
        console.log("error", error);
    }
}


module.exports.updateUserPass = async (req, res) => {
    try {
        const { password, email } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required", success: false });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        await user.save();

        return res.status(200).json({ message: "Password changed successfully", success: true });
    } catch (error) {
        console.log("Error updating password:", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
};


module.exports.updateUserProfile = async (req, res) => {
    try {
        const { name, email, bio, phone, location, skills, website, github } = req.body;
        if (name !== undefined && !String(name).trim()) return res.status(400).json({ success: false, message: "Name is required." });
        if (email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) return res.status(400).json({ success: false, message: "Enter a valid email address." });
        let skillArray;
        if (skills !== undefined) {
            let values;
            if (Array.isArray(skills)) values = skills;
            else if (String(skills).trim().startsWith("[")) {
                try { values = JSON.parse(skills); } catch { return res.status(400).json({ success: false, message: "Skills must be a list." }); }
            } else values = String(skills).split(",");
            if (!Array.isArray(values) || values.some(value => typeof value !== "string")) return res.status(400).json({ success: false, message: "Skills must be a list of text values." });
            skillArray = [...new Set(values.map(value => value.trim()).filter(Boolean))];
        }
        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        if (name !== undefined) user.name = String(name).trim();
        if (email !== undefined) user.email = String(email).trim().toLowerCase();
        if (bio !== undefined) user.profile.bio = bio;
        if (phone !== undefined) user.profile.phone = phone;
        if (location !== undefined) user.profile.location = location;
        if (skillArray !== undefined) user.profile.skills = skillArray;
        if (website !== undefined) user.profile.website = website;
        if (github !== undefined) user.profile.github = github;
        if (req.file) {
            const fileUri = getDataUri(req.file);
            const uploaded = await cloudinary.uploader.upload(fileUri.content, { folder: "uploads" });
            if (!uploaded?.secure_url) throw new Error("Profile image upload failed");
            user.profile.profileImg = uploaded.secure_url;
        }
        await user.save();
        return res.status(200).json({ success: true, message: "Profile updated successfully.", user: { _id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile } });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ success: false, message: "That email address is already in use." });
        console.error("Profile update failed:", error.message);
        return res.status(500).json({ success: false, message: "We could not update your profile. Please try again." });
    }
};

module.exports.auth = async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ isAuthenticated: false });
    }
    res.json({ isAuthenticated: true, token });
}


module.exports.resumeUpload = async (req, res) => {
    try {
        const resume = req.file;
        if (!resume) return res.status(404).json({ message: "No File Present" })
        const userId = req.user._id;
        let user = await userModel.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found.", success: false });
        const fileUri = getDataUri(resume);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { folder: "uploads/resume", resource_type: "auto" });
        if (!cloudResponse?.secure_url) return res.status(500).json({ success: false, message: "Resume upload failed. Please try again." });
        user.profile.resume = cloudResponse.secure_url;
        await user.save();
        return res.status(200).json({ success: true, message: "Resume uploaded successfully.", user: { _id: user._id, name: user.name, email: user.email, role: user.role, profile: user.profile } });
    } catch (error) {
        console.log("resumeUpload error", error);
        return res.status(500).json({ message: "internal server error" })
    }
}
