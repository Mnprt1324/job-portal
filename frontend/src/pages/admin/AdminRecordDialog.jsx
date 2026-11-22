import { useEffect,useMemo,useRef,useState } from 'react';
import DOMPurify from 'dompurify';
import { BriefcaseBusiness,Building2,CalendarDays,Check,FileText,Loader2,MapPin,X } from 'lucide-react';
import PropTypes from 'prop-types';
import { updateAdminRecordApi } from '../../API/api';
import { adminConfig,detailRows,recordTitle } from './adminConfig';
const safeUrl=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}};
const dateLabel=value=>{const date=new Date(value);return value&&!Number.isNaN(date.getTime())?date.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'Not specified';};
const salaryLabel=value=>value!==undefined&&value!==null&&String(value).trim()!==''?(Number.isFinite(Number(value))?Number(value).toLocaleString('en-IN'):String(value)):'Not disclosed';
const JobRecordDetails=({job})=>{
 const [expanded,setExpanded]=useState(false);
 const company=job.company&&typeof job.company==='object'?job.company:null;
 const companyName=company?.companyName||'Company details unavailable';
 const requirements=Array.isArray(job.requirement)?job.requirement.filter(value=>typeof value==='string'&&value.trim()):[];
 const rawDescription=job.description||'A description has not been provided for this role.';
 const richDescription=useMemo(()=>DOMPurify.sanitize(job.descriptionHtml||`<p>${rawDescription}</p>`,{ALLOWED_TAGS:['p','br','strong','b','em','i','ul','ol','li','h2','h3','h4','a','blockquote'],ALLOWED_ATTR:['href','target','rel']}),[job.descriptionHtml,rawDescription]);
 const longDescription=(job.descriptionHtml?.length||rawDescription.length)>1200;
 const details=[['Work arrangement',job.workMode],['Experience level',job.experienceLevel],['Department',job.department],['Openings',job.openings],['Apply by',job.applicationDeadline?dateLabel(`${job.applicationDeadline}T00:00:00`):null]].filter(([,value])=>value!==undefined&&value!==null&&value!=='');
 const sections=[['Key responsibilities',job.responsibilities],['Education & qualifications',job.education],['Benefits & perks',job.benefits]].filter(([,value])=>value&&value!==job.description);
 const website=safeUrl(company?.website);
 return <div className="ad-job-detail">
   <header className="ad-job-hero">
     <div className="ad-job-company-line"><span className="ad-job-company-mark" aria-hidden="true">{company?.logo?<img src={company.logo} alt="" onError={event=>{event.currentTarget.style.display='none';}}/>:<span>{companyName.slice(0,1)}</span>}</span><div><span className="ad-job-company-name">{companyName}</span><span className="ad-job-posted">Posted {dateLabel(job.createdAt)}</span></div><span className="ad-badge">{job.jobType||'Job type not specified'}</span></div>
     <h3>{job.title||'Untitled role'}</h3>
     <div className="ad-job-meta"><span><MapPin size={16} aria-hidden="true"/>{job.location||'Location not specified'}</span><span><FileText size={16} aria-hidden="true"/>{requirements.length?`${requirements.length} listed ${requirements.length===1?'requirement':'requirements'}`:'See role details'}</span></div>
   </header>
   <div className="ad-job-layout">
     <div className="ad-job-main">
       <section className="ad-job-section"><div className="ad-job-section-heading"><span><FileText size={18} aria-hidden="true"/></span><h4>About this role</h4></div><div className={`ad-job-description ${expanded?'is-expanded':''}`} dangerouslySetInnerHTML={{__html:richDescription}}/>{longDescription&&<button type="button" className="ad-job-description-toggle" onClick={()=>setExpanded(value=>!value)}>{expanded?'Show less':'Read full description'}</button>}</section>
       <section className="ad-job-section"><div className="ad-job-section-heading"><span><BriefcaseBusiness size={18} aria-hidden="true"/></span><h4>Skills & requirements</h4></div>{requirements.length?<ul className="ad-job-requirements">{requirements.map((requirement,index)=><li key={`${requirement}-${index}`}><Check size={16} aria-hidden="true"/>{requirement}</li>)}</ul>:<p className="ad-job-copy">No specific requirements have been listed.</p>}</section>
       {sections.map(([label,value])=><section className="ad-job-section" key={label}><div className="ad-job-section-heading"><span><FileText size={18} aria-hidden="true"/></span><h4>{label}</h4></div><p className="ad-job-copy">{value}</p></section>)}
       {company?.description&&<section className="ad-job-section"><div className="ad-job-section-heading"><span><Building2 size={18} aria-hidden="true"/></span><h4>About {companyName}</h4></div><p className="ad-job-copy">{company.description}</p>{website&&<a href={website} target="_blank" rel="noopener noreferrer" className="ad-text-link">Visit company website</a>}</section>}
     </div>
     <aside className="ad-job-rail" aria-label="Job overview"><section className="ad-job-facts"><p>Administrative review</p><h4>Job overview</h4><dl><div><dt><MapPin size={16} aria-hidden="true"/>Location</dt><dd>{job.location||'Not specified'}</dd></div><div><dt><BriefcaseBusiness size={16} aria-hidden="true"/>Employment</dt><dd>{job.jobType||'Not specified'}</dd></div><div><dt><CalendarDays size={16} aria-hidden="true"/>Listed salary</dt><dd>{salaryLabel(job.salary)}</dd></div>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="ad-job-admin-note">This is a read-only view. Use Edit details to update the listing, or Remove to hide it from job search.</p></section></aside>
   </div>
 </div>;
};
export const AdminRecordDialog=({resource,record,action,onClose,onSaved})=>{
 const ref=useRef(null),cancelRef=useRef(null),closeRef=useRef(null);
 const [editing,setEditing]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const fields=adminConfig[resource].fields;
 const [draft,setDraft]=useState(()=>Object.fromEntries(fields.map(([key])=>[key,Array.isArray(record[key])?record[key].join(', '):record[key]??(resource==='contacts'?'new':'')])));
 useEffect(()=>{const dialog=ref.current,opener=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();(action?cancelRef.current:closeRef.current)?.focus({preventScroll:true});dialog.scrollTop=0;return()=>{dialog.close();document.body.style.overflow=overflow;if(opener?.isConnected)opener.focus();};},[action]);
 const title=recordTitle(resource,record)||'Record';
 const changeStatus=action==='suspend'?'Suspend account':action==='reactivate'?'Reactivate account':action==='remove'?'Remove job':action==='restore'?'Restore job':null;
 const save=async(event)=>{
  event.preventDefault();if(saving)return;setSaving(true);setError('');
  try {
   const payload=action?resource==='users'?{isSuspended:action==='suspend'}:{deleted:action==='remove'}:draft;
   const {data}=await updateAdminRecordApi(resource,record._id,payload);if(!data.success)throw Error(data.message||'Unable to save changes.');onSaved();
  }catch(failure){setError(failure.response?.data?.message||failure.message||'Unable to save changes.');setSaving(false);}
 };
 return <dialog ref={ref} className={`ad-dialog ${resource==='jobs'&&!action&&!editing?'ad-job-dialog':''}`} aria-labelledby="ad-dialog-title" onCancel={event=>{event.preventDefault();if(!saving)onClose();}} aria-busy={saving}><header><div><p>{adminConfig[resource].title}</p><h2 id="ad-dialog-title">{changeStatus|| (editing?'Edit details':resource==='jobs'?'Job details':'Record details')}</h2></div><button ref={closeRef} type="button" aria-label="Close record dialog" onClick={onClose} disabled={saving}><X size={20} aria-hidden="true"/></button></header><form onSubmit={save}><fieldset disabled={saving}><div className="ad-dialog-body">
  {action?<><h3>{title}</h3><p>{action==='suspend'?'This account will be unable to sign in or use existing sessions. Its records will be retained.':action==='reactivate'?'This account will be able to sign in again.':action==='remove'?'This job will be removed from searches and stop accepting applications. Existing application history is kept.':'This job will return to public listings. Any application deadline will still apply.'}</p></>:editing?<div className="ad-fields">{fields.map(([key,label,type='text',options])=><div className={`ad-field ${type==='textarea'?'ad-wide':''}`} key={key}><label htmlFor={`ad-${key}`}>{label}</label>{type==='select'?<select id={`ad-${key}`} value={draft[key]} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}>{options.map(value=><option key={value} value={value}>{value||'Not specified'}</option>)}</select>:type==='textarea'?<textarea id={`ad-${key}`} rows={4} maxLength={15000} value={draft[key]} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}/>:<input id={`ad-${key}`} type={type} value={draft[key]} maxLength={2000} required={['name','email','title','companyName'].includes(key)} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}/>}</div>)}</div>:<><h3>{title}</h3><dl className="ad-details">{detailRows(resource,record).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value===null||value===undefined||value===''?'Not added':String(value)}</dd></div>)}</dl>{resource==='applications'&&safeUrl(record.applicant?.profile?.resume)&&<a className="ad-text-link" href={safeUrl(record.applicant.profile.resume)} target="_blank" rel="noopener noreferrer">Open candidate resume</a>}{resource==='contacts'&&<a className="ad-text-link" href={`mailto:${encodeURIComponent(record.email)}?subject=${encodeURIComponent('Re: '+record.subject)}`}>Reply by email</a>}</>}
  {error&&<p className="ad-error" role="alert">{error}</p>}
 </div><footer><button ref={cancelRef} className="btn-secondary" type="button" onClick={onClose}>{editing||action?'Cancel':'Close'}</button>{editing||action?<button key="save" className={`btn-primary ${action==='suspend'||action==='remove'?'ad-danger':''}`} type="submit">{saving&&<Loader2 size={16} className="animate-spin" aria-hidden="true"/>}{saving?'Saving...':changeStatus||'Save changes'}</button>:<button key="edit" className="btn-primary" type="button" onClick={()=>setEditing(true)}>{resource==='applications'||resource==='contacts'?'Update status':'Edit details'}</button>}</footer></fieldset></form></dialog>;
};
AdminRecordDialog.propTypes={resource:PropTypes.string.isRequired,record:PropTypes.object.isRequired,action:PropTypes.string,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};
