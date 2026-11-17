import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, MessageSquare, Search, Send, X } from "lucide-react";
import "./CompanyMessages.css";

const sampleConversations = [
  {id:"asha",name:"Asha Sharma",initials:"AS",role:"Frontend Developer",unread:0,time:"10:42 AM",messages:[
    {id:"a1",from:"candidate",text:"Hi! Thank you for considering my application. I would love to hear more about the frontend team.",time:"10:24 AM"},
    {id:"a2",from:"company",text:"Hi Asha, thanks for reaching out. Your React experience stood out to us. Could you tell us about a recent project you enjoyed?",time:"10:31 AM"},
    {id:"a3",from:"candidate",text:"Of course! I recently worked on an accessible dashboard with React and TypeScript. I focused on reusable components and keyboard navigation.",time:"10:42 AM"},
  ]},
  {id:"rohan",name:"Rohan Karki",initials:"RK",role:"Backend Developer",unread:2,time:"10:18 AM",messages:[
    {id:"r1",from:"company",text:"Hi Rohan, thank you for applying. Are you available for a conversation with our engineering team this week?",time:"10:02 AM"},
    {id:"r2",from:"candidate",text:"Thank you for getting in touch! Wednesday or Thursday afternoon would work well for me.",time:"10:15 AM"},
    {id:"r3",from:"candidate",text:"Happy to share more about the API project in my portfolio as well.",time:"10:18 AM"},
  ]},
  {id:"maya",name:"Maya Thapa",initials:"MT",role:"Product Designer",unread:1,time:"Yesterday",messages:[
    {id:"m1",from:"candidate",text:"Hello! I have submitted my application for the Product Designer role. My portfolio includes research, prototypes, and a recent design system project.",time:"3:20 PM"},
    {id:"m2",from:"company",text:"Thanks Maya. We look forward to reviewing your work.",time:"3:35 PM"},
    {id:"m3",from:"candidate",text:"Thank you! Please let me know if a walkthrough of any project would be useful.",time:"4:05 PM"},
  ]},
  {id:"kabir",name:"Kabir Rai",initials:"KR",role:"QA Automation Engineer",unread:0,time:"Yesterday",messages:[
    {id:"k1",from:"candidate",text:"Hi, I am interested in the QA Automation Engineer opening. Does the team primarily use Playwright for browser testing?",time:"11:10 AM"},
    {id:"k2",from:"company",text:"Hi Kabir. Yes, our browser tests use Playwright, alongside API and exploratory testing. We would be happy to hear about your experience.",time:"11:28 AM"},
  ]},
];

export const CompanyMessages = () => {
  const [conversations,setConversations] = useState(sampleConversations);
  const [selectedId,setSelectedId] = useState("asha");
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState("all");
  const [drafts,setDrafts] = useState({});
  const [threadOpen,setThreadOpen] = useState(false);
  const [announcement,setAnnouncement] = useState("");
  const historyRef = useRef(null);
  const threadHeadingRef = useRef(null);
  const composerRef = useRef(null);
  const sequenceRef = useRef(0);
  const selected = conversations.find(item=>item.id===selectedId);
  const unreadCount = conversations.filter(item=>item.unread>0).length;
  const visible = useMemo(()=>conversations.filter(item=>(filter!=="unread"||item.unread>0)&&`${item.name} ${item.role}`.toLowerCase().includes(query.trim().toLowerCase())),[conversations,filter,query]);
  const draft = drafts[selectedId] || "";
  useEffect(()=>{
    const composer=composerRef.current;
    if(composer){composer.style.height="auto";composer.style.height=`${Math.max(44,Math.min(composer.scrollHeight,112))}px`;}
  },[draft,selectedId,threadOpen]);
  useEffect(()=>{const history=historyRef.current;if(history)history.scrollTop=history.scrollHeight;},[selectedId,selected.messages.length]);
  useEffect(()=>{if(threadOpen && window.matchMedia("(max-width:767px)").matches)threadHeadingRef.current?.focus({preventScroll:true});},[threadOpen,selectedId]);
  const open = (id) => {
    setSelectedId(id);setThreadOpen(true);setAnnouncement("");
    setConversations(old=>old.map(item=>item.id===id?{...item,unread:0}:item));
  };
  const send = (event) => {
    event?.preventDefault();const text=draft.trim();if(!text)return;
    const message={id:`preview-${++sequenceRef.current}`,from:"company",text,time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}),preview:true};
    setConversations(old=>old.map(item=>item.id===selectedId?{...item,messages:[...item.messages,message],time:"Just now"}:item));
    setDrafts(old=>({...old,[selectedId]:""}));setAnnouncement("Message added to preview. It has not been delivered.");composerRef.current?.focus();
  };
  return <section className="cm-page">
    <h1 className="sr-only">Messages</h1>
    <div className={`cm-inbox ${threadOpen?"cm-thread-open":""}`}>
      <aside className="cm-conversations" aria-label="Candidate conversations">
        <div className="cm-list-heading"><div><h2>Inbox</h2><span>{conversations.length} conversations</span></div><p>Sample conversations</p></div>
        <div className="cm-search"><Search size={17} aria-hidden="true"/><label htmlFor="cm-search" className="sr-only">Search conversations</label><input id="cm-search" type="search" placeholder="Search name or role" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button type="button" aria-label="Clear conversation search" onClick={()=>setQuery("")}><X size={15} aria-hidden="true"/></button>}</div>
        <div className="cm-filters" aria-label="Conversation filters"><button type="button" aria-pressed={filter==="all"} onClick={()=>setFilter("all")}>All messages</button><button type="button" aria-pressed={filter==="unread"} onClick={()=>setFilter("unread")}>Unread{unreadCount>0&&<span>{unreadCount}</span>}</button></div>
        <div className="cm-conversation-list">{visible.length?visible.map(item=><button className={`cm-conversation ${selectedId===item.id?"is-selected":""}`} type="button" key={item.id} aria-pressed={selectedId===item.id} aria-label={`Open conversation with ${item.name}${item.unread?`, ${item.unread} unread messages`:""}`} onClick={()=>open(item.id)}><span className="cm-avatar" aria-hidden="true">{item.initials}</span><span className="cm-conversation-copy"><span className="cm-conversation-top"><strong>{item.name}</strong><small>{item.time}</small></span><span className="cm-conversation-role">{item.role}</span><span className="cm-conversation-bottom"><span>{item.messages.at(-1).text}</span>{item.unread>0&&<b>{item.unread}</b>}</span></span></button>):<div className="cm-empty"><MessageSquare size={26} aria-hidden="true"/><h3>{query?"No conversations found":"You are all caught up."}</h3><p>{query?"Try another name or job title.":"There are no unread conversations."}</p><button type="button" onClick={()=>{setQuery("");setFilter("all");}}>Show all conversations</button></div>}</div>
      </aside>
      <div className="cm-thread" aria-label={`Conversation with ${selected.name}`}>
        <header className="cm-thread-heading"><button className="cm-back" type="button" aria-label="Back to conversations" onClick={()=>{setThreadOpen(false);requestAnimationFrame(()=>(document.querySelector(`.cm-conversation[aria-pressed="true"]`) || document.getElementById("cm-search"))?.focus());}}><ArrowLeft size={20} aria-hidden="true"/></button><span className="cm-avatar" aria-hidden="true">{selected.initials}</span><div><h2 ref={threadHeadingRef} tabIndex={-1}>{selected.name}</h2><p>Sample candidate</p></div></header>
        <div className="cm-role-context"><BriefcaseBusiness size={16} aria-hidden="true"/><span>Regarding <strong>{selected.role}</strong></span></div>
        <div className="cm-history" ref={historyRef} tabIndex={0} aria-label="Message history"><ol>{selected.messages.map(message=><li key={message.id} className={`cm-message ${message.from==="company"?"cm-outgoing":""}`}><p className="sr-only">{message.from==="company"?"You":selected.name}</p><p className="cm-bubble">{message.text}</p><span className="cm-message-time">{message.time}{message.preview&&" · Preview"}</span></li>)}</ol></div>
        <form className="cm-composer" onSubmit={send}><div className="cm-compose-box"><label htmlFor="cm-message" className="sr-only">Write a message</label><textarea id="cm-message" ref={composerRef} rows={1} maxLength={2000} value={draft} placeholder="Write a message..." onChange={event=>setDrafts(old=>({...old,[selectedId]:event.target.value}))} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.nativeEvent.isComposing){event.preventDefault();send();}}}/><button type="submit" aria-label="Add message to preview" disabled={!draft.trim()}><Send size={18} aria-hidden="true"/></button></div><div className="cm-composer-note"><span>Preview only. Messages are not delivered.</span><span>{draft.length}/2000</span></div></form>
      </div>
    </div><span className="sr-only" role="status">{announcement}</span>
  </section>;
};
