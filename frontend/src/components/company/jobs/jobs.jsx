import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  GetAllJobsCrtByRec,
  getAllRecurCompanied,
  postJobApiCall,
  updateJobApiCall,
} from "../../../API/api";
import { JobCard } from "./JobCard";
import { JobCreate, emptyJobForm, mapJobToForm } from "./jobCreate";

const parseRequirements = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const CompanyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyJobForm);
  const [selectedJob, setSelectedJob] = useState(null);
  const [mode, setMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchWorkspace = async () => {
    setLoading(true);
    setError("");

    try {
      const [companiesResponse, jobsResponse] = await Promise.all([
        getAllRecurCompanied(),
        GetAllJobsCrtByRec(),
      ]);

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
      const message =
        fetchError.response?.data?.message || "Unable to load company jobs.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return jobs;

    return jobs.filter((job) => {
      const requirements = Array.isArray(job.requirement)
        ? job.requirement.join(" ")
        : job.requirement || "";

      return [job.title, job.company?.companyName, job.location, job.jobType, requirements]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [jobs, searchTerm]);

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
  };

  const openCreateForm = () => {
    setSelectedJob(null);
    setFormData({
      ...emptyJobForm,
      company: companies[0]?._id || "",
    });
    setMode("create");
  };

  const openEditForm = (job) => {
    setSelectedJob(job);
    setFormData(mapJobToForm(job));
    setMode("edit");
  };

  const closeForm = () => {
    setSelectedJob(null);
    setFormData({
      ...emptyJobForm,
      company: companies[0]?._id || "",
    });
    setMode("list");
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Job title is required.";
    if (!formData.company) return "Please select a company profile.";
    if (!formData.location.trim()) return "Location is required.";
    if (!formData.salary.trim()) return "Salary is required.";
    if (!formData.jobType.trim()) return "Job type is required.";
    if (parseRequirements(formData.requirement).length === 0) {
      return "Add at least one requirement.";
    }
    if (!formData.description.trim()) return "Description is required.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

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

      toast.success(response.data.message || "Job saved successfully.");
      await fetchWorkspace();
      closeForm();
    } catch (submitError) {
      toast.error(submitError.response?.data?.message || "Unable to save job.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center rounded-2xl bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-950">Jobs did not load</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          type="button"
          onClick={fetchWorkspace}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Company Jobs
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-950">
              Manage job listings
            </h1>
            <p className="mt-2 text-gray-600">
              Create openings, edit job details, and review your active listings.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            disabled={companies.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
            New Job
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard icon={BriefcaseBusiness} label="Total Jobs" value={stats.total} />
          <StatCard icon={Building2} label="Company Profiles" value={stats.companies} />
          <StatCard icon={Search} label="Applicants" value={stats.applicants} />
        </div>
      </div>

      {companies.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-medium text-amber-800">
          Create your company profile first, then you can post jobs from this page.
        </div>
      )}

      {mode !== "list" ? (
        <JobCreate
          companies={companies}
          formData={formData}
          mode={mode}
          saving={saving}
          onChange={handleChange}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, company, location, type, or skill"
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <BriefcaseBusiness className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-xl font-bold text-gray-950">
                {jobs.length === 0 ? "No jobs posted yet" : "No matching jobs"}
              </h2>
              <p className="mt-2 text-gray-600">
                {jobs.length === 0
                  ? "Create your first job listing to start receiving applicants."
                  : "Try another search term or clear the search field."}
              </p>
              {jobs.length === 0 && companies.length > 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                  Create Job
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} onEdit={openEditForm} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-950">{value}</p>
      </div>
    </div>
  </div>
);

export default CompanyJobs;
