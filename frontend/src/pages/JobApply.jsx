import { Link, useOutletContext, useParams } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  BriefcaseBusiness,
  CalendarDays,
  Building2,
  FileText,
  Check,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import useGetSingleJob from "../hooks/useGetSingleJob";
import { useJobseekerApplications } from "../hooks/useJobseekerApplications";
import { applyJobApiCall } from "../API/api";
import "./JobApply.css";

export const JobApply = () => {
  const { id } = useParams();
  const user = useSelector((store) => store.auth.user);
  const job = useSelector((store) => store.job.singleJob);
  const workspace = useOutletContext();
  const localApplications = useJobseekerApplications(
    user?._id,
    !!user && !workspace && user.role === "jobseeker",
  );
  const applications = workspace || localApplications;
  const { loading, error, retry } = useGetSingleJob(id);
  const [applying, setApplying] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [applyError, setApplyError] = useState(null);
  const isApplied =
    submitted === id ||
    applications.applications.some(
      (application) => application.job?._id === id,
    );
  const jobsPath = user?.role === "jobseeker" ? "/jobseeker/jobs" : "/findJob";
  const profilePath =
    user?.role === "jobseeker" ? "/jobseeker/profile" : "/profile";
  const submit = async () => {
    if (
      !user ||
      user.role !== "jobseeker" ||
      applying ||
      isApplied ||
      applications.loading ||
      applications.error
    )
      return;
    setApplying(true);
    setApplyError(null);
    try {
      const response = await applyJobApiCall(id);
      if (!response.data?.success) {
        setApplyError({
          id,
          message:
            response.data?.message ||
            "We could not submit your application. Please try again.",
        });
        return;
      }
      setSubmitted(id);
      applications.retry();
    } catch (error) {
      setApplyError({
        id,
        message:
          error.response?.data?.message ||
          "We could not submit your application. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  };
  if (error)
    return (
      <section className="job-detail-page page-container jd-error" role="alert">
        <span className="jd-error-icon">
          <AlertCircle size={28} aria-hidden="true" />
        </span>
        <h1>We could not load this role.</h1>
        <p>{error}</p>
        <button className="btn-primary" onClick={retry}>
          Try again
        </button>
        <Link to={jobsPath} className="text-link">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to jobs
        </Link>
      </section>
    );
  if (loading || !job)
    return (
      <section
        className="job-detail-page page-container jd-loading"
        role="status"
        aria-busy="true"
      >
        <p>Loading the opportunity...</p>
        <div className="jd-skeleton-header" />
        <div className="jd-skeleton-body" />
        <span className="sr-only">Loading job details</span>
      </section>
    );
  const company =
    job.company && typeof job.company === "object" ? job.company : null;
  const companyName = company?.companyName || "Company details unavailable";
  const requirements = Array.isArray(job.requirement)
    ? job.requirement.filter(
        (value) => typeof value === "string" && value.trim(),
      )
    : [];
  const date = new Date(job.createdAt);
  const posted =
    job.createdAt && !Number.isNaN(date.getTime())
      ? date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Not specified";
  const salary =
    job.salary != null && String(job.salary).trim() !== ""
      ? Number.isFinite(Number(job.salary))
        ? Number(job.salary).toLocaleString("en-IN")
        : String(job.salary)
      : "Not disclosed";
  let companyWebsite = null;
  try {
    const url = new URL(
      company?.website?.includes("://")
        ? company.website
        : `https://${company?.website || ""}`,
    );
    if (["https:", "http:"].includes(url.protocol)) companyWebsite = url.href;
  } catch {
    /* A missing website is not shown. */
  }
  const jobseeker = user?.role === "jobseeker";
  return (
    <div className="job-detail-page page-container">
      <Link className="jd-back" to={jobsPath}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to jobs
      </Link>
      <header className="jd-role-header">
        <div className="jd-company-line">
          <span className="jd-company-mark" aria-hidden="true">
            <span>{companyName.slice(0, 1)}</span>
            {company?.logo && (
              <img
                src={company.logo}
                alt=""
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}
          </span>
          <div>
            <span className="jd-company-name">{companyName}</span>
            <span className="jd-posted">Posted {posted}</span>
          </div>
          <span className="jd-type-badge">
            <BriefcaseBusiness size={14} aria-hidden="true" />
            {job.jobType || "Job type not specified"}
          </span>
        </div>
        <h1>{job.title}</h1>
        <div className="jd-role-meta">
          <span>
            <MapPin size={16} aria-hidden="true" />
            {job.location || "Location not specified"}
          </span>
          {job.experience && (
            <span>
              <BriefcaseBusiness size={16} aria-hidden="true" />
              {job.experience}
            </span>
          )}
          <span>
            <FileText size={16} aria-hidden="true" />
            {requirements.length
              ? `${requirements.length} listed ${requirements.length === 1 ? "requirement" : "requirements"}`
              : "See role details"}
          </span>
        </div>
      </header>
      <div className="jd-layout">
        <div className="jd-main-content">
          <section className="jd-section">
            <div className="jd-section-heading">
              <span className="jd-section-icon">
                <FileText size={19} aria-hidden="true" />
              </span>
              <h2>About this role</h2>
            </div>
            <p className="jd-description">
              {job.description ||
                "A description has not been provided for this role."}
            </p>
          </section>
          <section className="jd-section">
            <div className="jd-section-heading">
              <span className="jd-section-icon">
                <BriefcaseBusiness size={19} aria-hidden="true" />
              </span>
              <h2>Skills & requirements</h2>
            </div>
            <p className="jd-section-intro">
              The experience and skills listed for this opportunity.
            </p>
            {requirements.length ? (
              <ul className="jd-requirements">
                {requirements.map((requirement, index) => (
                  <li key={`${requirement}-${index}`}>
                    <Check size={16} aria-hidden="true" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="jd-description">
                No specific requirements have been listed.
              </p>
            )}
          </section>
          {company?.description && (
            <section className="jd-section">
              <div className="jd-section-heading">
                <span className="jd-section-icon">
                  <Building2 size={19} aria-hidden="true" />
                </span>
                <h2>About {companyName}</h2>
              </div>
              <p className="jd-description">{company.description}</p>
              {companyWebsite && (
                <a
                  className="jd-company-website"
                  href={companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit company website
                  <ArrowUpRight size={16} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </section>
          )}
        </div>
        <aside className="jd-rail" aria-label="Job overview and application">
          <section className="jd-application-panel">
            <p className="jd-eyebrow">Your next opportunity</p>
            <h2>Take the next step.</h2>
            <dl className="jd-facts">
              <div>
                <dt>
                  <MapPin size={16} aria-hidden="true" />
                  Location
                </dt>
                <dd>{job.location || "Not specified"}</dd>
              </div>
              <div>
                <dt>
                  <BriefcaseBusiness size={16} aria-hidden="true" />
                  Employment
                </dt>
                <dd>{job.jobType || "Not specified"}</dd>
              </div>
              <div>
                <dt>
                  <CalendarDays size={16} aria-hidden="true" />
                  Listed salary
                </dt>
                <dd>{salary}</dd>
              </div>
            </dl>
            {isApplied ? (
              <div className="jd-applied" role="status">
                <span>
                  <Check size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>Application submitted</h3>
                  <p>You have already applied for this role.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="jd-apply-note">
                  Your profile and resume help the recruiter get to know your
                  experience.
                </p>
                {jobseeker && applications.error ? (
                  <div className="jd-apply-error" role="alert">
                    <p>We could not check your application status.</p>
                    <button onClick={applications.retry} type="button">
                      Try again
                    </button>
                  </div>
                ) : jobseeker ? (
                  <button
                    className="btn-primary jd-apply-button"
                    onClick={submit}
                    disabled={applying || applications.loading}
                  >
                    {applying ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                          aria-hidden="true"
                        />
                        Submitting...
                      </>
                    ) : applications.loading ? (
                      "Checking application..."
                    ) : (
                      <>
                        Apply for this role
                        <ArrowRight size={18} aria-hidden="true" />
                      </>
                    )}
                  </button>
                ) : !user ? (
                  <Link className="btn-primary jd-apply-button" to="/login">
                    Sign in to apply
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <p className="jd-account-note">
                    Apply with a jobseeker account.
                  </p>
                )}
              </>
            )}
            {applyError?.id === id && (
              <p className="jd-apply-error" role="alert">
                {applyError.message}
              </p>
            )}
            {jobseeker && (
              <Link
                className="jd-secondary-action"
                to={isApplied ? "/jobseeker/applications" : profilePath}
              >
                {isApplied ? "View my applications" : "Review my profile"}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            )}
          </section>
          <div className="jd-help-panel">
            <span>
              <CircleInfoIcon />
            </span>
            <h2>A thoughtful application starts here.</h2>
            <p>
              Read the requirements, check your profile, and make sure your
              resume reflects your latest experience.
            </p>
            <Link to={user ? profilePath : "/login"}>
              Go to my profile
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
const CircleInfoIcon = () => <FileText size={20} aria-hidden="true" />;
