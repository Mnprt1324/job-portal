import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FilePlus2,
  PlusCircle,
  Users,
} from "lucide-react";
import { useGetAllCompanies } from "../hooks/useGetAllCompanies";
import useGetAllAdminJobs from "../hooks/useGetAllAdminJobs";

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
      </div>
      <div className={`rounded-2xl p-3 ${tone}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export const RecruiterDashboard = () => {
  useGetAllCompanies();
  useGetAllAdminJobs();

  const navigate = useNavigate();
  const { companies } = useSelector((store) => store.company);
  const { allAdminJobs } = useSelector((store) => store.job);

  const companyList = Array.isArray(companies)
    ? companies.filter((company) => company && typeof company === "object")
    : [];
  const jobList = Array.isArray(allAdminJobs) ? allAdminJobs : [];

  const totalApplicants = useMemo(
    () =>
      jobList.reduce(
        (total, job) => total + (Array.isArray(job.applicants) ? job.applicants.length : 0),
        0
      ),
    [jobList]
  );

  const recentJobs = jobList.slice(0, 5);
  const recentCompanies = companyList.slice(0, 4);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Track your companies, active job posts, and incoming applicants.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/companies/create")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <PlusCircle className="h-5 w-5" />
              New Company
            </button>
            <button
              onClick={() => navigate("/job/create")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              <FilePlus2 className="h-5 w-5" />
              Post Job
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Companies"
          value={companyList.length}
          tone="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={BriefcaseBusiness}
          label="Jobs Posted"
          value={jobList.length}
          tone="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={Users}
          label="Applicants"
          value={totalApplicants}
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={CheckCircle2}
          label="Hiring Tools"
          value="Ready"
          tone="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Recent Jobs</h2>
              <p className="text-sm text-gray-500">Latest roles posted by you</p>
            </div>
            <button
              onClick={() => navigate("/jobs")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentJobs.length ? (
              recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-950">{job.title}</p>
                    <p className="truncate text-sm text-gray-500">
                      {job.company?.companyName || "Company"} - {job.location || "Location not set"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    <Clock3 className="h-3.5 w-3.5" />
                    New
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No jobs posted yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-950">Companies</h2>
              <p className="text-sm text-gray-500">Your registered company profiles</p>
            </div>
            <button
              onClick={() => navigate("/companies")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentCompanies.length ? (
              recentCompanies.map((company) => (
                <div key={company._id} className="flex items-center gap-4 p-5">
                  <img
                    src={company.logo}
                    alt={`${company.companyName} logo`}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-950">
                      {company.companyName}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {company.location || "Location not set"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No companies added yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
