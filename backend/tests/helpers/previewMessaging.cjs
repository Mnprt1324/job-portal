// Isolated browser-review server. Never connects to the project's configured database.
const fs=require('node:fs');
const path=require('node:path');
const {fixture}=require('./messagingFixture.cjs');
const service=require('../../services/messaging.service');
const {randomUUID}=require('node:crypto');
(async()=>{
  const f=await fixture(7001);
  const company={_id:f.company.id,role:'company'},seeker={_id:f.seeker.id,role:'jobseeker'};
  const conversation=await service.create(f.application.id,company);
  await service.send(conversation._id,company,{content:'Hi Asha, thanks for applying. Your React experience stood out. Would you be available to chat about the role?',clientMessageId:randomUUID()});
  await service.send(conversation._id,seeker,{content:'Thank you! I would love to hear more about the team and the projects you are working on.',clientMessageId:randomUUID()});
  const publicUser=user=>({_id:user.id,name:user.name,email:user.email,role:user.role,profile:{}});
  const output=path.resolve(__dirname,'../../../output/playwright');fs.mkdirSync(output,{recursive:true});
  fs.writeFileSync(path.join(output,'messaging-fixture.json'),JSON.stringify({company:{user:publicUser(f.company),token:`Bearer ${f.token(f.company)}`},seeker:{user:publicUser(f.seeker),token:`Bearer ${f.token(f.seeker)}`},conversationId:String(conversation._id),jobId:f.job.id,applicationId:f.application.id}));
  console.log('Isolated messaging preview ready at http://127.0.0.1:7001');
  process.on('SIGINT',async()=>{await f.close();process.exit(0);});
})().catch(error=>{console.error(error.message);process.exit(1);});
