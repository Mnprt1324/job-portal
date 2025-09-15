const userModel = require('../models/user.model');
const sendmail = require('../utils/nodemailer');
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs")
const getDataUri = require('../utils/datauri');
const cloudinary = require("../utils/cloudinary");

module.exports.registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !role) {
        return res.status(404).json({ message: "something went wrong...", success: false })
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

        const file = req.file;
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { folder: "uploads", });

        let skillArray;
        if (skills) skillArray = skills.split(",");
        const userId = req.user._id;
        let user = await userModel.findById(userId);
        if (!user) return res.status(400).json({ message: "User not found.", success: false });

        if (name) user.name = name;
        if (email) user.email = email;
        if (bio) user.profile.bio = bio;
        if (phone) user.profile.phone = phone;
        if (location) user.profile.location = location;
        if (skills) user.profile.skills = skillArray;
        if (website) user.profile.website = website;
        if (github) user.profile.github = github;

        if (cloudResponse) {
            user.profile.profileImg = cloudResponse.secure_url;
        }

        await user.save();

        user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phone,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({ message: "Profile updated successfully.", user, success: true })

    } catch (error) {
        console.log("error:", error);
    }
}


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
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { folder: "uploads/resume", });
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url;
        }
        await user.save();
        res.status(200).json({ message: "resume upload" })
    } catch (error) {
        console.log("resumeUpload error", error);
        return res.status(500).json({ message: "internal server error" })
    }
}