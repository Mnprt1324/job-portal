import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowUpRight, BriefcaseBusiness, Building2, Users } from "lucide-react";
import { getCompanyJobsApi, getOwnedCompaniesApi } from "../../API/api";
import "./CompanyWorkspace.css";

const CompanyDashboardSkeleton = () => (
  <section aria-busy="true" aria-label="Company dashboard" className="company-dashboard-skeleton">
    <span className="sr-only" role="status">Loading your hiring overview...</span>
    <div aria-hidden="true" className="company-overview motion-safe:animate-pulse">
      <div className="js-welcome min-h-[166px]">
        <div className="grid w-full gap-4"><div className="h-3 w-36 rounded bg-white/25" /><div className="h-9 w-3/4 max-w-md rounded bg-white/25" /><div className="h-3 w-4/5 max-w-sm rounded bg-white/25" /></div>
        <div className="h-12 w-40 shrink-0 rounded-lg bg-white/25" />
      </div>
      <div className="company-stats">{[0, 1, 2].map((item) => (
        <div key={item} className="company-stat grid min-h-[142px] gap-6"><div className="h-3 w-3/4 rounded bg-[var(--color-border)]" /><div className="h-8 w-12 rounded bg-[var(--color-border)]" /></div>
      ))}</div>
      <div className="company-overview-grid">
        <div className="company-panel"><header><div className="grid w-full gap-3"><div className="h-5 w-44 max-w-full rounded bg-[var(--color-border)]" /><div className="h-3 w-3/4 rounded bg-[var(--color-border)]" /></div></header>
          <div className="px-6">{[0, 1, 2].map((item) => <div key={item} className="grid gap-3 border-b border-[var(--color-border)] py-5 last:border-0"><div className="h-4 w-1/2 rounded bg-[var(--color-border)]" /><div className="h-3 w-3/4 rounded bg-[var(--color-border)]" /></div>)}</div>
        </div>
        <div className="company-panel"><header><div className="grid w-full gap-3"><div className="h-5 w-36 max-w-full rounded bg-[var(--color-border)]" /><div className="h-3 w-4/5 rounded bg-[var(--color-border)]" /></div></header><div className="company-panel-body grid gap-5"><div className="h-5 w-1/2 rounded bg-[var(--color-border)]" /><div className="h-3 w-full rounded bg-[var(--color-border)]" /><div className="h-3 w-3/4 rounded bg-[var(--color-border)]" /><div className="mt-3 h-4 w-2/3 rounded bg-[var(--color-border)]" /></div></div>
      </div>
    </div>
  </section>
);

export const CompanyDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const [data, setData] = useState({ jobs: [], companies: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getCompanyJobsApi(), getOwnedCompaniesApi()])
      .then(([jobs, companies]) => {
        if (active) setData({ jobs: jobs.data.jobs || [], companies: companies.data.companies || [] });
      })
      .catch(() => { if (active) setError("We could not load your hiring overview. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const applicants = data.jobs.reduce((count, job) => count + (job.applicants?.length || 0), 0);
  const stats = [
    ["Job listings", data.jobs.length, BriefcaseBusiness, "/company/jobs"],
    ["Applications received", applicants, Users, "/company/jobs"],
    ["Company profiles", data.companies.length, Building2, "/company/profile"],
  ];
  if (loading) return <CompanyDashboardSkeleton />;
  return <div className="company-overview">
    <section className="js-welcome">
      <div><p>YOUR HIRING WORKSPACE</p><h1>Welcome back, {user.name?.split(" ")[0] || "there"}.</h1><span>Bring your team’s next chapter into focus.</span></div>
      <Link className="company-welcome-link" to="/company/jobs">Manage jobs <ArrowUpRight size={18} aria-hidden="true" /></Link>
    </section>
    {error ?
      <div className="company-state" role="alert"><p>{error}</p><button className="btn-primary" onClick={() => setAttempt((value) => value + 1)}>Try again</button></div> : <>
      <section className="company-stats" aria-label="Hiring overview">{stats.map(([label, count, Icon, path]) =>
        <Link to={path} key={label} className="company-stat"><span><Icon size={19} aria-hidden="true" />{label}<ArrowUpRight size={15} aria-hidden="true" /></span><strong>{count}</strong></Link>
      )}</section>
      <div className="company-overview-grid">
        <section className="company-panel"><header><div><h2>Recent job listings</h2><p>The roles you are building your team around.</p></div><Link to="/company/jobs">View all <ArrowUpRight size={15} aria-hidden="true" /></Link></header>
          {data.jobs.length ? <ul>{[...data.jobs].sort((a,b) => new Date(b.createdAt || 0)-new Date(a.createdAt || 0)).slice(0,5).map((job) => <li key={job._id}><div><h3>{job.title}</h3><p>{[job.company?.companyName, job.location, job.jobType].filter(Boolean).join(" · ")}</p></div><Link to="/company/jobs">Manage <ArrowUpRight size={15} aria-hidden="true" /></Link></li>)}</ul> : <div className="company-empty"><BriefcaseBusiness size={30} aria-hidden="true" /><h3>Your next hire starts here.</h3><p>Add your company profile, then publish your first opening.</p><Link className="btn-primary" to={data.companies.length ? "/company/jobs" : "/company/profile"}>{data.companies.length ? "Create a job" : "Set up company profile"}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>}
        </section>
        <section className="company-panel"><header><div><h2>Your company</h2><p>Help candidates get to know your team.</p></div><Building2 size={22} aria-hidden="true" /></header><div className="company-panel-body"><h3>{data.companies[0]?.companyName || "Tell your company’s story."}</h3><p>{data.companies[0]?.description || "Add your company details, location, and website to give every opening more context."}</p><Link className="company-inline-link" to="/company/profile">Manage company profile <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>
      </div>
    </>}
  </div>;
};
