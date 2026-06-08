import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit3,
  Users,
  AlertTriangle,
  RefreshCw,
  SearchIcon,
  ArrowUpWideNarrow,
  ArrowDownWideNarrow,
  RefreshCcw,
  PlusIcon,
  Grid,
  EllipsisVertical,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef } from "react";
import useGetAllAdminJobs from "../hooks/useGetAllAdminJobs";
import { MenuButton } from "../components/ui/MenuButton";

export const Job = () => {
  useGetAllAdminJobs();
  const menuRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [filterValue, setFilterValue] = useState("");
  const { allAdminJobs } = useSelector((store) => store.job);
  const loading = false;
  const error = false;
  console.log(allAdminJobs);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();

  // Memoized filtered jobs for better performance
  const filteredJobs = useMemo(() => {
    if (!allAdminJobs.length) return [];

    return allAdminJobs.filter((job) => {
      const searchTerm = filterValue.toLowerCase().trim();
      if (!searchTerm) return true;

      const title = job.title?.toLowerCase() || "";
      const companyName = job.company?.companyName?.toLowerCase() || "";

      return title.includes(searchTerm) || companyName.includes(searchTerm);
    });
  }, [allAdminJobs, filterValue]);

  // Memoized handlers
  const handleCreateJob = useCallback(() => {
    navigate("/job/create");
  }, [navigate]);

  const toggleMenu = useCallback((id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  }, []);

  const handleEditJob = useCallback(
    (id) => {
      navigate(`/jobs/update/${id}`);
      setActiveMenu(null);
    },
    [navigate]
  );

  const handleViewApplicants = useCallback(
    (id) => {
      navigate(`/jobs/applicants/${id}`);
      setActiveMenu(null);
    },
    [navigate]
  );

  const handleFilterChange = useCallback((e) => {
    setFilterValue(e.target.value);
  }, []);

  // Close menu when clicking outside
  const handleTableClick = useCallback((e) => {
    if (!e.target.closest("[data-menu-trigger]")) {
      setActiveMenu(null);
    }
  }, []);

  const menuOptions = useMemo(
    () => [
      {
        menuName: "Edit",
        handler: handleEditJob,
        icon: <Edit3 size={16} />,
      },
      {
        menuName: "Applicants",
        handler: handleViewApplicants,
        icon: <Users size={16} />,
      },
    ],
    [handleEditJob, handleViewApplicants]
  );

  // Format date helper
  const formatDate = useCallback((dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="flex justify-center md:p-4 min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-6xl">
            <div className="text-center py-12">
              <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to load jobs
              </h3>
              <p className="text-gray-600 mb-4">
                {error.message || "Something went wrong while fetching jobs."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jobs</h1>
              <p className="text-gray-600">
                Manage your Job listings and profiles
              </p>
            </div>
            <button
              onClick={() => navigate("/job/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlusIcon />
              New Job
            </button>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all duration-200"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Showing {filteredJobs.length} of {allAdminJobs.length} jobs
          </p>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria.
            </p>
          
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-semibold text-gray-900 p-4">
                      Company
                    </th>
                    <th className="text-left font-semibold text-gray-900 p-4">
                      Role
                    </th>
                    <th className="text-left font-semibold text-gray-900 p-4">
                      Location
                    </th>
                    <th className="text-left font-semibold text-gray-900 p-4">
                      Created
                    </th>
                    <th className="text-left font-semibold text-gray-900 p-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr
                      key={job._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={job.company.logo}
                            alt={`${job.company.companyName} logo`}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {job.company.companyName || "No Name"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{job.title}</td>
                      <td className="p-4 text-gray-600">{job.location}</td>
                      <td className="p-4 text-gray-600">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="p-4">
                        <div
                          className="relative"
                          ref={activeMenu === job._id ? menuRef : null}
                        >
                          <button
                            onClick={() => toggleMenu(job._id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                          >
                            <EllipsisVertical />
                          </button>
                          <MenuButton
                            menu={activeMenu === job._id}
                            menuOptions={menuOptions}
                            id={job._id}
                            onClose={() => setActiveMenu(null)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
