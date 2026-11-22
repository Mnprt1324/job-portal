const mongoose=require('mongoose');
const User=require('../models/user.model');
const Company=require('../models/company.model');
const Job=require('../models/job.model');
const Application=require('../models/application.model');
const Contact=require('../models/contact.model');
const {activityWindow,buildCharts}=require('../utils/adminCharts');
const resources={
  users:{model:User,search:['name','email'],select:'name email role isSuspended createdAt profile.profileImg profile.bio profile.phone profile.location profile.skills profile.experience profile.website profile.github profile.resume',populate:[]},
  companies:{model:Company,search:['companyName','location','industry'],select:'-__v',populate:[['createdByUserId','name email']]},
  jobs:{model:Job,search:['title','location','department'],select:'-__v',populate:[['company','companyName logo website description'],['postedBy','name email']]},
  applications:{model:Application,search:[],select:'-__v',populate:[['job','title location jobType department deletedAt company'],['applicant','name email profile.profileImg profile.bio profile.location profile.skills profile.experience profile.website profile.github profile.resume']]},
  contacts:{model:Contact,search:['name','email','subject','message'],select:'-__v',populate:[]},
};
const roles=['company','jobseeker','admin'];
const literal=(value)=>String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const fail=(res,message,status=400)=>res.status(status).json({success:false,message});
module.exports.overview=async(req,res)=>{
  try {
    const {start,end}=activityWindow();
    const daily=(extra={})=>[{$match:{...extra,createdAt:{$gte:start,$lt:end}}},{$group:{_id:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt',timezone:'UTC'}},count:{$sum:1}}}];
    const [users,companies,jobs,applications,contacts,suspended,removedJobs,newContacts,recentUsers,recentJobs,userActivity,jobActivity,applicationActivity,userRoles,applicationStatuses]=await Promise.all([
      User.countDocuments({role:{$in:roles}}),Company.countDocuments({}),Job.countDocuments({deletedAt:null}),Application.countDocuments({}),Contact.countDocuments({}),User.countDocuments({isSuspended:true,role:{$in:roles}}),Job.countDocuments({deletedAt:{$ne:null}}),Contact.countDocuments({$or:[{status:'new'},{status:{$exists:false}}]}),User.find({role:{$in:roles}}).select('name email role isSuspended createdAt').sort({createdAt:-1}).limit(5),Job.find({deletedAt:null}).select('title location createdAt').populate('company','companyName').sort({createdAt:-1}).limit(5),
      User.aggregate(daily({role:{$in:roles}})),Job.aggregate(daily()),Application.aggregate(daily()),User.aggregate([{$match:{role:{$in:roles}}},{$group:{_id:'$role',count:{$sum:1}}}]),Application.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
    ]);
    const charts=buildCharts({start,users:userActivity,jobs:jobActivity,applications:applicationActivity,roles:userRoles,statuses:applicationStatuses});
    return res.json({success:true,stats:{users,companies,jobs,applications,contacts,suspended,removedJobs,newContacts},recentUsers,recentJobs,charts});
  }catch{return fail(res,'Unable to load the platform overview.',500);}
};
module.exports.list=async(req,res)=>{
  const config=Object.hasOwn(resources,req.params.resource)?resources[req.params.resource]:null;if(!config)return fail(res,'Resource not found.',404);
  const page=Math.max(1,Math.min(100000,parseInt(req.query.page)||1)),limit=15;
  const search=String(req.query.search||'').trim().slice(0,200),filter=String(req.query.filter||'');
  const query={};
  if(req.params.resource==='users'){query.role=roles.includes(filter)?filter:{$in:roles};if(filter==='suspended')query.isSuspended=true;}
  if(req.params.resource==='jobs')query.deletedAt=filter==='removed'?{$ne:null}:null;
  if(req.params.resource==='applications'&&['pending','accepted','rejected'].includes(filter))query.status=filter;
  if(req.params.resource==='contacts'&&['new','read','resolved'].includes(filter))query.$and=[filter==='new'?{$or:[{status:'new'},{status:{$exists:false}}]}:{status:filter}];
  if(search&&config.search.length)query.$or=config.search.map(field=>({[field]:{$regex:literal(search),$options:'i'}}));
  try {
    if(search&&req.params.resource==='applications'){
      const [users,jobs]=await Promise.all([User.find({$or:[{name:{$regex:literal(search),$options:'i'}},{email:{$regex:literal(search),$options:'i'}}]}).select('_id'),Job.find({title:{$regex:literal(search),$options:'i'}}).select('_id')]);
      query.$or=[{applicant:{$in:users.map(item=>item._id)}},{job:{$in:jobs.map(item=>item._id)}}];
    }
    let request=config.model.find(query).select(config.select).sort({createdAt:-1}).skip((page-1)*limit).limit(limit);
    for(const [path,select]of config.populate)request=request.populate(path,select);
    const [items,total]=await Promise.all([request,config.model.countDocuments(query)]);
    return res.json({success:true,items,total,page,totalPages:Math.max(1,Math.ceil(total/limit))});
  }catch{return fail(res,'Unable to load records. Please try again.',500);}
};
module.exports.get=async(req,res)=>{
  const config=Object.hasOwn(resources,req.params.resource)?resources[req.params.resource]:null;
  if(!config)return fail(res,'Resource not found.',404);
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return fail(res,'Invalid record ID.');
  try {
    let request=config.model.findById(req.params.id).select(config.select);
    for(const [path,select]of config.populate)request=request.populate(path,select);
    const item=await request;
    if(!item)return fail(res,'Record not found.',404);
    return res.json({success:true,item});
  }catch{return fail(res,'Unable to load this record.',500);}
};
module.exports.update=async(req,res)=>{
  const resource=req.params.resource,config=Object.hasOwn(resources,resource)?resources[resource]:null;if(!config)return fail(res,'Resource not found.',404);
  if(!mongoose.Types.ObjectId.isValid(req.params.id))return fail(res,'Invalid record ID.');
  const allowed={users:['name','email','isSuspended'],companies:['companyName','tagline','description','location','website','industry','contactEmail','companySize','foundedYear','linkedin','twitter','instagram','github','benefits'],jobs:['title','location','salary','jobType','requirement','description','department','workMode','experienceLevel','responsibilities','education','benefits','applicationDeadline','openings','deleted'],applications:['status'],contacts:['status']}[resource];
  const data={};
  for(const [key,value]of Object.entries(req.body)){
    if(!allowed.includes(key))return fail(res,`The field ${key} cannot be changed here.`);
    if(['isSuspended','deleted'].includes(key)){if(typeof value!=='boolean')return fail(res,'Invalid status.');data[key]=value;}
    else if(key==='openings'||key==='foundedYear'){const min=key==='openings'?1:1800,max=key==='openings'?1000:new Date().getFullYear();if(value!==''&&value!==null&&(!['number','string'].includes(typeof value)||!Number.isInteger(Number(value))||Number(value)<min||Number(value)>max))return fail(res,`Enter a valid ${key}.`);data[key]=value===''||value===null?null:Number(value);}
    else if(key==='requirement'){if(typeof value!=='string'||value.length>2000)return fail(res,'Enter valid requirements.');data[key]=[...new Set(value.split(',').map(item=>item.trim()).filter(Boolean))];if(!data[key].length)return fail(res,'Add at least one requirement.');}
    else {if(typeof value!=='string'||value.length>15000)return fail(res,'Enter valid text values.');data[key]=value.trim();}
  }
  if(!Object.keys(data).length)return fail(res,'No changes supplied.');
  for(const field of ['name','email','companyName','title'])if(data[field]!==undefined&&!data[field])return fail(res,`${field} is required.`);
  for(const field of ['email','contactEmail'])if(data[field]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[field]))return fail(res,'Enter a valid email address.');
  for(const field of ['website','linkedin','twitter','instagram','github'])if(data[field]){try{const url=new URL(data[field]);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error();}catch{return fail(res,'Enter a complete http or https URL.');}}
  if(data.applicationDeadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(data.applicationDeadline)||Number.isNaN(Date.parse(data.applicationDeadline))||new Date(data.applicationDeadline).toISOString().slice(0,10)!==data.applicationDeadline))return fail(res,'Enter a valid deadline.');
  if(resource==='applications'&&!['pending','accepted','rejected'].includes(data.status))return fail(res,'Invalid application status.');
  if(resource==='contacts'&&!['new','read','resolved'].includes(data.status))return fail(res,'Invalid enquiry status.');
  try {
    if(resource==='users'){
      const target=await User.findById(req.params.id).select('role');if(!target)return fail(res,'Account not found.',404);
      if(target.role==='admin'&&data.isSuspended!==undefined)return fail(res,'Admin accounts cannot be suspended here.',403);
      if(data.email)data.email=data.email.toLowerCase();
    }
    if(resource==='jobs'&&data.deleted!==undefined){data.deletedAt=data.deleted?new Date():null;delete data.deleted;}
    const item=await config.model.findByIdAndUpdate(req.params.id,{$set:data},{new:true,runValidators:true}).select(config.select);
    if(!item)return fail(res,'Record not found.',404);
    if(resource==='users'&&data.isSuspended===true)require('../socket').disconnectUser(req.params.id);
    return res.json({success:true,message:'Changes saved.'});
  }catch(error){return fail(res,error.code===11000?'This email address is already in use.':error.name==='ValidationError'?'Check the field values and try again.':'Unable to save changes. Please try again.',error.code===11000?409:error.name==='ValidationError'?400:500);}
};
