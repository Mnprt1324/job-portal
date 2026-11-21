const mongoose = require('mongoose');
const ref = (model) => ({type:mongoose.Schema.Types.ObjectId,ref:model,required:true});
const schema = new mongoose.Schema({
  applicationId:{...ref('Application'),unique:true},
  jobId:ref('Job'), companyId:ref('Company'),
  companyUserId:ref('User'), jobseekerUserId:ref('User'),
  lastSequence:{type:Number,default:0},
  lastMessageAt:{type:Date,default:Date.now},
  lastMessagePreview:{type:String,default:''},
  companyLastReadSequence:{type:Number,default:0},
  jobseekerLastReadSequence:{type:Number,default:0},
},{timestamps:true});
schema.index({companyUserId:1,lastMessageAt:-1,_id:-1});
schema.index({jobseekerUserId:1,lastMessageAt:-1,_id:-1});
module.exports = mongoose.model('Conversation',schema);
