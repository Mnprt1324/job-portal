const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  conversationId:{type:mongoose.Schema.Types.ObjectId,ref:'Conversation',required:true},
  senderId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  sequence:{type:Number,required:true},
  clientMessageId:{type:String,required:true},
  content:{type:String,required:true,maxlength:2000},
},{timestamps:{createdAt:true,updatedAt:false}});
schema.index({conversationId:1,sequence:1},{unique:true});
schema.index({conversationId:1,senderId:1,clientMessageId:1},{unique:true});
schema.index({conversationId:1,senderId:1,sequence:1});
module.exports = mongoose.model('Message',schema);
