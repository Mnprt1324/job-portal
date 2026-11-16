const companyModel=require("../models/company.model");
const getDataUri = require("../utils/datauri");
const cloudinary=require("../utils/cloudinary");
const mongoose =require("mongoose");

const profileFields = {companyName: 160, tagline: 160, description: 5000, website: 500, location: 200, industry: 100, contactEmail: 254, linkedin: 500, twitter: 500, instagram: 500, github: 500, benefits: 3000, companySize: 20};
const readProfile = (body) => {
  const data = {};
  for (const [field, max] of Object.entries(profileFields)) {
    if (body[field] === undefined) continue;
    if (typeof body[field] !== 'string' || body[field].trim().length > max) throw new Error(`Please check ${field}. Maximum ${max} characters.`);
    data[field] = body[field].trim();
  }
  if (data.companyName === '') throw new Error('Company name is required.');
  for (const field of ['website', 'linkedin', 'twitter', 'instagram', 'github']) {
    if (!data[field]) continue;
    let url;
    try { url = new URL(data[field]); } catch { throw new Error(`Enter a valid https:// URL for ${field}.`); }
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) throw new Error(`Enter a valid http or https URL for ${field}.`);
  }
  if (data.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) throw new Error('Enter a valid contact email.');
  if (data.companySize !== undefined && !['', '1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'].includes(data.companySize)) throw new Error('Choose a valid company size.');
  if (body.foundedYear !== undefined) {
    if (body.foundedYear === '') data.foundedYear = null;
    else {
      const year = Number(body.foundedYear);
      if (!Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()) throw new Error('Enter a valid founding year.');
      data.foundedYear = year;
    }
  }
  return data;
};
const uploadLogo = async (file) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) || file.size > 5 * 1024 * 1024) throw Object.assign(new Error('Choose a JPG, PNG or WebP logo under 5 MB.'), { status: 400 });
  const result = await cloudinary.uploader.upload(getDataUri(file).content);
  if (!result.secure_url) throw new Error('Logo upload failed. Please try again.');
  return result.secure_url;
};

module.exports.registerCompany = async (req, res) => {
  try {
    let data;
    try { data = readProfile(req.body); } catch (error) { return res.status(400).json({success:false, message:error.message}); }
    if (!data.companyName) return res.status(400).json({success:false,message:'Company name is required.'});
    if (await companyModel.findOne({companyName:data.companyName})) return res.status(400).json({success:false,message:'This company name is already registered.'});
    if (req.file) data.logo = await uploadLogo(req.file);
    const company = await companyModel.create({...data, createdByUserId:req.user._id});
    return res.status(201).json({success:true,company,message:'Company profile created.'});
  } catch (error) {
    return res.status(error.status || 500).json({success:false,message:error.status === 400 ? error.message : 'Unable to create company profile. Please try again.'});
  }
};

module.exports.getCompanyCreateByrecruiter=async (req,res)=>{
try {
    const recruiterId=req.user._id;
    const companies=await companyModel.find({createdByUserId:recruiterId});
    if(!companies) return res.status(404).json({message:"Companies not found",success:false});
     return res.status(200).json({companies,message:"fetched scussfully",success:true});
} catch (error) {
    console.log("error from :getCompanyCreateByrecruiter",error)
   return res.status(404).json({message:"server error :getCompanycreatedByrec"})
}
}

module.exports.getComapnyById=async (req,res)=>{
try {
  const companyId=req.params.id;
  const company=await companyModel.findById(companyId);
  if(!company) return res.status(404).json({message:"Company not found",success:false});
  return res.status(200).json({company,message:"fetched scussfully",success:true});
    
} catch (error) {
    console.log("error from :getComapnyById",error)
    return res.status(404).json({message:"server error :getComapnyById"})   
}
}

module.exports.updateCompanyProfile = async (req, res) => {
  try {
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({success:false,message:'Invalid company ID.'});
    let data;
    try { data = readProfile(req.body); } catch (error) { return res.status(400).json({success:false,message:error.message}); }
    const filter = {_id:id,createdByUserId:req.user._id};
    if (!await companyModel.findOne(filter)) return res.status(404).json({success:false,message:'Company not found.'});
    if (req.file) data.logo = await uploadLogo(req.file);
    const company = await companyModel.findOneAndUpdate(filter, {$set:data}, {new:true,runValidators:true});
    if (!company) return res.status(404).json({success:false,message:'Company not found.'});
    return res.status(200).json({success:true,company,message:'Company profile saved.'});
  } catch (error) {
    return res.status(error.status || 500).json({success:false,message:error.status === 400 ? error.message : 'Unable to save company profile. Please try again.'});
  }
};
