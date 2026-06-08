import {
  Building2,
  CalendarDays,
  Edit3,
  MapPin,
  Users,
  Wallet,
} from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "Not available";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const JobCard = ({ job, onEdit }) => {
  const requirements = Array.isArray(job.requirement)
    ? job.requirement
    : String(job.requirement || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {job.jobType || "Job"}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {job.applicants?.length || 0} applicants
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-gray-950">{job.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {job.description || "No description added yet."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(job)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <JobMeta icon={Building2} label="Company" value={job.company?.companyName} />
        <JobMeta icon={MapPin} label="Location" value={job.location} />
        <JobMeta icon={Wallet} label="Salary" value={job.salary} />
        <JobMeta icon={CalendarDays} label="Posted" value={formatDate(job.createdAt)} />
      </div>

      {requirements.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {requirements.slice(0, 6).map((requirement) => (
            <span
              key={requirement}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600"
            >
              {requirement}
            </span>
          ))}
          {requirements.length > 6 && (
            <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              +{requirements.length - 6} more
            </span>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-500">
        <Users className="h-4 w-4 text-blue-600" />
        Candidate applications are visible from the recruiter applicant workflow.
      </div>
    </article>
  );
};

const JobMeta = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-gray-900">
          {value || "Not added"}
        </p>
      </div>
    </div>
  </div>
);

export default JobCard;
