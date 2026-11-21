const http=require('node:http');
const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const {MongoMemoryReplSet}=require('mongodb-memory-server');
const User=require('../../models/user.model');
const Company=require('../../models/company.model');
const Job=require('../../models/job.model');
const Application=require('../../models/application.model');
const Conversation=require('../../models/conversation.model');
const Message=require('../../models/message.model');
async function fixture(port=0){
  process.env.JWT_SECRET='isolated-messaging-test-only-secret';
  process.env.FRONT_URL=process.env.MESSAGING_PREVIEW_ORIGIN||'http://localhost:5173';
  const replica=await MongoMemoryReplSet.create({replSet:{count:1}});
  await mongoose.connect(replica.getUri(),{dbName:'messaging_test'});
  await Promise.all([User.init(),Company.init(),Job.init(),Application.init(),Conversation.init(),Message.init()]);
  const [company,seeker,outsider,otherCompany,admin]=await User.create([
    {name:'Northstar hiring',email:'company@example.test',password:'test-only',role:'company'},
    {name:'Asha Sharma',email:'asha@example.test',password:'test-only',role:'jobseeker'},
    {name:'Other seeker',email:'other@example.test',password:'test-only',role:'jobseeker'},
    {name:'Other company',email:'othercompany@example.test',password:'test-only',role:'company'},
    {name:'Admin',email:'admin@example.test',password:'test-only',role:'admin'},
  ]);
  const profile=await Company.create({companyName:'Northstar Studio',location:'Remote',createdByUserId:company._id});
  const job=await Job.create({title:'Frontend Developer',company:profile._id,postedBy:company._id,location:'Remote',description:'Build thoughtful, accessible products.',jobType:'Full-time',requirement:['React']});
  const application=await Application.create({job:job._id,applicant:seeker._id});
  job.applicants=[application._id];await job.save();
  const app=express();app.use(cors({origin:process.env.FRONT_URL}));app.use(express.json({limit:'16kb'}));
  app.use('/conversations',require('../../routes/conversation.routes'));
  app.use('/applications',require('../../routes/application.routes'));
  app.use('/job',require('../../routes/job.routes'));
  app.use('/company',require('../../routes/company.routes'));
  const server=http.createServer(app),io=require('../../socket').initialize(server);
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const token=user=>jwt.sign({_id:String(user._id),role:user.role},process.env.JWT_SECRET,{expiresIn:'1h'});
  const request=async(user,path,method='GET',body)=>{
    const response=await fetch(`${base}${path}`,{method,headers:{...(user?{Authorization:`Bearer ${token(user)}`}:{ }),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    return {status:response.status,body:await response.json()};
  };
  const close=async()=>{io.disconnectSockets(true);await new Promise(resolve=>io.close(resolve));await mongoose.disconnect();await replica.stop();};
  return {company,seeker,outsider,otherCompany,admin,profile,job,application,request,token,io,base,close};
}
module.exports={fixture};
