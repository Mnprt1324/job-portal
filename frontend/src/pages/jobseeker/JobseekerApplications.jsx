import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { Search, ArrowUpRight } from "lucide-react";
import { applicationStatus } from "../../components/jobseeker/dashboardData";
import {
  JobseekerApplicationList,
  JobseekerEmptyApplications,
} from "../../components/jobseeker/JobseekerApplicationList";

export const JobseekerApplications = () => {
  const { applications, loading, error, retry } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const status = ["pending", "accepted", "rejected"].includes(
    params.get("status"),
  )
    ? params.get("status")
    : "";
  const query = params.get("search") || "";
  const filtered = applications.filter(
    (application) =>
      (!status || applicationStatus(application) === status) &&
      `${application.job?.title || ""} ${application.job?.company?.companyName || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const update = (key, value) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      value ? next.set(key, value) : next.delete(key);
      return next;
    });
  return (
    <div className="js-applications-page">
      <div className="js-page-heading">
        <div>
          <p className="eyebrow">Your progress, in one place</p>
          <h1>My applications</h1>
          <p>Follow the roles you have applied for and their current status.</p>
        </div>
        <Link to="/jobseeker/jobs" className="btn-primary">
          Find your next role
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <section className="js-panel">
        <div className="js-application-controls">
          <div
            className="js-status-filters"
            role="group"
            aria-label="Filter applications by status"
          >
            {[
              ["", "All"],
              ["pending", "Pending"],
              ["accepted", "Accepted"],
              ["rejected", "Not selected"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                aria-pressed={status === value}
                onClick={() => update("status", value)}
              >
                {label}
                {!loading && !error && (
                  <span>
                    {value
                      ? applications.filter(
                          (a) => applicationStatus(a) === value,
                        ).length
                      : applications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <label className="js-application-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search your applications</span>
            <input
              value={query}
              onChange={(e) => update("search", e.target.value)}
              placeholder="Search roles or companies"
            />
          </label>
        </div>
        {loading ? (
          <div className="js-loading" role="status">
            Loading your applications...
          </div>
        ) : error ? (
          <div className="js-inline-error" role="alert">
            <p>{error}</p>
            <button onClick={retry}>Try again</button>
          </div>
        ) : !applications.length ? (
          <JobseekerEmptyApplications />
        ) : filtered.length ? (
          <>
            <p className="js-result-count" role="status">
              {filtered.length}{" "}
              {filtered.length === 1 ? "application" : "applications"}
            </p>
            <JobseekerApplicationList applications={filtered} />
          </>
        ) : (
          <div className="js-empty">
            <Search size={26} aria-hidden="true" />
            <h2>No matching applications.</h2>
            <p>Try another search or status.</p>
            <button className="js-inline-link" onClick={() => setParams({})}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
