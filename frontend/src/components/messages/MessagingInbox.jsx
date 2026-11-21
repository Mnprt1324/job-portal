import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useSelector} from 'react-redux';
import {Link,useSearchParams} from 'react-router-dom';
import PropTypes from 'prop-types';
import {ArrowLeft,BriefcaseBusiness,MessageSquare,Search,Send} from 'lucide-react';
import {useConversationsQuery,useLazyConversationsQuery,useLazyHistoryQuery,useSendMessageMutation,useReadConversationMutation} from '../../redux/messagesApi';
import {useMessaging} from './MessagingContext';
import '../../pages/company/CompanyMessages.css';
import './Messages.css';

const merge=(previous,next)=>{
  const values=new Map(previous.map(m=>[m.clientMessageId,m]));
  for(const message of next){const old=values.get(message.clientMessageId);if(!old?.sequence||message.sequence)values.set(message.clientMessageId,message);}
  return [...values.values()].sort((a,b)=>(a.sequence||Number.MAX_SAFE_INTEGER)-(b.sequence||Number.MAX_SAFE_INTEGER));
};
const time=value=>new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const errorText=error=>error?.data?.message||'Unable to load messages. Please try again.';
const initial=name=>(name||'?').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();

export function MessagingInbox(){
  const user=useSelector(state=>state.auth.user);
  return <InboxSession key={user._id} user={user}/>;
}
function InboxSession({user}){
  const [params,setParams]=useSearchParams(),id=params.get('conversation');
  const {socket,connected,epoch}=useMessaging();
  const {data:list,isLoading:listLoading,isError:listError,refetch}=useConversationsQuery(undefined,{pollingInterval:20000});
  const [getMore]=useLazyConversationsQuery(),[getHistory]=useLazyHistoryQuery(),[sendMessage]=useSendMessageMutation(),[markRead]=useReadConversationMutation();
  const [extra,setExtra]=useState([]),[moreCursor,setMoreCursor]=useState(null),[loadingMore,setLoadingMore]=useState(false);
  const [search,setSearch]=useState(''),[unreadOnly,setUnreadOnly]=useState(false),[listMoreError,setListMoreError]=useState('');
  const [messages,setMessages]=useState([]),[conversation,setConversation]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[hasOlder,setHasOlder]=useState(false),[olderLoading,setOlderLoading]=useState(false),[typing,setTyping]=useState(false),[newMessages,setNewMessages]=useState(false);
  const [drafts,setDrafts]=useState({});
  const historyRef=useRef(null),messageRef=useRef([]),activeRef=useRef(id),nearBottom=useRef(true),scrollBottom=useRef(true),restoreHeight=useRef(null),readPosition=useRef(0),readPending=useRef(false),typingAt=useRef(0),textareaRef=useRef(null),loadVersion=useRef(0),syncedSequence=useRef(0),initialized=useRef(false);
  activeRef.current=id;
  const draft=drafts[id]||'';
  const all=[...new Map([...extra,...(list?.conversations||[])].map(c=>[c._id,c])).values()].sort((a,b)=>new Date(b.lastMessageAt)-new Date(a.lastMessageAt));
  const filtered=all.filter(c=>(!unreadOnly||c.unread>0)&&`${c.partnerName} ${c.jobTitle}`.toLowerCase().includes(search.toLowerCase()));
  const applyMessages=useCallback((incoming)=>{setMessages(previous=>{const next=merge(previous,incoming);messageRef.current=next;return next;});},[]);
  useEffect(()=>{setMoreCursor(null);},[list?.nextCursor]);
  const refreshHistory=useCallback(async(initialLoad=false)=>{
    if(!id)return;
    const version=loadVersion.current;
    try{
      if(!initialLoad&&!initialized.current)return;
      let after=initialLoad?undefined:syncedSequence.current;
      let result;
      do{
        result=await getHistory({id,...(after===undefined?{}:{afterSequence:after}),limit:initialLoad?30:100},false).unwrap();
        if(activeRef.current!==id||version!==loadVersion.current)return;
        applyMessages(result.messages);setConversation(previous=>({...result.conversation,companyLastReadSequence:Math.max(previous?.companyLastReadSequence||0,result.conversation.companyLastReadSequence),jobseekerLastReadSequence:Math.max(previous?.jobseekerLastReadSequence||0,result.conversation.jobseekerLastReadSequence)}));setError('');
        syncedSequence.current=result.messages.at(-1)?.sequence??(initialLoad?result.conversation.lastSequence:after);initialized.current=true;
        if(initialLoad){setHasOlder(result.hasMore);break;}
        after=result.messages.at(-1)?.sequence||after;
      }while(result.hasMore);
    }catch(e){if(activeRef.current===id&&version===loadVersion.current)setError(errorText(e));}
    finally{if(activeRef.current===id&&version===loadVersion.current)setLoading(false);}
  },[id,getHistory,applyMessages]);
  useEffect(()=>{
    loadVersion.current++;syncedSequence.current=0;initialized.current=false;messageRef.current=[];setMessages([]);setConversation(null);setError('');setTyping(false);setNewMessages(false);setHasOlder(false);readPosition.current=0;readPending.current=false;nearBottom.current=true;scrollBottom.current=true;restoreHeight.current=null;
    if(id){setLoading(true);refreshHistory(true);}else setLoading(false);
  },[id,refreshHistory]);
  useEffect(()=>{
    if(!id)return;
    socket?.emit('conversation:join',id);
    const incoming=message=>{
      if(message.conversationId!==id)return;
      if(nearBottom.current||message.senderId===user._id)scrollBottom.current=true;else setNewMessages(true);
      applyMessages([message]);
    };
    const read=event=>{if(event.conversationId===id)setConversation(c=>c?{...c,[String(event.userId)===String(c.companyUserId)?'companyLastReadSequence':'jobseekerLastReadSequence']:event.throughSequence}:c);};
    const typingChanged=event=>{if(event.conversationId===id&&event.userId!==user._id)setTyping(event.typing);};
    socket?.on('message:created',incoming);socket?.on('conversation:read',read);socket?.on('typing:changed',typingChanged);
    // The initial request loads the latest page. Reconnects catch up from known sequence.
    if(initialized.current)refreshHistory();
    const poll=setInterval(()=>refreshHistory(),15000);
    const focus=()=>refreshHistory();window.addEventListener('focus',focus);
    return()=>{clearInterval(poll);window.removeEventListener('focus',focus);socket?.off('message:created',incoming);socket?.off('conversation:read',read);socket?.off('typing:changed',typingChanged);socket?.emit('conversation:leave');};
  },[id,socket,epoch,refreshHistory,applyMessages,user._id]);
  useEffect(()=>{if(!typing)return;const timer=setTimeout(()=>setTyping(false),4000);return()=>clearTimeout(timer);},[typing]);
  const readVisible=useCallback(async()=>{
    if(!id||!conversation||!nearBottom.current||document.visibilityState!=='visible'||!document.hasFocus()||readPending.current)return;
    const through=Math.max(0,...messageRef.current.map(m=>m.sequence||0));
    if(through<=readPosition.current)return;
    readPending.current=true;
    try{await markRead({id,throughSequence:through}).unwrap();if(activeRef.current===id)readPosition.current=Math.max(readPosition.current,through);}catch{/* Retry on focus, new messages or next refresh. */}
    finally{if(activeRef.current===id)readPending.current=false;}
  },[id,conversation,markRead]);
  useLayoutEffect(()=>{
    const el=historyRef.current;if(!el)return;
    if(restoreHeight.current!==null){el.scrollTop+=el.scrollHeight-restoreHeight.current;restoreHeight.current=null;}
    else if(scrollBottom.current){el.scrollTop=el.scrollHeight;scrollBottom.current=false;nearBottom.current=true;setNewMessages(false);}
    readVisible();
  },[messages,readVisible]);
  useEffect(()=>{window.addEventListener('focus',readVisible);document.addEventListener('visibilitychange',readVisible);return()=>{window.removeEventListener('focus',readVisible);document.removeEventListener('visibilitychange',readVisible);};},[readVisible]);
  useLayoutEffect(()=>{if(textareaRef.current){textareaRef.current.style.height='44px';textareaRef.current.style.height=`${Math.min(112,textareaRef.current.scrollHeight)}px`;}},[draft,id]);
  const send=async(message)=>{
    if(!id||!conversation||loading||conversation.readOnlyReason)return;
    const currentId=id;
    const pending=message||{conversationId:id,senderId:user._id,clientMessageId:crypto.randomUUID(),content:draft.trim(),createdAt:new Date().toISOString(),status:'pending'};
    if(!pending.content)return;
    if(!message)setDrafts(previous=>({...previous,[id]:''}));
    scrollBottom.current=true;applyMessages([{...pending,status:'pending'}]);socket?.emit('typing:change',{conversationId:id,typing:false});
    try{const result=await sendMessage({id,content:pending.content,clientMessageId:pending.clientMessageId}).unwrap();if(activeRef.current===currentId)applyMessages([result.message]);}
    catch(e){if(activeRef.current===currentId)applyMessages([{...pending,status:'failed',error:errorText(e)}]);}
  };
  const older=async()=>{
    const currentId=id;setOlderLoading(true);
    try{const before=Math.min(...messageRef.current.filter(m=>m.sequence).map(m=>m.sequence));const result=await getHistory({id,beforeSequence:before,limit:30},false).unwrap();if(activeRef.current!==currentId)return;restoreHeight.current=historyRef.current?.scrollHeight??null;setHasOlder(result.hasMore);applyMessages(result.messages);}
    catch(e){if(activeRef.current===currentId)setError(errorText(e));}finally{setOlderLoading(false);}
  };
  const loadMore=async()=>{
    setLoadingMore(true);setListMoreError('');try{const result=await getMore({cursor:moreCursor||list.nextCursor},false).unwrap();setExtra(previous=>[...previous,...result.conversations]);setMoreCursor(result.nextCursor||'end');}catch(e){setListMoreError(errorText(e));}finally{setLoadingMore(false);}
  };
  const counterpartRead=conversation?.[user.role==='company'?'jobseekerLastReadSequence':'companyLastReadSequence']||0;
  return <section className={`cm-page ${id?'cm-thread-open':''}`} aria-label="Messages">
    <div className="cm-inbox">
      <aside className="cm-conversations" aria-label="Conversations">
        <div className="cm-list-heading"><div><h1>Inbox</h1><span>{all.length} conversations</span></div><p role="status">{connected?'Live updates connected':'Reconnecting · messages refresh automatically'}</p></div>
        <label className="cm-search"><Search size={17}/><input aria-label="Search conversations" placeholder="Search name or role" value={search} maxLength={100} onChange={e=>setSearch(e.target.value)}/></label>
        <div className="cm-filters"><button type="button" aria-pressed={!unreadOnly} onClick={()=>setUnreadOnly(false)}>All messages</button><button type="button" aria-pressed={unreadOnly} onClick={()=>setUnreadOnly(true)}>Unread</button></div>
        <div className="cm-conversation-list">
          {listLoading?<Skeletons/>:listError?<div className="cm-empty" role="alert"><p>Could not load your inbox.</p><button onClick={refetch}>Try again</button></div>:<>
            {filtered.map(c=><button key={c._id} type="button" className={`cm-conversation ${id===c._id?'is-selected':''}`} aria-current={id===c._id?'true':undefined} onClick={()=>setParams({conversation:c._id})}><span className="cm-avatar" aria-hidden="true">{initial(c.partnerName)}</span><span className="cm-conversation-copy"><span className="cm-conversation-top"><strong>{c.partnerName}</strong><small>{time(c.lastMessageAt)}</small></span><span className="cm-conversation-role">{c.jobTitle}</span><span className="cm-conversation-bottom"><span>{c.lastMessagePreview||'Start the conversation'}</span>{c.unread>0&&<b aria-label={`${c.unread} unread`}>{c.unread}</b>}</span></span></button>)}
            {!filtered.length&&<div className="cm-empty"><MessageSquare size={26}/><h3>{search||unreadOnly?'No matching conversations':'Your conversations start here.'}</h3><p>Message from an application to connect about a role.</p><Link className="text-link" to={user.role==='company'?'/company/jobs':'/jobseeker/applications'}>{user.role==='company'?'View your jobs':'View applications'}</Link></div>}
            {(moreCursor!=='end'&&(moreCursor||list?.nextCursor))&&<button className="cm-load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore?'Loading…':'Load more conversations'}</button>}
            {listMoreError&&<p role="alert" className="chat-error">{listMoreError}</p>}
          </>}
        </div>
      </aside>
      <div className="cm-thread">
        {!id?<div className="cm-empty cm-thread-placeholder"><MessageSquare size={32}/><h2>A direct line to your next chapter.</h2><p>Select a conversation to continue.</p></div>:<>
          <header className="cm-thread-heading"><button className="cm-back" onClick={()=>setParams({})} aria-label="Back to inbox"><ArrowLeft size={20}/></button><span className="cm-avatar" aria-hidden="true">{initial(conversation?.partnerName)}</span><div><h2>{conversation?.partnerName||'Conversation'}</h2><p>{typing?'Typing…':user.role==='company'?'Jobseeker':'Company'}</p></div></header>
          <div className="cm-role-context"><BriefcaseBusiness size={16}/><span>Regarding <strong>{conversation?.jobTitle||'your application'}</strong></span></div>
          {error&&<div className="cm-inline-error" role="alert">{error}<button onClick={()=>refreshHistory(!messages.length)}>Try again</button></div>}
          <div ref={historyRef} className="cm-history" tabIndex={0} aria-label="Message history" onScroll={()=>{const el=historyRef.current;nearBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<65;if(nearBottom.current){setNewMessages(false);readVisible();}}}>
            {loading?<Skeletons/>:<><div className="cm-history-actions">{hasOlder&&<button onClick={older} disabled={olderLoading}>{olderLoading?'Loading…':'Load older messages'}</button>}</div>
            {!messages.length&&!error&&<div className="cm-empty"><h3>Say hello.</h3><p>Ask a question or introduce yourself about this opportunity.</p></div>}
            <ol>{messages.map(message=><li key={message.clientMessageId} className={`cm-message ${message.senderId===user._id?'cm-outgoing':''}`}><p className="cm-bubble">{message.content}</p><span className="cm-message-time">{time(message.createdAt)}{message.senderId===user._id&&` · ${message.status==='pending'?'Sending…':message.status==='failed'?'Not sent':message.sequence<=counterpartRead?'Read':'Saved'}`}</span>{message.status==='failed'&&<div className="cm-send-error" role="alert"><span>{message.error}</span><button onClick={()=>send(message)}>Retry</button></div>}</li>)}</ol></>}
          </div>
          {newMessages&&<button className="cm-new-messages" onClick={()=>{historyRef.current.scrollTop=historyRef.current.scrollHeight;nearBottom.current=true;setNewMessages(false);readVisible();}}>New messages ↓</button>}
          <form className="cm-composer" onSubmit={event=>{event.preventDefault();send();}}>
            {conversation?.readOnlyReason?<p className="cm-read-only">{conversation.readOnlyReason}</p>:<>
              <div className="cm-compose-box"><label className="sr-only" htmlFor="message-content">Message</label><textarea id="message-content" ref={textareaRef} rows={1} value={draft} maxLength={2000} disabled={!conversation||loading} placeholder={conversation?`Message ${conversation.partnerName}…`:'Loading conversation…'} onChange={e=>{setDrafts(previous=>({...previous,[id]:e.target.value}));if(Date.now()-typingAt.current>1200){socket?.emit('typing:change',{conversationId:id,typing:true});typingAt.current=Date.now();}}} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send();}}}/><button type="submit" aria-label="Send message" disabled={!draft.trim()||!conversation||loading}><Send size={19}/></button></div>
              <div className="cm-composer-note"><span>Enter to send · Shift + Enter for a new line</span><span>{draft.length}/2000</span></div>
            </>}
          </form>
        </>}
      </div>
    </div>
  </section>;
}
InboxSession.propTypes={user:PropTypes.object.isRequired};
function Skeletons(){return <div className="cm-skeletons" role="status" aria-label="Loading messages">{[1,2,3,4].map(n=><div className="cm-skeleton" key={n}><span/><span/></div>)}</div>;}
