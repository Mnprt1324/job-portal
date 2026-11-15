import { Link } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, MapPin } from "lucide-react";
import PropTypes from "prop-types";
import { applicationStatus } from "./dashboardData";

export const JobseekerApplicationList = ({ applications }) => (
  <div className="js-application-list">
    {applications.map((application) => {
      const status = applicationStatus(application);
      const company =
        application.job?.company?.companyName || "Company unavailable";
      const date = new Date(application.createdAt);
      const dateLabel = Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
      return (
        <article key={application._id} className="js-application-row">
          <span className="js-company-initial" aria-hidden="true">
            {company.slice(0, 1)}
          </span>
          <div className="js-application-description">
            <h3>
              {application.job ? (
                <Link to={`/jobseeker/jobs/${application.job._id}`}>
                  {application.job.title || "View job listing"}
                </Link>
              ) : (
                "Listing no longer available"
              )}
            </h3>
            <p>
              {company}
              {application.job?.company?.location && (
                <>
                  <span aria-hidden="true"> / </span>
                  <MapPin size={12} aria-hidden="true" />
                  {application.job.company.location}
                </>
              )}
            </p>
            <span className="js-application-date">Applied {dateLabel}</span>
          </div>
          <span className={`js-status js-status-${status}`}>{status}</span>
          {application.job && (
            <Link
              className="js-application-open"
              to={`/jobseeker/jobs/${application.job._id}`}
              aria-label={`View ${application.job.title || "job"}`}
            >
              <ArrowUpRight size={18} />
            </Link>
          )}
        </article>
      );
    })}
  </div>
);
JobseekerApplicationList.propTypes = {
  applications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      status: PropTypes.string,
      createdAt: PropTypes.string,
      job: PropTypes.shape({
        _id: PropTypes.string,
        title: PropTypes.string,
        company: PropTypes.shape({
          companyName: PropTypes.string,
          location: PropTypes.string,
        }),
      }),
    }),
  ).isRequired,
};

export const JobseekerEmptyApplications = () => (
  <div className="js-empty">
    <BriefcaseBusiness size={29} aria-hidden="true" />
    <h3>Your next chapter starts with one application.</h3>
    <p>Find a role you like and apply. You can follow its progress here.</p>
    <Link to="/jobseeker/jobs" className="text-link">
      Explore jobs
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  </div>
);
