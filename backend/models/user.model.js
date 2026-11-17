const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
//user schema created 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["jobseeker", "company", "admin"],
        required: true
    },
    isSuspended: { type: Boolean, default: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    companySettings: {
        defaultLocation: { type: String, maxlength: 200, default: '' },
        defaultJobType: { type: String, enum: ['Full-time','Part-time','Contract','Internship','Remote'], default: 'Full-time' },
        defaultWorkMode: { type: String, enum: ['','On-site','Hybrid','Remote'], default: '' },
    },
    profile: {
        profileImg: {
            type: String,//url
            default: "",
        },
        bio: {
            type: String,
            maxLenght: 500,
        },
        phone: { type: String },
        location: { type: String },
        skills: { type: [String] },
        experience: [
            {
                company: String,
                role: String,
                years: String
            }
        ],
        website: { type: String },
        github: { type: String },
        resume: { type: String },
        appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
    },
    otp: {
        attempts: { type: Number, default: 0 },
        otp: {
            type: String,
            default: null
        },
        otpExpiry: {
            type: Date,
            default: null,
        }
    }

}, { timestamps: true });

//method to create token
userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this.id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}

//method to compare user password and hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
//static function for hashing user password
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

module.exports = mongoose.model("User", userSchema);
