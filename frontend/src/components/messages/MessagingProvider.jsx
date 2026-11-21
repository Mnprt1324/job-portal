import {useEffect,useState} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {io} from 'socket.io-client';
import PropTypes from 'prop-types';
import {messagesApi} from '../../redux/messagesApi';
import {notificationsApi} from '../../redux/notificationsApi';
import {toast} from 'react-toastify';
import {MessagingContext} from './MessagingContext';
import { redirectForExpiredSession } from '../../utils/sessionExpiry';
export function MessagingProvider({children}){
  const user=useSelector(state=>state.auth.user),dispatch=useDispatch();
  const [connection,setConnection]=useState({socket:null,connected:false,epoch:0});
  const userId=user?._id,role=user?.role;
  useEffect(()=>{
    dispatch(messagesApi.util.resetApiState());
    if(!userId||!['company','jobseeker'].includes(role))return;
    const socket=io(new URL(import.meta.env.VITE_BASE_URL||location.origin,location.origin).origin,{autoConnect:false,auth:cb=>cb({token:localStorage.getItem('token')||''})});
    const refresh=()=>dispatch(messagesApi.util.invalidateTags(['Inbox','Unread']));
    const refreshNotifications=(notification)=>{dispatch(notificationsApi.util.invalidateTags(['Notifications','NotificationUnread']));if(notification?.title)toast.info(notification.title);};
    socket.on('connect',()=>{setConnection(previous=>({socket,owner:userId,connected:true,epoch:previous.epoch+1}));refresh();});
    const offline=()=>setConnection(previous=>({...previous,socket,owner:userId,connected:false}));
    const socketFailure=(error)=>{
      offline();
      if (/authentication required|invalid or expired token/i.test(error?.message || '')) redirectForExpiredSession();
    };
    socket.on('disconnect',offline);socket.on('connect_error',socketFailure);
    socket.on('message:created',refresh);socket.on('conversation:updated',refresh);socket.on('conversation:read',refresh);
    socket.on('notification:created',refreshNotifications);socket.on('notification:read',()=>dispatch(notificationsApi.util.invalidateTags(['Notifications','NotificationUnread'])));
    socket.connect();
    const focus=()=>{refresh();if(!socket.connected)socket.connect();};
    window.addEventListener('focus',focus);
    return()=>{window.removeEventListener('focus',focus);socket.removeAllListeners();socket.disconnect();dispatch(messagesApi.util.resetApiState());dispatch(notificationsApi.util.resetApiState());};
  },[userId,role,dispatch]);
  const active=userId&&['company','jobseeker'].includes(role);
  return <MessagingContext.Provider value={active&&connection.owner===userId?connection:{socket:null,connected:false,epoch:0}}>{children}</MessagingContext.Provider>;
}
MessagingProvider.propTypes={children:PropTypes.node.isRequired};
