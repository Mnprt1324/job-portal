import { Loader2, Save } from "lucide-react";
import PropTypes from "prop-types";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

export const JobCreate = ({companies,formData,mode="create",saving=false,errors={},serverError="",onChange,onCancel,onSubmit}) => {
  const field = (name,label,{placeholder="",multiline=false,options,hint,required=true,type="text",maxLength=250}={}) => <div className={`cj-field ${multiline ? "cj-field-wide" : ""}`} key={name}>
    <label htmlFor={`cj-${name}`}>{label}{required ? <span aria-hidden="true"> *</span> : <span className="cj-optional"> (optional)</span>}</label>
    {options ? <select id={`cj-${name}`} name={name} value={formData[name]} onChange={onChange} required={required} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `cj-${name}-error` : undefined}>{options.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select> : multiline ? <textarea id={`cj-${name}`} name={name} value={formData[name]} onChange={onChange} required={required} rows={5} maxLength={maxLength === 250 ? 15000 : maxLength} placeholder={placeholder} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `cj-${name}-error` : undefined} /> : <input type={type} min={type === "number" ? 1 : undefined} max={type === "number" ? 1000 : undefined} step={type === "number" ? 1 : undefined} id={`cj-${name}`} name={name} value={formData[name]} onChange={onChange} required={required} maxLength={name === "requirement" ? 2000 : maxLength} placeholder={placeholder} aria-invalid={!!errors[name]} aria-describedby={[errors[name] ? `cj-${name}-error` : "", hint ? `cj-${name}-hint` : ""].filter(Boolean).join(" ") || undefined} />}
    {hint && <p className="cj-field-hint" id={`cj-${name}-hint`}>{hint}</p>}{errors[name] && <p className="cj-field-error" id={`cj-${name}-error`}>{errors[name]}</p>}
  </div>;
  return <form className="cj-form" onSubmit={onSubmit} noValidate aria-busy={saving}><fieldset disabled={saving}>
    <section className="cj-form-panel"><div className="cj-form-heading"><span>01</span><div><h2>The role at a glance</h2><p>Start with the details candidates use to compare opportunities.</p></div></div><div className="cj-fields">
      {field("title","Job title",{placeholder:"e.g. Frontend Developer"})}
      {field("company","Company",{options:[["","Select company profile"],...companies.map((company)=>[company._id,company.companyName])]})}
      {field("location","Location",{placeholder:"e.g. London, Remote or Hybrid"})}
      {field("jobType","Job type",{options:[...new Set([...jobTypes,formData.jobType].filter(Boolean))].map((value)=>[value,value])})}
      {field("salary","Salary",{placeholder:"e.g. GBP 45,000 - 60,000 per year",hint:"Include the currency and pay period for clarity."})}
      {field("requirement","Skills & requirements",{placeholder:"e.g. React, TypeScript, Accessibility",hint:"Separate each skill or requirement with a comma."})}
    </div></section>
    <section className="cj-form-panel"><div className="cj-form-heading"><span>02</span><div><h2>How the role works</h2><p>Optional details that help candidates decide whether the role fits.</p></div></div><div className="cj-fields">
      {field("workMode","Work arrangement",{required:false,options:[["","Not specified"],["On-site","On-site"],["Hybrid","Hybrid"],["Remote","Remote"]]})}
      {field("experienceLevel","Experience level",{required:false,options:[["","Not specified"],...["Entry level","Mid level","Senior","Lead","Manager"].map(value=>[value,value])]})}
      {field("department","Department",{required:false,maxLength:120,placeholder:"e.g. Engineering, Design, Sales"})}
      {field("openings","Number of openings",{required:false,type:"number",placeholder:"e.g. 2"})}
      {field("applicationDeadline","Application deadline",{required:false,type:"date",hint:"Applications close at the end of this date (UTC). Leave blank for no deadline."})}
      {field("education","Education / qualifications",{required:false,maxLength:2000,placeholder:"e.g. Relevant degree or equivalent practical experience"})}
    </div></section>
    <section className="cj-form-panel"><div className="cj-form-heading"><span>03</span><div><h2>Give the role some context</h2><p>Explain the responsibilities, your team, and what success looks like.</p></div></div><div className="cj-fields">{field("description","Job description",{multiline:true,placeholder:"Describe the work, the team, and what you are looking for."})}
      {field("responsibilities","Key responsibilities",{required:false,multiline:true,maxLength:10000,placeholder:"What will this person own, deliver, and collaborate on?"})}
      {field("benefits","Benefits & perks",{required:false,multiline:true,maxLength:5000,placeholder:"e.g. Flexible hours, learning budget, health cover"})}
    </div></section>
    {serverError && <p className="cj-save-error" role="alert">{serverError}</p>}
    <div className="cj-form-actions"><p>Fields marked * are required. Add optional details when they help candidates.</p><div><button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button><button type="submit" className="btn-primary">{saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}{saving ? "Saving job..." : mode === "edit" ? "Save changes" : "Post job"}</button></div></div>
  </fieldset></form>;
};
JobCreate.propTypes = {companies:PropTypes.array.isRequired,formData:PropTypes.object.isRequired,mode:PropTypes.string,saving:PropTypes.bool,errors:PropTypes.object,serverError:PropTypes.string,onChange:PropTypes.func.isRequired,onCancel:PropTypes.func.isRequired,onSubmit:PropTypes.func.isRequired};
export default JobCreate;
