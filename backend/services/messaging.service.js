const mongoose=require('mongoose');
const Conversation=require('../models/conversation.model');
const Message=require('../models/message.model');
const Application=require('../models/application.model');
const Job=require('../models/job.model');
const Company=require('../models/company.model');
const User=require('../models/user.model');
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const id=(value)=>{if(!mongoose.isObjectIdOrHexString(value))fail(400,'Invalid identifier.');return value;};
const same=(a,b)=>String(a)===String(b);
const participantFilter=(user)=>{
  if(!['company','jobseeker'].includes(user.role))fail(403,'Messaging is available to companies and jobseekers only.');
  return {[user.role==='company'?'companyUserId':'jobseekerUserId']:user._id};
};
const readField=(user)=>user.role==='company'?'companyLastReadSequence':'jobseekerLastReadSequence';
async function member(conversationId,user){
  const conversation=await Conversation.findOne({_id:id(conversationId),...participantFilter(user)}).lean();
  if(!conversation)fail(404,'Conversation not found.');
  return conversation;
}
async function availability(c){
  const [job,company,users]=await Promise.all([
    Job.findById(c.jobId).select('postedBy company deletedAt').lean(),
    Company.findById(c.companyId).select('createdByUserId').lean(),
    User.find({_id:{$in:[c.companyUserId,c.jobseekerUserId]}}).select('role isSuspended').lean(),
  ]);
  if(!job||job.deletedAt)return 'This job is no longer available. Conversation history is read-only.';
  if(!company||!same(job.postedBy,c.companyUserId)||!same(job.company,c.companyId)||!same(company.createdByUserId,c.companyUserId))return 'This company is no longer available for messaging.';
  if(!users.some(u=>same(u._id,c.companyUserId)&&u.role==='company'&&!u.isSuspended)||!users.some(u=>same(u._id,c.jobseekerUserId)&&u.role==='jobseeker'&&!u.isSuspended))return 'One of the participants is unavailable. Conversation history is read-only.';
  return '';
}
async function summary(c,user){
  const [job,company,person,unread,readOnlyReason]=await Promise.all([
    Job.findById(c.jobId).select('title').lean(),
    Company.findById(c.companyId).select('companyName logo').lean(),
    User.findById(user.role==='company'?c.jobseekerUserId:c.companyUserId).select('name profile.profileImg').lean(),
    Message.countDocuments({conversationId:c._id,senderId:{$ne:user._id},sequence:{$gt:c[readField(user)]}}),
    availability(c),
  ]);
  return {...c,jobTitle:job?.title||'Job unavailable',partnerName:user.role==='company'?(person?.name||'Jobseeker unavailable'):(company?.companyName||'Company unavailable'),partnerImage:user.role==='company'?person?.profile?.profileImg:company?.logo,unread,readOnlyReason};
}
async function create(applicationId,user){
  participantFilter(user);
  const application=await Application.findById(id(applicationId)).lean();
  if(!application)fail(404,'Application not found.');
  const job=await Job.findById(application.job).lean();
  const company=job&&await Company.findById(job.company).lean();
  if(user.role==='jobseeker'?!same(application.applicant,user._id):!job||!same(job.postedBy,user._id))fail(404,'Application not found.');
  const existing=await Conversation.findOne({applicationId}).lean();
  if(existing){await member(existing._id,user);return summary(existing,user);}
  if(!job||!company||!same(company.createdByUserId,job.postedBy))fail(409,'This company is unavailable for messaging.');
  const values={applicationId,jobId:job._id,companyId:company._id,companyUserId:job.postedBy,jobseekerUserId:application.applicant};
  const reason=await availability(values);if(reason)fail(409,reason);
  let result;
  try{result=await Conversation.findOneAndUpdate({applicationId},{$setOnInsert:values},{upsert:true,new:true,setDefaultsOnInsert:true}).lean();}
  catch(error){if(error.code!==11000)throw error;result=await Conversation.findOne({applicationId}).lean();}
  return summary(result,user);
}
function decodeCursor(raw){
  if(!raw)return null;
  try{const c=JSON.parse(Buffer.from(raw,'base64url').toString());id(c.id);if(!Number.isFinite(Date.parse(c.at)))throw Error();return c;}
  catch{fail(400,'Invalid pagination cursor.');}
}
function limitValue(raw,fallback,max){const n=raw===undefined?fallback:Number(raw);if(!Number.isInteger(n)||n<1||n>max)fail(400,'Invalid page size.');return n;}
async function list(user,query){
  const filter=participantFilter(user),cursor=decodeCursor(query.cursor),limit=limitValue(query.limit,20,50);
  if(cursor)filter.$or=[{lastMessageAt:{$lt:new Date(cursor.at)}},{lastMessageAt:new Date(cursor.at),_id:{$lt:cursor.id}}];
  // Fetch a bounded page first. Search/filter applies to that page; clients keep the next cursor.
  const rows=await Conversation.find(filter).sort({lastMessageAt:-1,_id:-1}).limit(limit+1).lean();
  const hasMore=rows.length>limit;const page=rows.slice(0,limit);
  let conversations=await Promise.all(page.map(c=>summary(c,user)));
  if(query.search){if(typeof query.search!=='string'||query.search.length>100)fail(400,'Search is too long.');const q=query.search.toLowerCase();conversations=conversations.filter(c=>`${c.partnerName} ${c.jobTitle}`.toLowerCase().includes(q));}
  if(query.unreadOnly==='true')conversations=conversations.filter(c=>c.unread>0);
  const last=page.at(-1);
  return {conversations,nextCursor:hasMore?Buffer.from(JSON.stringify({id:String(last._id),at:last.lastMessageAt.toISOString()})).toString('base64url'):null};
}
async function unread(user){
  const rows=await Conversation.find(participantFilter(user)).select('_id companyLastReadSequence jobseekerLastReadSequence').lean();
  const counts=await Promise.all(rows.map(c=>Message.countDocuments({conversationId:c._id,senderId:{$ne:user._id},sequence:{$gt:c[readField(user)]}})));
  return counts.reduce((a,b)=>a+b,0);
}
async function history(conversationId,user,query){
  const c=await member(conversationId,user),limit=limitValue(query.limit,30,100);
  if(query.beforeSequence!==undefined&&query.afterSequence!==undefined)fail(400,'Choose one history cursor.');
  const after=query.afterSequence!==undefined,raw=after?query.afterSequence:query.beforeSequence;
  const filter={conversationId:c._id};
  if(raw!==undefined){const n=Number(raw);if(!Number.isSafeInteger(n)||n<0)fail(400,'Invalid message cursor.');filter.sequence=after?{$gt:n}:{$lt:n};}
  const rows=await Message.find(filter).sort({sequence:after?1:-1}).limit(limit+1).lean();
  const hasMore=rows.length>limit,messages=rows.slice(0,limit);if(!after)messages.reverse();
  return {messages,hasMore,conversation:await summary(c,user)};
}
function validateMessage(body){
  if(typeof body.content!=='string'||!body.content.trim()||body.content.length>2000)fail(400,'Write a message between 1 and 2,000 characters.');
  if(typeof body.clientMessageId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.clientMessageId))fail(400,'A valid message UUID is required.');
  return body.content.trim();
}
async function send(conversationId,user,body){
  const content=validateMessage(body),c=await member(conversationId,user);
  const key={conversationId:c._id,senderId:user._id,clientMessageId:body.clientMessageId};
  const original=await Message.findOne(key).lean();
  if(original){if(original.content!==content)fail(409,'This message identifier was already used.');return {message:original,created:false,conversation:c};}
  const reason=await availability(c);if(reason)fail(409,reason);
  const session=await mongoose.startSession();let message;
  try{
    await session.withTransaction(async()=>{
      const updated=await Conversation.findOneAndUpdate({_id:c._id},{$inc:{lastSequence:1},$set:{lastMessageAt:new Date(),lastMessagePreview:content.slice(0,160)}},{new:true,session});
      [message]=await Message.create([{...key,content,sequence:updated.lastSequence}],{session});
    });
  }catch(error){
    if(error.code===11000){const saved=await Message.findOne(key).lean();if(saved){if(saved.content!==content)fail(409,'This message identifier was already used.');return {message:saved,created:false,conversation:c};}}
    if(error.code===20||error.codeName==='IllegalOperation')fail(503,'Messaging needs a MongoDB replica set. Please contact support.');
    throw error;
  }finally{await session.endSession();}
  return {message:message.toObject(),created:true,conversation:c};
}
async function markRead(conversationId,user,throughSequence){
  const c=await member(conversationId,user);
  if(!Number.isSafeInteger(throughSequence)||throughSequence<0||throughSequence>c.lastSequence)fail(400,'Invalid read position.');
  const updated=await Conversation.findByIdAndUpdate(c._id,{$max:{[readField(user)]:throughSequence}},{new:true}).lean();
  return {conversation:updated,userId:user._id,throughSequence:updated[readField(user)]};
}
module.exports={create,list,unread,history,send,markRead,member,availability,validateMessage,participantFilter,limitValue};
