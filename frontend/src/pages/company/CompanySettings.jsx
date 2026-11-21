import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, BellRing, BriefcaseBusiness, Check, Eye, EyeOff, Loader2, LockKeyhole, Save, UserRound } from "lucide-react";
import { PushNotificationSettings } from "../../components/notifications/PushPermissionPrompt";
import { changePasswordApi, getCompanySettingsApi, updateCompanySettingsApi } from "../../API/api";
import { setUser } from "../../redux/authSlice";
import "./CompanySettings.css";

const empty = {name:"",defaultLocation:"",defaultJobType:"Full-time",defaultWorkMode:""};
const toDraft = (user) => ({name:user.name || "",defaultLocation:user.companySettings?.defaultLocation || "",defaultJobType:user.companySettings?.defaultJobType || "Full-time",defaultWorkMode:user.companySettings?.defaultWorkMode || ""});
export const CompanySettings = () => {
  const dispatch = useDispatch();
  const [searchParams,setSearchParams] = useSearchParams();
  const section = ["account","defaults","notifications","security"].includes(searchParams.get("section")) ? searchParams.get("section") : "account";
  const sections = [["account","Account details",UserRound],["defaults","Job-posting defaults",BriefcaseBusiness],["notifications","Notifications",BellRing],["security","Password & security",LockKeyhole]];
  const [account,setAccount] = useState(null);
  const [draft,setDraft] = useState(empty);
  const [initial,setInitial] = useState(empty);
  const [loading,setLoading] = useState(true);
  const [loadError,setLoadError] = useState("");
  const [attempt,setAttempt] = useState(0);
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState("");
  const [saved,setSaved] = useState(false);
  const [nameError,setNameError] = useState("");
  const [passwords,setPasswords] = useState({currentPassword:"",newPassword:"",confirmPassword:""});
  const [passwordErrors,setPasswordErrors] = useState({});
  const [passwordError,setPasswordError] = useState("");
  const [passwordSaved,setPasswordSaved] = useState(false);
  const [changing,setChanging] = useState(false);
  const [showPasswords,setShowPasswords] = useState(false);
  const passwordFormRef = useRef(null);
  useEffect(() => {
    let active = true;setLoading(true);setLoadError("");
    getCompanySettingsApi().then(({data}) => {
      if (!data.success || !data.user) throw Error();
      if (active) {setAccount(data.user);setDraft(toDraft(data.user));setInitial(toDraft(data.user));dispatch(setUser(data.user));}
    }).catch(() => {if(active)setLoadError("We could not load your settings. Please try again.");}).finally(() => {if(active)setLoading(false);});
    return () => {active=false;};
  },[attempt,dispatch]);
  useEffect(() => {setSaved(false);setSaveError("");setPasswordSaved(false);setPasswordError("");setShowPasswords(false);},[section]);
  const goToSection = (value) => { if (!saving && !changing) setSearchParams({section:value}); };
  const dirty = section === "account" ? draft.name !== initial.name : ["defaultLocation","defaultJobType","defaultWorkMode"].some(key => draft[key] !== initial[key]);
  const change = ({target:{name,value}}) => {setDraft(old=>({...old,[name]:value}));setSaved(false);if(name==="name")setNameError("");};
  const save = async (event) => {
    event.preventDefault();if(saving)return;
    if(section === "account" && !draft.name.trim()){setNameError("Enter your account name.");document.getElementById("cs-name")?.focus();return;}
    setSaving(true);setSaveError("");setSaved(false);
    try {
      const payload = section === "account" ? {...initial,name:draft.name} : {...draft,name:initial.name};
      const {data}=await updateCompanySettingsApi(payload);if(!data.success||!data.user)throw Error(data.message||"Unable to save settings.");
      setAccount(data.user);const next=toDraft(data.user);setDraft(old=>section === "account" ? {...old,name:next.name} : {...next,name:old.name});setInitial(next);dispatch(setUser(data.user));setSaved(true);
    }catch(error){setSaveError(error.response?.data?.message||error.message||"Unable to save settings. Please try again.");}finally{setSaving(false);}
  };
  const changePassword = async (event) => {
    event.preventDefault();if(changing)return;
    const invalid={};
    if(!passwords.currentPassword)invalid.currentPassword="Enter your current password.";
    if(!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,128}$/.test(passwords.newPassword))invalid.newPassword="Use 8-128 characters with uppercase, lowercase, a number, and a symbol.";
    if(passwords.newPassword===passwords.currentPassword&&passwords.newPassword)invalid.newPassword="Choose a different password.";
    if(!passwords.confirmPassword||passwords.confirmPassword!==passwords.newPassword)invalid.confirmPassword="Passwords must match.";
    setPasswordErrors(invalid);setPasswordError("");setPasswordSaved(false);
    if(Object.keys(invalid).length){requestAnimationFrame(()=>passwordFormRef.current?.querySelector('[aria-invalid="true"]')?.focus());return;}
    setChanging(true);
    try {const {data}=await changePasswordApi({currentPassword:passwords.currentPassword,newPassword:passwords.newPassword});if(!data.success)throw Error(data.message||"Unable to update password.");setPasswords({currentPassword:"",newPassword:"",confirmPassword:""});setShowPasswords(false);setPasswordSaved(true);}
    catch(error){setPasswordError(error.response?.data?.message||error.message||"Unable to update password. Please try again.");}finally{setChanging(false);}
  };
  const passwordField = (name,label) => <div className={`cs-field ${name==="currentPassword"?"cs-wide":""}`} key={name}><label htmlFor={`cs-${name}`}>{label}</label><input id={`cs-${name}`} name={name} type={showPasswords?"text":"password"} autoComplete={name==="currentPassword"?"current-password":"new-password"} value={passwords[name]} onChange={event=>{setPasswords(old=>({...old,[name]:event.target.value}));setPasswordErrors(old=>({...old,[name]:undefined}));setPasswordSaved(false);}} required maxLength={128} aria-invalid={!!passwordErrors[name]} aria-describedby={passwordErrors[name]?`cs-${name}-error`:name==="newPassword"?"cs-password-hint":undefined}/>{passwordErrors[name]&&<p className="cs-error" id={`cs-${name}-error`}>{passwordErrors[name]}</p>}</div>;
  if(loading)return <section className="cs-page" aria-busy="true"><span className="sr-only" role="status">Loading settings...</span><div className="grid gap-6 motion-safe:animate-pulse" aria-hidden="true"><span className="cs-skeleton h-8 w-40"/><span className="cs-skeleton h-3 w-2/3 max-w-md"/><div className="cs-layout"><div className="cs-panel grid content-start gap-6">{[0,1,2].map(item=><span key={item} className="cs-skeleton h-5 w-full"/>)}</div><div className="cs-panel grid gap-6"><span className="cs-skeleton h-5 w-44"/><span className="cs-skeleton h-3 w-3/4"/><span className="cs-skeleton h-12 w-full"/><span className="cs-skeleton h-12 w-full"/></div></div></div></section>;
  if(loadError)return <section className="cs-panel cs-load-error" role="alert"><h1>Settings did not load</h1><p>{loadError}</p><button className="btn-primary" onClick={()=>setAttempt(old=>old+1)}>Try again</button></section>;
  return <div className="cs-page">
    <header className="cs-page-heading"><h1>Settings</h1><p>Manage your account and make your hiring workspace work for you.</p></header>
    <div className="cs-layout">
      <aside className="cs-settings-nav"><nav aria-label="Settings sections">{sections.map(([value,label,Icon]) => <button type="button" key={value} aria-current={section === value ? "page" : undefined} disabled={saving||changing} onClick={()=>goToSection(value)}><Icon size={17} aria-hidden="true"/>{label}</button>)}</nav><Link className="cs-profile-link" to="/company/profile">Company profile<ArrowUpRight size={15} aria-hidden="true"/></Link></aside>
      <div className="cs-mobile-section cs-field"><label htmlFor="cs-section">Settings section</label><select id="cs-section" value={section} disabled={saving||changing} onChange={event=>goToSection(event.target.value)}>{sections.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>
      <div className="cs-content">
      {section !== "security" && section !== "notifications" &&
      <form onSubmit={save} noValidate aria-busy={saving}><fieldset disabled={saving} className="cs-settings-fields">
        {section === "account" && <section className="cs-panel" id="settings-account"><div className="cs-section-heading"><UserRound size={20} aria-hidden="true"/><div><h2>Account details</h2><p>Your name appears in the workspace. Company details live in your company profile.</p></div></div><div className="cs-fields"><div className="cs-field"><label htmlFor="cs-name">Account name</label><input id="cs-name" name="name" autoComplete="name" value={draft.name} onChange={change} maxLength={100} required aria-invalid={!!nameError} aria-describedby={nameError?"cs-name-error":undefined}/>{nameError&&<p className="cs-error" id="cs-name-error">{nameError}</p>}</div><div className="cs-field"><label htmlFor="cs-email">Sign-in email</label><input id="cs-email" type="email" value={account.email} readOnly aria-describedby="cs-email-hint"/><p id="cs-email-hint" className="cs-hint">Your email is used to sign in to ZipJob.</p></div></div></section>}
        {section === "defaults" && <section className="cs-panel" id="settings-defaults"><div className="cs-section-heading"><BriefcaseBusiness size={20} aria-hidden="true"/><div><h2>Job-posting defaults</h2><p>Pre-fill your next job listing. Existing listings stay as they are.</p></div></div><div className="cs-fields"><div className="cs-field cs-wide"><label htmlFor="cs-location">Default location</label><input id="cs-location" name="defaultLocation" value={draft.defaultLocation} onChange={change} maxLength={200} placeholder="e.g. Kathmandu, Nepal"/></div><div className="cs-field"><label htmlFor="cs-jobType">Default job type</label><select id="cs-jobType" name="defaultJobType" value={draft.defaultJobType} onChange={change}>{["Full-time","Part-time","Contract","Internship","Remote"].map(value=><option key={value}>{value}</option>)}</select></div><div className="cs-field"><label htmlFor="cs-workMode">Default work arrangement</label><select id="cs-workMode" name="defaultWorkMode" value={draft.defaultWorkMode} onChange={change}><option value="">Not specified</option>{["On-site","Hybrid","Remote"].map(value=><option key={value}>{value}</option>)}</select></div></div></section>}
        {saveError&&<p className="cs-error cs-error-banner" role="alert">{saveError}</p>}
        <div className="cs-save-row"><div>{saved?<p className="cs-success" role="status"><Check size={16} aria-hidden="true"/>Settings saved.</p>:<p>{dirty?"You have unsaved changes.":"Your settings are up to date."}</p>}</div><div><button className="btn-secondary" type="button" disabled={!dirty} onClick={()=>{setDraft(old=>section === "account" ? {...old,name:initial.name} : {...initial,name:old.name});setNameError("");setSaveError("");setSaved(false);}}>Discard</button><button className="btn-primary" type="submit" disabled={!dirty}>{saving?<Loader2 size={16} className="animate-spin" aria-hidden="true"/>:<Save size={16} aria-hidden="true"/>}{saving?"Saving...":"Save settings"}</button></div></div>
      </fieldset></form>}
      {section === "notifications" && <PushNotificationSettings />}
      {section === "security" && <form ref={passwordFormRef} onSubmit={changePassword} className="cs-panel" id="settings-security" noValidate aria-busy={changing}><fieldset disabled={changing} className="cs-settings-fields"><div className="cs-section-heading"><LockKeyhole size={20} aria-hidden="true"/><div><h2>Password & security</h2><p>Use a unique password to protect your company account.</p></div></div><div className="cs-fields">{passwordField("currentPassword","Current password")}{passwordField("newPassword","New password")}{passwordField("confirmPassword","Confirm new password")}</div><div className="cs-password-options"><p className="cs-hint" id="cs-password-hint">8-128 characters, with uppercase, lowercase, a number, and a symbol.</p><button type="button" aria-pressed={showPasswords} onClick={()=>setShowPasswords(old=>!old)}>{showPasswords?<EyeOff size={16} aria-hidden="true"/>:<Eye size={16} aria-hidden="true"/>}{showPasswords?"Hide passwords":"Show passwords"}</button></div>{passwordError&&<p className="cs-error" role="alert">{passwordError}</p>}{passwordSaved&&<p className="cs-success" role="status"><Check size={16} aria-hidden="true"/>Password updated.</p>}<div className="cs-security-actions"><button className="btn-primary" type="submit">{changing&&<Loader2 size={16} className="animate-spin" aria-hidden="true"/>}{changing?"Updating password...":"Update password"}</button></div></fieldset></form>}
    </div></div>
  </div>;
};
