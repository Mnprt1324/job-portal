import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {useState} from 'react';
import {MessageSquare} from 'lucide-react';
import PropTypes from 'prop-types';
import {useCreateConversationMutation} from '../../redux/messagesApi';
import './Messages.css';
export function MessageApplicationButton({applicationId}){
  const [create,{isLoading}]=useCreateConversationMutation(),[error,setError]=useState('');
  const role=useSelector(state=>state.auth.user?.role),navigate=useNavigate();
  const open=async()=>{setError('');try{const {conversation}=await create(applicationId).unwrap();navigate(`/${role}/messages?conversation=${conversation._id}`);}catch(e){setError(e.data?.message||'Unable to start conversation. Try again.');}};
  return <div className="chat-start"><button type="button" className="btn-secondary" onClick={open} disabled={isLoading}><MessageSquare size={16} aria-hidden="true"/>{isLoading?'Opening…':role==='company'?'Message candidate':'Message company'}</button>{error&&<p role="alert" className="chat-error">{error}</p>}</div>;
}
MessageApplicationButton.propTypes={applicationId:PropTypes.string.isRequired};
