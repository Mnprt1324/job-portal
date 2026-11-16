import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  Users,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./CompanyJobs.css";
import {
  GetAllJobsCrtByRec,
  getAllRecurCompanied,
  postJobApiCall,
  updateJobApiCall,
} from "../../../API/api";
import { JobCard } from "./JobCard";
import { DeleteJobDialog } from "./DeleteJobDialog";
import { JobCreate } from "./jobCreate";
import { emptyJobForm, mapJobToForm } from "./jobFormData";

const parseRequirements = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const CompanyJobs = () => {
  const defaults = useSelector((state) => state.auth.user?.companySettings);
  const headingRef = useRef(null);
  const requestRef = useRef(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState("new");
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyJobForm);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [mode, setMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkspace = async () => {
    const request = ++requestRef.current;
    setLoading(true);
    setError("");

    try {
      const [companiesResponse, jobsResponse] = await Promise.all([
        getAllRecurCompanied(),
        GetAllJobsCrtByRec(),
      ]);

      if (request !== requestRef.current) return;
      if (!companiesResponse.data.success || !jobsResponse.data.success) throw new Error("Unable to load company jobs.");
      const companyList = Array.isArray(companiesResponse.data.companies)
        ? companiesResponse.data.companies
        : [];
      const jobList = Array.isArray(jobsResponse.data.jobs)
        ? jobsResponse.data.jobs
        : [];

      setCompanies(companyList);
      setJobs(jobList);
      setFormData((prev) => ({
        ...prev,
        company: prev.company || companyList[0]?._id || "",
      }));
    } catch (fetchError) {
      if (request !== requestRef.current) return;
      const message =
        fetchError.response?.data?.message || "Unable to load company jobs.";
      setError(message);

    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    const counter = requestRef;
    fetchWorkspace();
    return () => { counter.current++; };
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return jobs;

    return jobs.filter((job) => {
      const requirements = Array.isArray(job.requirement)
        ? job.requirement.join(" ")
        : job.requirement || "";

      return [job.title, job.company?.companyName, job.location, job.jobType, job.department, job.workMode, job.experienceLevel, requirements]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [jobs, searchTerm]);

  const visibleJobs = useMemo(() => filteredJobs.filter((job) => !typeFilter || job.jobType === typeFilter).sort((a,b) => {
    if (sort === "applicants") return (b.applicants?.length || 0) - (a.applicants?.length || 0);
    const time = (job) => { const date = new Date(job.createdAt || 0).getTime(); return Number.isNaN(date) ? 0 : date; };
    return sort === "old" ? time(a)-time(b) : time(b)-time(a);
  }), [filteredJobs,typeFilter,sort]);
  const stats = useMemo(
    () => ({
      total: jobs.length,
      applicants: jobs.reduce(
        (sum, job) => sum + (Array.isArray(job.applicants) ? job.applicants.length : 0),
        0
      ),
      companies: companies.length,
    }),
    [companies.length, jobs]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({...prev, [name]:undefined}));
  };

  const openCreateForm = () => {
    setFieldErrors({}); setSaveError(""); setNotice("");
    setSelectedJob(null);
    setFormData({
      ...emptyJobForm,
      location: defaults?.defaultLocation || "",
      jobType: defaults?.defaultJobType || "Full-time",
      workMode: defaults?.defaultWorkMode || "",
      company: companies[0]?._id || "",
    });
    setMode("create");
  };

  const openEditForm = (job) => {
    setFieldErrors({}); setSaveError(""); setNotice("");
    setSelectedJob(job);
    setFormData(mapJobToForm(job));
    setMode("edit");
  };

  const closeForm = () => {
    setFieldErrors({}); setSaveError("");
    setSelectedJob(null);
    setFormData({
      ...emptyJobForm,
      company: companies[0]?._id || "",
    });
    setMode("list");
  };

  useEffect(() => { if (mode !== "list") headingRef.current?.focus(); }, [mode]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    const invalid = {};
    for (const [field,label] of [["title","Job title"],["company","Company"],["location","Location"],["salary","Salary"],["jobType","Job type"],["description","Description"]]) if (!String(formData[field] || "").trim()) invalid[field] = `${label} is required.`;
    if (!parseRequirements(formData.requirement).length) invalid.requirement = "Add at least one skill or requirement.";
    if (formData.openings && (!Number.isInteger(Number(formData.openings)) || Number(formData.openings) < 1 || Number(formData.openings) > 1000)) invalid.openings = "Enter a whole number from 1 to 1000.";
    if (formData.applicationDeadline && (!/^\d{4}-\d{2}-\d{2}$/.test(formData.applicationDeadline) || Number.isNaN(Date.parse(formData.applicationDeadline)))) invalid.applicationDeadline = "Enter a valid date.";
    setFieldErrors(invalid); setSaveError("");
    if (Object.keys(invalid).length) { requestAnimationFrame(() => document.getElementById(`cj-${Object.keys(invalid)[0]}`)?.focus()); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        title: formData.title.trim(),
        location: formData.location.trim(),
        salary: formData.salary.trim(),
        description: formData.description.trim(),
        jobType: formData.jobType.trim(),
        requirement:
          mode === "edit"
            ? parseRequirements(formData.requirement)
            : parseRequirements(formData.requirement).join(","),
      };

      const response =
        mode === "edit" && selectedJob?._id
          ? await updateJobApiCall(selectedJob._id, payload)
          : await postJobApiCall(payload);

      if (!response.data.success) throw new Error(response.data.message || "Unable to save job.");
      const record = mode === "edit" ? {...selectedJob, ...payload, requirement:parseRequirements(formData.requirement)} : response.data.job;
      if (!record?._id) throw new Error("Unable to confirm the saved job. Please try again.");
      const saved = {...record, company:companies.find((item) => item._id === formData.company) || record.company};
      setJobs((old) => mode === "edit" ? old.map((item) => item._id === saved._id ? saved : item) : [saved, ...old]);
      closeForm(); setSearchTerm(""); setTypeFilter(""); setNotice(mode === "edit" ? "Job changes saved." : "Job posted successfully.");
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (submitError) {
      setSaveError(submitError.response?.data?.message || submitError.message || "Unable to save job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <JobsSkeleton />;
  if (error) return <section className="cj-state" role="alert"><AlertTriangle size={26} aria-hidden="true" /><h1>Jobs did not load</h1><p>{error}</p><button type="button" className="btn-primary" onClick={fetchWorkspace}><RefreshCw size={16} aria-hidden="true" />Try again</button></section>;
  return <section className="cj-page">
    {jobToDelete && <DeleteJobDialog job={jobToDelete} onCancel={() => setJobToDelete(null)} onDeleted={(id) => {
      setJobs((old) => old.filter((job) => job._id !== id)); setJobToDelete(null); setNotice("Job deleted.");
      requestAnimationFrame(() => headingRef.current?.focus());
    }} />}
    <header className="cj-heading"><div><h1 ref={headingRef} tabIndex={-1}>{mode === "list" ? "Jobs" : mode === "edit" ? "Edit job listing" : "Create job listing"}</h1><p>{mode === "list" ? "Your openings, ready for the right people." : "Give candidates a clear picture of the role and your team."}</p></div>
      {mode === "list" && companies.length > 0 && <button type="button" className="btn-primary" onClick={openCreateForm}><Plus size={17} aria-hidden="true" />New job</button>}
      {mode !== "list" && <button type="button" className="btn-secondary" disabled={saving} onClick={closeForm}>Back to jobs</button>}
    </header>
    {notice && <p className="cj-notice" role="status">{notice}</p>}
    {mode !== "list" ? <JobCreate companies={companies} formData={formData} mode={mode} saving={saving} errors={fieldErrors} serverError={saveError} onChange={handleChange} onCancel={closeForm} onSubmit={handleSubmit} /> : <>
      <div className="cj-summary" aria-label="Job summary">{[[BriefcaseBusiness,"Job listings",stats.total],[Users,"Applications received",stats.applicants],[Building2,"Company profiles",stats.companies]].map(([Icon,label,value]) => <div key={label}><Icon size={18} aria-hidden="true" /><span>{label}</span><strong>{value}</strong></div>)}</div>
      {companies.length === 0 ? <div className="cj-state"><Building2 size={30} aria-hidden="true" /><h2>Start with your company.</h2><p>Add your company profile so candidates know who they will be joining.</p><Link className="btn-primary" to="/company/profile">Set up company profile<ArrowUpRight size={16} aria-hidden="true" /></Link></div> : <section className="cj-list-panel" aria-label="Company job listings">
        <div className="cj-toolbar"><div className="cj-search"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="cj-search">Search job listings</label><input id="cj-search" type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search title, location, or skill" /></div><div className="cj-filters"><label className="sr-only" htmlFor="cj-type">Filter by job type</label><select id="cj-type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">All job types</option>{[...new Set(jobs.map((job) => job.jobType).filter(Boolean))].sort().map((type) => <option key={type} value={type}>{type}</option>)}</select><label className="sr-only" htmlFor="cj-sort">Sort jobs</label><select id="cj-sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="new">Newest first</option><option value="old">Oldest first</option><option value="applicants">Most applicants</option></select></div></div>
        <div className="cj-result-heading"><h2>{searchTerm || typeFilter ? "Search results" : "All job listings"}<span>{visibleJobs.length}</span></h2>{(searchTerm || typeFilter) && <button type="button" onClick={() => {setSearchTerm("");setTypeFilter("");}}>Clear filters</button>}</div>
        {visibleJobs.length ? <div>{visibleJobs.map((job) => <JobCard key={job._id} job={job} onEdit={openEditForm} onDelete={setJobToDelete} />)}</div> : <div className="cj-state cj-empty"><BriefcaseBusiness size={30} aria-hidden="true" /><h2>{jobs.length ? "No matching jobs." : "Your next hire starts here."}</h2><p>{jobs.length ? "Try a different keyword or clear your filters." : "Create your first opening and give the right people a reason to join."}</p>{jobs.length ? <button type="button" className="btn-secondary" onClick={() => {setSearchTerm("");setTypeFilter("");}}>Clear filters</button> : <button type="button" className="btn-primary" onClick={openCreateForm}><Plus size={16} aria-hidden="true" />Create a job</button>}</div>}
      </section>}
    </>}
  </section>;
};

const JobsSkeleton = () => <section className="cj-page" aria-busy="true" aria-label="Company jobs"><span className="sr-only" role="status">Loading job listings...</span><div aria-hidden="true" className="cj-page motion-safe:animate-pulse"><div className="cj-heading"><div className="grid w-full gap-3"><span className="cj-skeleton h-8 w-28" /><span className="cj-skeleton h-3 w-2/3 max-w-sm" /></div><span className="cj-skeleton h-12 w-32 shrink-0" /></div><div className="cj-summary">{[0,1,2].map((item) => <div key={item}><span className="cj-skeleton h-4 w-3/4" /><span className="cj-skeleton h-6 w-8" /></div>)}</div><div className="cj-list-panel"><div className="cj-toolbar"><span className="cj-skeleton h-11 w-full max-w-md" /><span className="cj-skeleton h-11 w-40" /></div>{[0,1,2].map((item) => <div className="cj-skeleton-row" key={item}><span className="cj-skeleton h-12 w-12 shrink-0" /><div className="grid w-full gap-4"><span className="cj-skeleton h-5 w-1/2" /><span className="cj-skeleton h-3 w-3/4" /><span className="cj-skeleton h-3 w-2/3" /></div></div>)}</div></div></section>;
export default CompanyJobs;
