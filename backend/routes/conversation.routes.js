const router=require('express').Router();
const {authenticate}=require('../middleware/auth');
const service=require('../services/messaging.service');
const {publish}=require('../socket');
const {consume}=require('../middleware/messageLimit');
router.use(authenticate,(req,res,next)=>{res.set('Cache-Control','private, no-store');try{service.participantFilter(req.user);consume(`chat:${req.user._id}`,240);next();}catch(error){next(error);}});
const wrap=handler=>async(req,res,next)=>{try{await handler(req,res);}catch(error){next(error);}};
router.post('/',wrap(async(req,res)=>{
  consume(`create:${req.user._id}`,30);
  const conversation=await service.create(req.body.applicationId,req.user);
  publish(conversation,'conversation:updated',{conversationId:conversation._id});
  res.json({success:true,conversation});
}));
router.get('/',wrap(async(req,res)=>res.json({success:true,...await service.list(req.user,req.query)})));
router.get('/unread',wrap(async(req,res)=>res.json({success:true,unread:await service.unread(req.user)})));
router.get('/:id/messages',wrap(async(req,res)=>res.json({success:true,...await service.history(req.params.id,req.user,req.query)})));
router.post('/:id/messages',wrap(async(req,res)=>{
  consume(`send:${req.user._id}`,40);consume(`thread:${req.user._id}:${req.params.id}`,30);
  const result=await service.send(req.params.id,req.user,req.body);
  if(result.created){publish(result.conversation,'message:created',result.message);publish(result.conversation,'conversation:updated',{conversationId:req.params.id});}
  res.status(result.created?201:200).json({success:true,message:result.message});
}));
router.patch('/:id/read',wrap(async(req,res)=>{
  const result=await service.markRead(req.params.id,req.user,req.body.throughSequence);
  publish(result.conversation,'conversation:read',{conversationId:req.params.id,userId:result.userId,throughSequence:result.throughSequence});
  res.json({success:true,throughSequence:result.throughSequence});
}));
router.use((error,req,res,next)=>{
  if(res.headersSent)return next(error);
  const status=error.status||(['CastError','ValidationError'].includes(error.name)?400:500);
  if(status===429)res.set('Retry-After','60');
  res.status(status).json({success:false,message:status===500?'Messaging is unavailable. Please try again.':error.message});
});
module.exports=router;
