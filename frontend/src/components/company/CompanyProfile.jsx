import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Building2, Check, Loader2, Pencil, Save } from "lucide-react";
import { createCompanyApiCall, getOwnedCompaniesApi, updateCompanyProfileApi } from "../../API/api";
import "./CompanyProfile.css";

const defaults = { companyName: "", tagline: "", industry: "", companySize: "", foundedYear: "", location: "", website: "", contactEmail: "", description: "", benefits: "", linkedin: "", twitter: "", instagram: "", github: "" };
const socials = [["linkedin", "LinkedIn"], ["twitter", "X / Twitter"], ["instagram", "Instagram"], ["github", "GitHub"]];
const hydrate = (company) => Object.fromEntries(Object.keys(defaults).map((key) => [key, company?.[key] ?? ""]));
const safeLink = (value) => { try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && url.hostname.includes(".") && !url.username && !url.password ? url.href : null; } catch { return null; } };

const CompanyProfileSkeleton = () => (
  <section className="cp-page cp-loading" aria-busy="true" aria-label="Company profile">
    <span className="sr-only" role="status">Loading company profile...</span>
    <div aria-hidden="true" className="cp-skeleton-content">
      <div className="cp-page-heading"><div className="cp-skeleton-lines"><span className="cp-skeleton cp-skeleton-title" /><span className="cp-skeleton cp-skeleton-subtitle" /></div><span className="cp-skeleton cp-skeleton-button" /></div>
      <div className="cp-layout"><div className="cp-primary">
        <div className="cp-panel cp-identity"><span className="cp-skeleton cp-skeleton-logo" /><div className="cp-skeleton-lines"><span className="cp-skeleton cp-skeleton-short" /><span className="cp-skeleton cp-skeleton-title" /><span className="cp-skeleton" /></div></div>
        <div className="cp-panel cp-skeleton-lines"><span className="cp-skeleton cp-skeleton-title" /><span className="cp-skeleton" /><span className="cp-skeleton cp-skeleton-subtitle" /><div className="cp-facts">{[0,1,2,3].map((item) => <div className="cp-skeleton-lines" key={item}><span className="cp-skeleton cp-skeleton-short" /><span className="cp-skeleton" /></div>)}</div></div>
        <div className="cp-panel cp-skeleton-lines"><span className="cp-skeleton cp-skeleton-title" /><span className="cp-skeleton" /><span className="cp-skeleton cp-skeleton-subtitle" /></div>
      </div><aside className="cp-aside"><div className="cp-panel cp-skeleton-lines"><span className="cp-skeleton cp-skeleton-title" /><span className="cp-skeleton cp-skeleton-button" /><span className="cp-skeleton" />{[0,1,2,3,4,5,6,7].map((item) => <span className="cp-skeleton" key={item} />)}</div></aside></div>
    </div>
  </section>
);

export const CompanyProfile = () => {
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [draft, setDraft] = useState(defaults);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const selectCompany = (next) => {
    setCompany(next); setDraft(hydrate(next)); setFile(null); setErrors({}); setSaveError(""); setEditing(!next); setNotice("");
  };
  useEffect(() => {
    let active = true;
    setLoading(true); setLoadError("");
    getOwnedCompaniesApi().then(({data}) => {
      if (!data.success) throw Error();
      if (active) { const list = Array.isArray(data.companies) ? data.companies : []; setCompanies(list); selectCompany(list[0] || null); }
    }).catch(() => { if (active) setLoadError("We could not load your company profile. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (!file) { setPreview(company?.logo || ""); return; }
    const url = URL.createObjectURL(file); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, company?.logo]);
  const current = editing ? draft : hydrate(company);
  const checklist = [["Company name", current.companyName], ["Tagline", current.tagline], ["About the company", current.description], ["Industry", current.industry], ["Company size", current.companySize], ["Location", current.location], ["Website", current.website], ["Company logo", editing ? file || company?.logo : company?.logo]];
  const added = checklist.filter(([, value]) => !!value).length;
  const completion = Math.round(added / checklist.length * 100);
  const change = ({target: {name, value}}) => { setDraft((old) => ({...old, [name]:value})); setErrors((old) => ({...old, [name]:undefined})); };
  const submit = async (event) => {
    event.preventDefault(); if (saving) return;
    const invalid = {};
    if (!draft.companyName.trim()) invalid.companyName = "Enter your company name.";
    for (const name of ["website", ...socials.map(([name]) => name)]) if (draft[name] && !safeLink(draft[name].trim())) invalid[name] = "Enter a full http:// or https:// URL.";
    if (draft.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contactEmail.trim())) invalid.contactEmail = "Enter a valid contact email.";
    if (draft.foundedYear && (!Number.isInteger(Number(draft.foundedYear)) || Number(draft.foundedYear) < 1800 || Number(draft.foundedYear) > new Date().getFullYear())) invalid.foundedYear = "Enter a year between 1800 and this year.";
    if (errors.logo) invalid.logo = errors.logo;
    setErrors(invalid);
    if (Object.keys(invalid).length) { requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus()); return; }
    setSaving(true); setSaveError("");
    try {
      const payload = new FormData();
      Object.entries(draft).forEach(([key, value]) => payload.append(key, String(value).trim()));
      if (file) payload.append("logo", file);
      const { data } = company ? await updateCompanyProfileApi(payload, company._id) : await createCompanyApiCall(payload);
      if (!data.success || !data.company?._id) throw Error("We could not save your profile. Please try again.");
      setCompanies((old) => company ? old.map((item) => item._id === company._id ? data.company : item) : [...old, data.company]);
      selectCompany(data.company); setEditing(false); setNotice("Company profile saved.");
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (error) { setSaveError(error.response?.data?.message || error.message || "We could not save your profile. Please try again."); }
    finally { setSaving(false); }
  };
  const logoChange = (event) => {
    const next = event.target.files?.[0]; if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type) || next.size > 5 * 1024 * 1024) {
      setErrors((old) => ({...old, logo:"Choose a JPG, PNG or WebP image under 5 MB."})); event.target.value = ""; return;
    }
    setFile(next); setErrors((old) => ({...old, logo:undefined}));
  };
  const field = (name, label, {type="text", placeholder="", maxLength=500, options, multiline=false, wide=false} = {}) => {
    const inputProps = {id:`cp-${name}`, name, value:draft[name], onChange:change, "aria-invalid":!!errors[name], "aria-describedby":errors[name] ? `cp-${name}-error` : undefined, required:name === "companyName"};
    return <div className={`cp-field ${wide ? "cp-wide" : ""}`} key={name}><label htmlFor={`cp-${name}`}>{label}{name === "companyName" && " *"}</label>
      {options ? <select {...inputProps}><option value="">Select company size</option>{options.map((value) => <option key={value} value={value}>{value} employees</option>)}</select> : multiline ? <textarea {...inputProps} rows={5} maxLength={maxLength} placeholder={placeholder} /> : <input {...inputProps} type={type} maxLength={maxLength} placeholder={placeholder} min={type === "number" ? 1800 : undefined} max={type === "number" ? new Date().getFullYear() : undefined} />}
      {errors[name] && <p className="cp-error" id={`cp-${name}-error`}>{errors[name]}</p>}</div>;
  };
  const link = (url, label) => safeLink(url) ? <a href={safeLink(url)} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={15} aria-hidden="true" /></a> : null;
  if (loading) return <CompanyProfileSkeleton />;
  if (loadError) return <section className="cp-state" role="alert"><p>{loadError}</p><button className="btn-primary" onClick={() => setAttempt((old) => old + 1)}>Try again</button></section>;
  return <div className="cp-page">
    <header className="cp-page-heading"><div><h1 ref={headingRef} tabIndex={-1}>Company profile</h1><p>Show candidates who you are and what it is like to work with you.</p></div>{!editing && <button className="btn-primary" onClick={() => {setEditing(true);setNotice("");}}><Pencil size={17} aria-hidden="true" />Edit profile</button>}</header>
    {notice && <p className="cp-notice" role="status"><Check size={17} aria-hidden="true" />{notice}</p>}
    {companies.length > 1 && <div className="cp-field cp-company-picker"><label htmlFor="cp-company-picker">Company</label><select id="cp-company-picker" disabled={saving} value={company?._id || ""} onChange={(event) => selectCompany(companies.find((item) => item._id === event.target.value))}>{companies.map((item) => <option key={item._id} value={item._id}>{item.companyName}</option>)}</select></div>}
    <div className="cp-layout"><div className="cp-primary">
      {editing ? <form ref={formRef} onSubmit={submit} noValidate aria-busy={saving}>
        <fieldset disabled={saving} className="cp-editor">
          <section className="cp-panel"><div className="cp-section-heading"><span>01</span><div><h2>The essentials</h2><p>Introduce your company. Only the company name is required.</p></div></div>
            <div className="cp-logo-editor"><div className="cp-logo">{preview ? <img src={preview} alt="Company logo preview" /> : <Building2 size={30} aria-hidden="true" />}</div><div><label htmlFor="cp-logo">{preview ? "Change logo" : "Upload company logo"}</label><input id="cp-logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={logoChange} aria-invalid={!!errors.logo} aria-describedby="cp-logo-hint" /><p id="cp-logo-hint">JPG, PNG or WebP. Up to 5 MB.</p>{errors.logo && <p className="cp-error" role="alert">{errors.logo}</p>}</div></div>
            <div className="cp-fields">{field("companyName","Company name",{maxLength:160,placeholder:"Your company name"})}{field("industry","Industry",{maxLength:100,placeholder:"e.g. Technology, Healthcare"})}{field("tagline","Tagline",{maxLength:160,placeholder:"What you do, in one clear sentence",wide:true})}{field("companySize","Company size",{options:["1-10","11-50","51-200","201-500","501-1000","1001+"]})}{field("foundedYear","Founded in",{type:"number",placeholder:"e.g. 2018"})}{field("location","Headquarters / location",{maxLength:200,placeholder:"City, country or remote"})}{field("website","Website",{type:"url",placeholder:"https://company.com"})}</div>
          </section>
          <section className="cp-panel"><div className="cp-section-heading"><span>02</span><div><h2>Life at your company</h2><p>Share your purpose, people, and working culture.</p></div></div><div className="cp-fields">{field("description","About the company",{multiline:true,wide:true,maxLength:5000,placeholder:"What do you build? Who do you help? Tell your company's story."})}{field("benefits","Culture & benefits",{multiline:true,wide:true,maxLength:3000,placeholder:"How does your team work? What benefits and values do you offer?"})}</div></section>
          <section className="cp-panel"><div className="cp-section-heading"><span>03</span><div><h2>Find you online</h2><p>Public contact details and social pages. All optional.</p></div></div><div className="cp-fields">{field("contactEmail","Public contact email",{type:"email",maxLength:254,placeholder:"hello@company.com",wide:true})}{socials.map(([name,label]) => field(name,label,{type:"url",placeholder:`https://${name === "twitter" ? "x" : name}.com/yourcompany`}))}</div></section>
        </fieldset>
        {saveError && <p className="cp-save-error" role="alert">{saveError}</p>}
        <div className="cp-form-actions"><p>Use public details you are happy to share.</p><div>{company && <button className="btn-secondary" type="button" disabled={saving} onClick={() => {selectCompany(company);setEditing(false);}}>Cancel</button>}<button className="btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}{saving ? "Saving profile..." : "Save profile"}</button></div></div>
      </form> : <>
        <section className="cp-panel cp-identity"><div className="cp-logo">{company?.logo ? <img src={company.logo} alt={`${company.companyName} logo`} /> : <Building2 size={30} aria-hidden="true" />}</div><div><p className="cp-kicker">{company?.industry || "Company"}</p><h2>{company?.companyName}</h2>{company?.tagline && <p className="cp-tagline">{company.tagline}</p>}<div className="cp-identity-links">{company?.location && <span>{company.location}</span>}{company?.website && link(company.website,"Visit website")}</div></div></section>
        <section className="cp-panel"><h2>About the company</h2><p className="cp-prose">{company?.description || "Tell candidates about your company, your mission, and the people behind it."}</p><dl className="cp-facts">{[["Industry",company?.industry],["Company size",company?.companySize && `${company.companySize} employees`],["Founded",company?.foundedYear],["Location",company?.location]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || "Not added yet"}</dd></div>)}</dl></section>
        <section className="cp-panel"><h2>Culture & benefits</h2><p className="cp-prose">{company?.benefits || "Share what makes your team a good place to work."}</p></section>
        <section className="cp-panel"><h2>Connect with us</h2><div className="cp-social-links">{company?.contactEmail && <a href={`mailto:${company.contactEmail}`}>{company.contactEmail}</a>}{socials.map(([name,label]) => company?.[name] && <span key={name}>{link(company[name],label)}</span>)}</div>{!company?.contactEmail && !socials.some(([name]) => safeLink(company?.[name])) && <p className="cp-prose">Add your public email and social pages so candidates can get to know you.</p>}</section>
      </>}
    </div><aside className="cp-aside"><section className="cp-panel"><div className="cp-progress-title"><h2>Make your profile count.</h2><Building2 size={20} aria-hidden="true" /></div><div className="cp-progress-value"><strong>{completion}%</strong><span>{added} of {checklist.length} details added</span></div><div className="cp-progress" role="progressbar" aria-label="Company profile completion" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${completion}%`}} /></div><ul className="cp-checklist">{checklist.map(([label,value]) => <li key={label}><span>{value ? <Check size={15} aria-hidden="true" /> : <span aria-hidden="true">+</span>}{label}</span><small>{value ? "Added" : "To add"}</small></li>)}</ul></section><section className="cp-panel cp-tip"><h2>A clearer picture of your team.</h2><p>A short tagline, a useful description, and links to your work help candidates decide whether your company feels right for them.</p></section></aside></div>
  </div>;
};
export default CompanyProfile;
