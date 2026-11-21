const {Server}=require('socket.io');
const {verifySession}=require('../services/session.service');
const messaging=require('../services/messaging.service');
const {consume}=require('../middleware/messageLimit');
let io;
const room=id=>`user:${id}`;
function publish(conversation,event,payload){
  io?.to(room(conversation.companyUserId)).to(room(conversation.jobseekerUserId)).emit(event,payload);
}
function publishToUser(userId,event,payload){ io?.to(room(userId)).emit(event,payload); }
function initialize(server){
  io=new Server(server,{cors:{origin:process.env.FRONT_URL,credentials:true},maxHttpBufferSize:16384,
    allowRequest:(req,done)=>done(null,!req.headers.origin||req.headers.origin===process.env.FRONT_URL)});
  io.use(async(socket,next)=>{
    try{
      const token=socket.handshake.auth?.token;
      socket.data.token=typeof token==='string'?token.replace(/^Bearer /,''):'';
      socket.data.user=await verifySession(socket.data.token);
      messaging.participantFilter(socket.data.user);next();
    }catch{next(new Error('Authentication required.'));}
  });
  io.on('connection',socket=>{
    const user=socket.data.user;socket.join(room(user._id));
    const expiry=setTimeout(()=>socket.disconnect(true),Math.max(0,user.expiresAt-Date.now()));expiry.unref?.();
    // Recheck live suspension/role even for idle subscribed sockets.
    const validation=setInterval(async()=>{try{await verifySession(socket.data.token);}catch{socket.disconnect(true);}},15000);validation.unref?.();
    let typingTimer;
    const stopTyping=()=>{
      if(socket.data.active)socket.to(`conversation:${socket.data.active}`).emit('typing:changed',{conversationId:socket.data.active,userId:user._id,typing:false});
      clearTimeout(typingTimer);
    };
    socket.on('conversation:join',async(id,ack=()=>{})=>{
      try{
        consume(`join:${user._id}`,120);await verifySession(socket.data.token);await messaging.member(id,user);
        stopTyping();if(socket.data.active)socket.leave(`conversation:${socket.data.active}`);
        socket.data.active=String(id);socket.join(`conversation:${id}`);ack({success:true});
      }catch{ack({success:false});}
    });
    socket.on('conversation:leave',()=>{stopTyping();if(socket.data.active)socket.leave(`conversation:${socket.data.active}`);socket.data.active=null;});
    socket.on('typing:change',async({conversationId,typing}={})=>{
      try{
        consume(`typing:${user._id}`,60);await verifySession(socket.data.token);
        if(String(conversationId)!==socket.data.active)return;
        const c=await messaging.member(conversationId,user);if(await messaging.availability(c))return;
        clearTimeout(typingTimer);
        socket.to(`conversation:${conversationId}`).emit('typing:changed',{conversationId,userId:user._id,typing:typing===true});
        if(typing)typingTimer=setTimeout(stopTyping,3500);
      }catch{/* Ephemeral events can be dropped. */}
    });
    socket.on('disconnect',()=>{stopTyping();clearTimeout(expiry);clearInterval(validation);});
  });
  return io;
}
function disconnectUser(id){io?.in(room(id)).disconnectSockets(true);}
module.exports={initialize,publish,publishToUser,disconnectUser};
