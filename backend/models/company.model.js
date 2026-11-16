const mongoose =require("mongoose");

const companySchema=new mongoose.Schema({
  companyName:{type:String ,required:true},
  description:{type:String, },
  website:{type:String },
  location:{type:String, },
  logo:{type:String,},
  tagline: { type: String, maxlength: 160 },
  industry: { type: String, maxlength: 100 },
  companySize: { type: String, enum: ['', '1-10', '11-50', '51-200', '201-500', '501-1000', '1001+'] },
  foundedYear: { type: Number, min: 1800 },
  contactEmail: { type: String, maxlength: 254 },
  linkedin: { type: String, maxlength: 500 },
  twitter: { type: String, maxlength: 500 },
  instagram: { type: String, maxlength: 500 },
  github: { type: String, maxlength: 500 },
  benefits: { type: String, maxlength: 3000 },
  createdByUserId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true}
},{timestamps:true});

module.exports=mongoose.model("Company",companySchema);
