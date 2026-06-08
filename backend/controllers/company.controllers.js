const companyModel=require("../models/company.model");
const getDataUri = require("../utils/datauri");
const cloudinary=require("../utils/cloudinary");
const mongoose =require("mongoose");

module.exports.registerCompany=async (req,res,)=>{
try {
    const {companyName}=req.body;
    if(!companyName) res.status(400).json({message:"Company name is required",success:false});
    let company=await companyModel.findOne({companyName});
    if(company) res.status(400).json({message:"you cannot register same company",success:false});
    company =await companyModel.create({companyName,createdByUserId:req.user._id})
    return res.status(201).json({ message: "Company registered successfully.",company,success:true }) 
} catch (error) {
    console.log("error in registering company:",error);
    return res.status(404).json({message:"server error : company"})
}
}

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

module.exports.updateCompanyProfile=async (req,res)=>{
  try {
    let {id}=req.params;
    const {companyName,description,website,location}=req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid company ID" });
    }

    const updateData={companyName,description,website,location};

    if (req.file) {
      const file = req.file;
      const fileUri = getDataUri(file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      updateData.logo = cloudResponse.secure_url;
    }

    const company =await companyModel.findByIdAndUpdate(id,updateData,{new:true});
    if(!company) return res.status(404).json({message:"Company not found"});
    return res.status(200).json({company,message:"Company information updated",success:true});
  } catch (error) {
    console.log("error from :updateCompanyProfile",error)
    return res.status(404).json({message:"server error :updateCompanyProfile"})   
  }
}
