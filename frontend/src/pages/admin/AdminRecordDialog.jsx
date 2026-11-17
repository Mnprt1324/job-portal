import { useEffect,useRef,useState } from 'react';
import { Loader2,X } from 'lucide-react';
import PropTypes from 'prop-types';
import { updateAdminRecordApi } from '../../API/api';
import { adminConfig,detailRows,recordTitle } from './adminConfig';
const safeUrl=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)?url.href:null;}catch{return null;}};
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
 return <dialog ref={ref} className="ad-dialog" aria-labelledby="ad-dialog-title" onCancel={event=>{event.preventDefault();if(!saving)onClose();}} aria-busy={saving}><header><div><p>{adminConfig[resource].title}</p><h2 id="ad-dialog-title">{changeStatus|| (editing?'Edit details':'Record details')}</h2></div><button ref={closeRef} type="button" aria-label="Close record dialog" onClick={onClose} disabled={saving}><X size={20} aria-hidden="true"/></button></header><form onSubmit={save}><fieldset disabled={saving}><div className="ad-dialog-body">
  {action?<><h3>{title}</h3><p>{action==='suspend'?'This account will be unable to sign in or use existing sessions. Its records will be retained.':action==='reactivate'?'This account will be able to sign in again.':action==='remove'?'This job will be removed from searches and stop accepting applications. Existing application history is kept.':'This job will return to public listings. Any application deadline will still apply.'}</p></>:editing?<div className="ad-fields">{fields.map(([key,label,type='text',options])=><div className={`ad-field ${type==='textarea'?'ad-wide':''}`} key={key}><label htmlFor={`ad-${key}`}>{label}</label>{type==='select'?<select id={`ad-${key}`} value={draft[key]} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}>{options.map(value=><option key={value} value={value}>{value||'Not specified'}</option>)}</select>:type==='textarea'?<textarea id={`ad-${key}`} rows={4} maxLength={15000} value={draft[key]} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}/>:<input id={`ad-${key}`} type={type} value={draft[key]} maxLength={2000} required={['name','email','title','companyName'].includes(key)} onChange={event=>setDraft(old=>({...old,[key]:event.target.value}))}/>}</div>)}</div>:<><h3>{title}</h3><dl className="ad-details">{detailRows(resource,record).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value===null||value===undefined||value===''?'Not added':String(value)}</dd></div>)}</dl>{resource==='applications'&&safeUrl(record.applicant?.profile?.resume)&&<a className="ad-text-link" href={safeUrl(record.applicant.profile.resume)} target="_blank" rel="noopener noreferrer">Open candidate resume</a>}{resource==='contacts'&&<a className="ad-text-link" href={`mailto:${encodeURIComponent(record.email)}?subject=${encodeURIComponent('Re: '+record.subject)}`}>Reply by email</a>}</>}
  {error&&<p className="ad-error" role="alert">{error}</p>}
 </div><footer><button ref={cancelRef} className="btn-secondary" type="button" onClick={onClose}>{editing||action?'Cancel':'Close'}</button>{editing||action?<button key="save" className={`btn-primary ${action==='suspend'||action==='remove'?'ad-danger':''}`} type="submit">{saving&&<Loader2 size={16} className="animate-spin" aria-hidden="true"/>}{saving?'Saving...':changeStatus||'Save changes'}</button>:<button key="edit" className="btn-primary" type="button" onClick={()=>setEditing(true)}>{resource==='applications'||resource==='contacts'?'Update status':'Edit details'}</button>}</footer></fieldset></form></dialog>;
};
AdminRecordDialog.propTypes={resource:PropTypes.string.isRequired,record:PropTypes.object.isRequired,action:PropTypes.string,onClose:PropTypes.func.isRequired,onSaved:PropTypes.func.isRequired};
