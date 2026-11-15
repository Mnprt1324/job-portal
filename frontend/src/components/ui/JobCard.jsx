import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin, Briefcase } from "lucide-react";
export const JobCard = ({ job }) => {
  const jobseeker = useSelector(
    (store) => store.auth.user?.role === "jobseeker",
  );
  const target = jobseeker
    ? `/jobseeker/jobs/${job._id}`
    : `/job/apply/${job._id}`;
  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className="company-initial" aria-hidden="true">
          {(job.company?.companyName || "J").slice(0, 1)}
        </span>
        <span>{job.company?.companyName || "Company"}</span>
        <ArrowUpRight size={19} aria-hidden="true" />
      </div>
      <h3>
        <Link to={target}>{job.title}</Link>
      </h3>
      <div className="job-meta">
        <span>
          <MapPin size={15} aria-hidden="true" />
          {job.location || "Location not specified"}
        </span>
        <span>
          <Briefcase size={15} aria-hidden="true" />
          {job.jobType || "Not specified"}
        </span>
      </div>
      <p className="job-description">
        {job.description ||
          "View this role for the full job details and requirements."}
      </p>
      <div className="job-card-bottom">
        <span>
          {job.salary
            ? `${Number(job.salary).toLocaleString()} salary`
            : "Salary not disclosed"}
        </span>
        <Link
          to={target}
          aria-label={`View ${job.title} at ${job.company?.companyName || "company"}`}
        >
          View role <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.shape({ companyName: PropTypes.string }),
    location: PropTypes.string,
    jobType: PropTypes.string,
    description: PropTypes.string,
    salary: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
};
