import { useRef, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Edit3,
  MapPin,
  Mail,
  Phone,
  BriefcaseBusiness,
  FileText,
  Upload,
  ArrowUpRight,
  ArrowRight,
  Check,
  Plus,
  UserRound,
  Globe,
  Github,
  LoaderCircle,
  ExternalLink,
} from "lucide-react";
import { getProfileChecklist } from "../components/jobseeker/dashboardData";
import { useJobseekerApplications } from "../hooks/useJobseekerApplications";
import {
  JobseekerApplicationList,
  JobseekerEmptyApplications,
} from "../components/jobseeker/JobseekerApplicationList";
import { ProfileEditDialog } from "../components/jobseeker/ProfileEditDialog";
import { userResumeUploadApi } from "../API/api";
import { setUser } from "../redux/authSlice";
import "./Profile.css";

const safeWebLink = (value) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

export const Profile = () => {
  const user = useSelector((store) => store.auth.user);
  const dispatch = useDispatch();
  const workspace = useOutletContext();
  const localApplications = useJobseekerApplications(
    user?._id,
    !!user && !workspace && user.role === "jobseeker",
  );
  const applicationData = workspace || localApplications;
  const [params, setParams] = useSearchParams();
  const active = ["overview", "skills", "applications"].includes(
    params.get("tab"),
  )
    ? params.get("tab")
    : "overview";
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [imageFailed, setImageFailed] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [uploading, setUploading] = useState(false);
  const resumeInput = useRef(null);
  const tabsRef = useRef([]);
  if (!user) return null;
  const checklist = getProfileChecklist(user);
  const completion = Math.round(
    (checklist.filter((item) => item.complete).length / checklist.length) * 100,
  );
  const skills = Array.isArray(user.profile?.skills)
    ? user.profile.skills.filter(
        (skill) => typeof skill === "string" && skill.trim(),
      )
    : [];
  const experience = Array.isArray(user.profile?.experience)
    ? user.profile.experience
    : [];
  const jobseeker = user.role === "jobseeker";
  const jobsPath = jobseeker ? "/jobseeker/jobs" : "/findJob";
  const tabs = [
    ["overview", "Overview"],
    ["skills", "Skills"],
    ...(jobseeker ? [["applications", "Applications"]] : []),
  ];
  const changeTab = (value) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        value === "overview" ? next.delete("tab") : next.set("tab", value);
        return next;
      },
      { replace: true },
    );
  };
  const uploadResume = async () => {
    if (!resumeFile || uploading) return;
    setUploading(true);
    setResumeError("");
    try {
      const data = new FormData();
      data.append("resume", resumeFile);
      const response = await userResumeUploadApi(data);
      if (!response.data?.success || !response.data.user)
        throw new Error(
          response.data?.message || "We could not upload your resume.",
        );
      dispatch(setUser(response.data.user));
      setResumeFile(null);
      if (resumeInput.current) resumeInput.current.value = "";
      setNotice("Your resume has been updated.");
    } catch (error) {
      setResumeError(
        error.response?.data?.message ||
          error.message ||
          "We could not upload your resume. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };
  const resumeUrl = safeWebLink(user.profile?.resume);
  const website = safeWebLink(user.profile?.website);
  const github = safeWebLink(user.profile?.github);
  const edit = () => {
    setNotice("");
    setEditing(true);
  };
  return (
    <div className="profile-page page-container">
      <div className="pp-page-heading">
        <div>
          <p className="eyebrow">Your experience, together</p>
          <h1>My profile</h1>
          <p>Give your next opportunity a clearer picture of you.</p>
        </div>
        <button type="button" className="btn-primary" onClick={edit}>
          <Edit3 size={17} aria-hidden="true" />
          Edit profile
        </button>
      </div>
      {notice && (
        <div className="pp-alert pp-alert-success" role="status">
          <Check size={18} aria-hidden="true" />
          <p>{notice}</p>
        </div>
      )}
      <header className="pp-identity">
        <div className="pp-avatar" aria-hidden="true">
          {user.profile?.profileImg && !imageFailed ? (
            <img
              src={user.profile.profileImg}
              alt=""
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{(user.name || "J").trim().slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div className="pp-identity-copy">
          <span className="pp-role-label">
            {jobseeker
              ? "Jobseeker"
              : "Company account"}
          </span>
          <h2>{user.name || "Your name"}</h2>
          <div>
            {user.profile?.location && (
              <span>
                <MapPin size={15} aria-hidden="true" />
                {user.profile.location}
              </span>
            )}
            <span>
              <Mail size={15} aria-hidden="true" />
              {user.email}
            </span>
          </div>
        </div>
        <a className="pp-secondary-button" href="#profile-resume">
          <FileText size={17} aria-hidden="true" />
          Manage resume
        </a>
      </header>
      <div className="pp-layout">
        <div className="pp-main">
          <section className="pp-panel">
            <div
              className="pp-tabs"
              role="tablist"
              aria-label="Profile sections"
              onKeyDown={(event) => {
                const index = tabs.findIndex(([key]) => key === active);
                let next;
                if (event.key === "ArrowRight")
                  next = (index + 1) % tabs.length;
                else if (event.key === "ArrowLeft")
                  next = (index - 1 + tabs.length) % tabs.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = tabs.length - 1;
                else return;
                event.preventDefault();
                changeTab(tabs[next][0]);
                tabsRef.current[next]?.focus();
              }}
            >
              {tabs.map(([key, label], index) => (
                <button
                  key={key}
                  type="button"
                  ref={(element) => {
                    tabsRef.current[index] = element;
                  }}
                  role="tab"
                  id={`profile-tab-${key}`}
                  aria-controls={`profile-panel-${key}`}
                  aria-selected={active === key}
                  tabIndex={active === key ? 0 : -1}
                  onClick={() => changeTab(key)}
                >
                  {label}
                  {key === "skills" && <span>{skills.length}</span>}
                  {key === "applications" &&
                    !applicationData.loading &&
                    !applicationData.error && (
                      <span>{applicationData.applications.length}</span>
                    )}
                </button>
              ))}
            </div>
            <div
              className="pp-tab-content"
              role="tabpanel"
              id={`profile-panel-${active}`}
              aria-labelledby={`profile-tab-${active}`}
              tabIndex={0}
            >
              {active === "overview" && (
                <>
                  <div className="pp-section-heading">
                    <h2>About you</h2>
                    <button
                      type="button"
                      className="pp-inline-button"
                      onClick={edit}
                    >
                      Edit
                      <Edit3 size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <p className="pp-bio">
                    {user.profile?.bio ||
                      "Introduce yourself, the work you enjoy, and the experience you bring. A short summary helps companies get to know you."}
                  </p>
                  <div className="pp-overview-details">
                    <div>
                      <MapPin size={18} aria-hidden="true" />
                      <span>
                        <small>Location</small>
                        <strong>
                          {user.profile?.location || "Not added yet"}
                        </strong>
                      </span>
                    </div>
                    <div>
                      <BriefcaseBusiness size={18} aria-hidden="true" />
                      <span>
                        <small>Experience</small>
                        <strong>
                          {experience.length
                            ? `${experience.length} ${experience.length === 1 ? "role" : "roles"} added`
                            : typeof user.profile?.experience === "string" &&
                                user.profile.experience.trim()
                              ? user.profile.experience
                              : "Not added yet"}
                        </strong>
                      </span>
                    </div>
                  </div>
                  <div className="pp-section-divider" />
                  <div className="pp-section-heading">
                    <h2>Your skills</h2>
                    <button
                      type="button"
                      className="pp-inline-button"
                      onClick={edit}
                    >
                      Manage
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                  {skills.length ? (
                    <div className="pp-skill-tags">
                      {skills.slice(0, 8).map((skill, index) => (
                        <span key={`${skill}-${index}`}>{skill}</span>
                      ))}
                      {skills.length > 8 && (
                        <button
                          type="button"
                          onClick={() => changeTab("skills")}
                        >
                          +{skills.length - 8} more
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="pp-empty-inline">
                      <p>
                        Add the tools, skills, and strengths you want to bring
                        to your next role.
                      </p>
                      <button
                        type="button"
                        className="pp-inline-button"
                        onClick={edit}
                      >
                        <Plus size={16} aria-hidden="true" />
                        Add your skills
                      </button>
                    </div>
                  )}
                  {experience.length > 0 && (
                    <>
                      <div className="pp-section-divider" />
                      <h2 className="pp-section-title">Work experience</h2>
                      <div className="pp-experience">
                        {experience.map((item, index) => (
                          <article key={index}>
                            <span>
                              <BriefcaseBusiness size={19} aria-hidden="true" />
                            </span>
                            <div>
                              <h3>{item.role || "Role not specified"}</h3>
                              <p>
                                {[item.company, item.years]
                                  .filter(Boolean)
                                  .join(" / ") || "No further details added"}
                              </p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
              {active === "skills" && (
                <>
                  <div className="pp-section-heading">
                    <div>
                      <h2>Professional skills</h2>
                      <p>The skills and tools you bring to your next role.</p>
                    </div>
                    <button
                      type="button"
                      className="pp-inline-button"
                      onClick={edit}
                    >
                      Edit skills
                      <Edit3 size={14} aria-hidden="true" />
                    </button>
                  </div>
                  {skills.length ? (
                    <div className="pp-skill-tags pp-skill-tags-large">
                      {skills.map((skill, index) => (
                        <Link
                          key={`${skill}-${index}`}
                          to={`${jobsPath}?keyword=${encodeURIComponent(skill)}`}
                        >
                          {skill}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="pp-empty-inline">
                      <p>
                        No skills added yet. Start with the tools and strengths
                        you use most.
                      </p>
                      <button
                        className="pp-inline-button"
                        type="button"
                        onClick={edit}
                      >
                        Add your first skill
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </>
              )}
              {active === "applications" && (
                <>
                  <div className="pp-section-heading">
                    <div>
                      <h2>Your applications</h2>
                      <p>A view of your most recent opportunities.</p>
                    </div>
                    <Link
                      className="pp-inline-button"
                      to="/jobseeker/applications"
                    >
                      View all
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                  {applicationData.loading ? (
                    <p className="pp-muted" role="status">
                      Loading applications...
                    </p>
                  ) : applicationData.error ? (
                    <div className="pp-alert pp-alert-error" role="alert">
                      <p>{applicationData.error}</p>
                      <button onClick={applicationData.retry}>Try again</button>
                    </div>
                  ) : applicationData.applications.length ? (
                    <JobseekerApplicationList
                      applications={applicationData.applications.slice(0, 5)}
                    />
                  ) : (
                    <JobseekerEmptyApplications />
                  )}
                </>
              )}
            </div>
          </section>
          <section className="pp-panel pp-contact-panel">
            <div className="pp-section-heading">
              <h2>Contact & links</h2>
              <button type="button" className="pp-inline-button" onClick={edit}>
                Edit
                <Edit3 size={14} aria-hidden="true" />
              </button>
            </div>
            <dl className="pp-contact-grid">
              <div>
                <dt>
                  <Mail size={16} aria-hidden="true" />
                  Email address
                </dt>
                <dd>
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </dd>
              </div>
              <div>
                <dt>
                  <Phone size={16} aria-hidden="true" />
                  Phone number
                </dt>
                <dd>
                  {user.profile?.phone ? (
                    <a
                      href={`tel:${user.profile.phone.replace(/[^\d+]/g, "")}`}
                    >
                      {user.profile.phone}
                    </a>
                  ) : (
                    "Not added yet"
                  )}
                </dd>
              </div>
              <div>
                <dt>
                  <Globe size={16} aria-hidden="true" />
                  Portfolio
                </dt>
                <dd>
                  {website ? (
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      Visit portfolio
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    "Not added yet"
                  )}
                </dd>
              </div>
              <div>
                <dt>
                  <Github size={16} aria-hidden="true" />
                  GitHub
                </dt>
                <dd>
                  {github ? (
                    <a href={github} target="_blank" rel="noopener noreferrer">
                      View GitHub
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    "Not added yet"
                  )}
                </dd>
              </div>
            </dl>
          </section>
        </div>
        <aside className="pp-rail" aria-label="Profile progress and resume">
          <section className="pp-panel pp-completion">
            <div className="pp-section-heading">
              <h2>Make your profile count.</h2>
              <UserRound size={20} aria-hidden="true" />
            </div>
            <div className="pp-score">
              <strong>{completion}%</strong>
              <span>
                {checklist.filter((item) => item.complete).length} of{" "}
                {checklist.length} details added
              </span>
            </div>
            <progress
              aria-label="Profile completion"
              max="100"
              value={completion}
            >
              {completion}%
            </progress>
            <ul>
              {checklist.map((item) => (
                <li
                  key={item.label}
                  className={item.complete ? "is-complete" : ""}
                >
                  {item.complete ? (
                    <Check size={15} aria-hidden="true" />
                  ) : (
                    <Plus size={15} aria-hidden="true" />
                  )}
                  {item.label}
                  <span>{item.complete ? "Added" : "To add"}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="pp-complete-button" onClick={edit}>
              {completion === 100
                ? "Keep your profile current"
                : "Complete your profile"}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </section>
          <section className="pp-panel pp-resume" id="profile-resume">
            <span className="pp-resume-icon">
              <FileText size={23} aria-hidden="true" />
            </span>
            <h2>Your resume</h2>
            <p>
              {resumeUrl
                ? "Your resume is on your profile. Keep it up to date as your experience grows."
                : "A clearer picture of your experience starts with your resume."}
            </p>
            {resumeUrl && (
              <a
                className="pp-resume-link"
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View current resume
                <ExternalLink size={15} aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <label className="pp-resume-picker" htmlFor="profile-resume-file">
              <Upload size={17} aria-hidden="true" />
              {resumeUrl ? "Choose a replacement" : "Choose your resume"}
              <input
                ref={resumeInput}
                id="profile-resume-file"
                type="file"
                disabled={uploading}
                accept=".pdf,.doc,.docx"
                aria-describedby="profile-resume-hint"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (
                    file &&
                    (!/\.(pdf|doc|docx)$/i.test(file.name) ||
                      file.size > 5 * 1024 * 1024)
                  ) {
                    setResumeFile(null);
                    setResumeError(
                      "Choose a PDF, DOC, or DOCX file up to 5 MB.",
                    );
                    event.target.value = "";
                    return;
                  }
                  setResumeError("");
                  setResumeFile(file || null);
                }}
              />
            </label>
            <p className="pp-field-hint" id="profile-resume-hint">
              PDF, DOC, or DOCX. Maximum 5 MB.
            </p>
            {resumeFile && (
              <div className="pp-selected-resume">
                <span>{resumeFile.name}</span>
                <button
                  className="btn-primary"
                  type="button"
                  disabled={uploading}
                  onClick={uploadResume}
                >
                  {uploading ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                        aria-hidden="true"
                      />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload resume
                      <ArrowRight size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            )}
            {resumeError && (
              <p className="pp-field-error" role="alert">
                {resumeError}
              </p>
            )}
          </section>
          <section className="pp-next-step">
            <h2>Your profile is just the beginning.</h2>
            <p>Take your experience somewhere new.</p>
            <Link to={jobsPath}>
              Explore opportunities
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
      {editing && (
        <ProfileEditDialog
          user={user}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setNotice("Your profile has been updated.");
            setImageFailed(false);
          }}
        />
      )}
    </div>
  );
};
