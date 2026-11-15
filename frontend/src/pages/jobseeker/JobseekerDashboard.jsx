import { Link, useOutletContext } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CircleCheck,
  CircleX,
  ArrowUpRight,
  ArrowRight,
  UserRound,
  Check,
  Plus,
  FileText,
  BriefcaseBusiness,
} from "lucide-react";
import useGetAllJobs from "../../hooks/useGetAllJobs";
import {
  JobseekerApplicationList,
  JobseekerEmptyApplications,
} from "../../components/jobseeker/JobseekerApplicationList";
import {
  applicationStatus,
  getProfileChecklist,
} from "../../components/jobseeker/dashboardData";

export const JobseekerDashboard = () => {
  const { user, applications, loading, error, retry } = useOutletContext();
  const jobs = useGetAllJobs({ keyword: "", limit: 4 });
  const checklist = getProfileChecklist(user);
  const completed = checklist.filter((item) => item.complete).length;
  const completion = Math.round((completed / checklist.length) * 100);
  const stats = [
    {
      title: "Total applications",
      value: applications.length,
      Icon: ClipboardList,
      status: "",
      note: "Your applications so far",
    },
    {
      title: "Pending review",
      value: applications.filter((a) => applicationStatus(a) === "pending")
        .length,
      Icon: Clock3,
      status: "pending",
      note: "Awaiting a recruiter decision",
    },
    {
      title: "Accepted",
      value: applications.filter((a) => applicationStatus(a) === "accepted")
        .length,
      Icon: CircleCheck,
      status: "accepted",
      note: "Marked accepted by recruiters",
    },
    {
      title: "Not selected",
      value: applications.filter((a) => applicationStatus(a) === "rejected")
        .length,
      Icon: CircleX,
      status: "rejected",
      note: "Room for your next opportunity",
    },
  ];
  const skills = Array.isArray(user.profile?.skills)
    ? user.profile.skills.filter(
        (skill) => typeof skill === "string" && skill.trim(),
      )
    : [];
  return (
    <div className="js-dashboard">
      <section className="js-welcome">
        <div>
          <p>YOUR NEXT CHAPTER</p>
          <h1>Welcome back, {user.name?.trim().split(/\s+/)[0] || "there"}.</h1>
          <span>
            A little progress, every day. Here is where your job search stands.
          </span>
        </div>
        <Link to="/jobseeker/jobs" className="js-welcome-button">
          Explore jobs
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
      <section
        className="js-stats"
        aria-label="Application overview"
        aria-busy={loading}
      >
        {stats.map(({ title, value, Icon, status, note }) => (
          <Link
            key={title}
            className={`js-stat js-stat-${status || "total"}`}
            to={`/jobseeker/applications${status ? "?status=" + status : ""}`}
          >
            <div>
              <span className="js-stat-icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span>{title}</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
            <strong>{loading || error ? "—" : value}</strong>
            <p>
              {loading
                ? "Loading your applications..."
                : error
                  ? "Application data unavailable"
                  : note}
            </p>
          </Link>
        ))}
      </section>
      <div className="js-dashboard-grid">
        <div className="js-dashboard-primary">
          <section className="js-panel">
            <div className="js-panel-heading">
              <div>
                <h2>Recent applications</h2>
                <p>Keep an eye on your next opportunities.</p>
              </div>
              <Link to="/jobseeker/applications" className="js-inline-link">
                View all
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            {loading ? (
              <div className="js-loading" role="status">
                Loading your applications...
              </div>
            ) : error ? (
              <div className="js-inline-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={retry}>
                  Try again
                </button>
              </div>
            ) : applications.length ? (
              <JobseekerApplicationList
                applications={applications.slice(0, 4)}
              />
            ) : (
              <JobseekerEmptyApplications />
            )}
          </section>
          <section className="js-panel">
            <div className="js-panel-heading">
              <div>
                <h2>Latest opportunities</h2>
                <p>New places to put your experience to work.</p>
              </div>
              <Link to="/jobseeker/jobs" className="js-inline-link">
                All jobs
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <div className="js-latest-jobs" aria-busy={jobs.loading}>
              {jobs.loading ? (
                <div className="js-loading" role="status">
                  Finding opportunities...
                </div>
              ) : jobs.error ? (
                <div className="js-inline-error">
                  <p>We could not load the latest jobs.</p>
                  <button onClick={jobs.retry}>Try again</button>
                </div>
              ) : jobs.jobs.length ? (
                jobs.jobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/jobseeker/jobs/${job._id}`}
                    className="js-latest-job"
                  >
                    <span className="js-company-initial" aria-hidden="true">
                      {(job.company?.companyName || "J").slice(0, 1)}
                    </span>
                    <div>
                      <h3>{job.title}</h3>
                      <p>{job.company?.companyName || "Company"}</p>
                      <span>
                        {job.location || "Location not specified"}
                        <span aria-hidden="true"> / </span>
                        {job.jobType || "View role"}
                      </span>
                    </div>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                ))
              ) : (
                <div className="js-empty">
                  <BriefcaseBusiness size={26} aria-hidden="true" />
                  <h3>No listings to show just yet.</h3>
                  <p>Check back for fresh opportunities.</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <aside
          className="js-dashboard-secondary"
          aria-label="Profile and next steps"
        >
          <section className="js-panel js-profile-progress">
            <div className="js-panel-heading">
              <div>
                <h2>Your profile</h2>
                <p>A little detail goes a long way.</p>
              </div>
              <span className="js-profile-symbol">
                <UserRound size={20} aria-hidden="true" />
              </span>
            </div>
            <div className="js-profile-score">
              <strong>{completion}%</strong>
              <span>
                {completed} of {checklist.length} details added
              </span>
            </div>
            <progress
              max="100"
              value={completion}
              aria-label="Profile completion"
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
            <Link to="/jobseeker/profile" className="js-profile-action">
              {completion === 100
                ? "View your profile"
                : "Complete your profile"}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
          <section className="js-panel js-resume-panel">
            <span className="js-profile-symbol">
              <FileText size={22} aria-hidden="true" />
            </span>
            <h2>
              {user.profile?.resume
                ? "Your resume is ready."
                : "Bring your experience along."}
            </h2>
            <p>
              {user.profile?.resume
                ? "Keep your resume current as your experience grows."
                : "Add a resume to your profile so recruiters can learn more about your work."}
            </p>
            <Link className="js-inline-link" to="/jobseeker/profile">
              Manage your resume
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </section>
          <section className="js-panel js-skills-panel">
            <h2>Explore your direction</h2>
            <p>
              {skills.length
                ? "Search for opportunities using your skills."
                : "Start with a role or a way of working."}
            </p>
            <div>
              {(skills.length
                ? skills.slice(0, 5)
                : ["Frontend Developer", "Remote", "Design"]
              ).map((skill) => (
                <Link
                  key={skill}
                  to={`/jobseeker/jobs?keyword=${encodeURIComponent(skill)}`}
                >
                  {skill}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
