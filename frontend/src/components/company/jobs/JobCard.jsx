import {Link} from "react-router-dom";
import { Building2, CalendarDays, MapPin, Pencil, Users, Wallet, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
const formatDate = (value) => { const date = new Date(value); return value && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("en-US", {month:"short",day:"numeric",year:"numeric"}) : "Date not available"; };
export const JobCard = ({job,onEdit,onDelete}) => {
  const requirements = [...new Set((Array.isArray(job.requirement) ? job.requirement : String(job.requirement || "").split(",")).map((value) => String(value).trim()).filter(Boolean))];
  return <article className="cj-job-row">
    <div className="cj-job-top"><div className="cj-job-identity"><span className="cj-company-mark"><Building2 size={21} aria-hidden="true" /></span><div><p className="cj-company-name">{job.company?.companyName || "Company"}</p><h3>{job.title}</h3></div></div><div className="cj-job-actions"><button type="button" className="btn-secondary" onClick={() => onEdit(job)} aria-label={`Edit ${job.title}`}><Pencil size={15} aria-hidden="true" />Edit job</button><button type="button" className="cj-delete-button" onClick={() => onDelete(job)} aria-label={`Delete ${job.title}`}><Trash2 size={15} aria-hidden="true" />Delete</button></div></div>
    <div className="cj-job-meta"><span><MapPin size={14} aria-hidden="true" />{job.location || "Location not added"}</span>{job.jobType && <span className="cj-job-type">{job.jobType}</span>}{job.salary && <span><Wallet size={14} aria-hidden="true" />{job.salary}</span>}</div>
    {(job.workMode || job.experienceLevel || job.department) && <div className="cj-job-meta">{[job.workMode,job.experienceLevel,job.department].filter(Boolean).map((value,index) => <span key={`${value}-${index}`}>{value}</span>)}</div>}
    <p className="cj-job-description">{job.description || "No description added yet."}</p>
    {requirements.length > 0 && <div className="cj-job-skills">{requirements.slice(0,5).map((skill) => <span key={skill}>{skill}</span>)}{requirements.length > 5 && <span>+{requirements.length-5} more</span>}</div>}
    <div className="cj-job-footer"><Link className="text-link" to={`/company/jobs/${job._id}/applicants`}>View applicants ?</Link><span><Users size={15} aria-hidden="true" />{job.applicants?.length || 0} applications</span><span><CalendarDays size={14} aria-hidden="true" />Posted {formatDate(job.createdAt)}</span></div>
  </article>;
};
JobCard.propTypes = {job:PropTypes.object.isRequired,onEdit:PropTypes.func.isRequired,onDelete:PropTypes.func.isRequired};
export default JobCard;
