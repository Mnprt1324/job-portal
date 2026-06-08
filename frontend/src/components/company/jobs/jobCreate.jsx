import { Loader2, Save, X } from "lucide-react";

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

export const emptyJobForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  requirement: "",
  description: "",
  jobType: "Full-time",
};

export const mapJobToForm = (job) => ({
  title: job?.title || "",
  company: job?.company?._id || job?.company || "",
  location: job?.location || "",
  salary: job?.salary || "",
  requirement: Array.isArray(job?.requirement)
    ? job.requirement.join(", ")
    : job?.requirement || "",
  description: job?.description || "",
  jobType: job?.jobType || "Full-time",
});

export const JobCreate = ({
  companies,
  formData,
  mode = "create",
  saving = false,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const title = mode === "edit" ? "Edit job listing" : "Create job listing";
  const subtitle =
    mode === "edit"
      ? "Update the role details candidates will see."
      : "Post a new opening for candidates to discover.";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field
          label="Job Title"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Senior Frontend Developer"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Company
          </label>
          <select
            name="company"
            value={formData.company}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select company profile</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Location"
          name="location"
          value={formData.location}
          onChange={onChange}
          placeholder="Mohali, Remote, or Hybrid"
          required
        />

        <Field
          label="Salary"
          name="salary"
          value={formData.salary}
          onChange={onChange}
          placeholder="8 LPA - 12 LPA"
          required
        />

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Job Type
          </label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Requirements"
          name="requirement"
          value={formData.requirement}
          onChange={onChange}
          placeholder="React, Node.js, MongoDB"
          required
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={5}
          placeholder="Describe the responsibilities, team, and expectations for this role."
          required
          className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <X className="h-5 w-5" />
          Discard
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          {mode === "edit" ? "Save Changes" : "Post Job"}
        </button>
      </div>
    </form>
  );
};

const Field = ({ label, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-gray-700">
      {label}
    </label>
    <input
      {...props}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

export default JobCreate;
