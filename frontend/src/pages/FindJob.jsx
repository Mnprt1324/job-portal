import { useSearchParams } from "react-router-dom";
import { Search, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import useGetAllJobs from "../hooks/useGetAllJobs";
import { JobCard } from "../components/ui/JobCard";
import { JobCardSkeleton } from "../components/home/JobCardSkeleton";
export const FindJob = () => {
  const [params, setParams] = useSearchParams();
  const keyword = params.get("keyword") || "";
  const sortBy = params.get("sortBy") === "old" ? "old" : "new";
  const page = Math.max(1, parseInt(params.get("page"), 10) || 1);
  const { jobs, loading, error, totalPages, retry } = useGetAllJobs({
    keyword,
    sortBy,
    page,
    limit: 6,
  });
  const update = (changes) =>
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(changes).forEach(([key, value]) =>
        value ? next.set(key, String(value)) : next.delete(key),
      );
      return next;
    });
  const filter = (value) => {
    update({ keyword: value, page: 1 });
  };
  return (
    <section className="browse-page page-container">
      <p className="eyebrow">Your career, your direction</p>
      <h1>Find your next role.</h1>
      <p className="section-description">
        Search for the work you want to do, wherever you want to do it.
      </p>
      <form
        className="browse-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          filter(new FormData(e.currentTarget).get("keyword").trim());
        }}
      >
        <label htmlFor="browse-keyword">Job title, skill, or location</label>
        <div>
          <Search size={20} aria-hidden="true" />
          <input
            key={keyword}
            id="browse-keyword"
            name="keyword"
            defaultValue={keyword}
            placeholder="Try Frontend Developer or Remote"
          />
          <button className="btn-primary">Search jobs</button>
        </div>
      </form>
      <div className="browse-layout">
        <aside className="filter-panel">
          <div className="filter-heading">
            <h2>Narrow your search</h2>
            <button
              type="button"
              onClick={() => filter("")}
              aria-label="Clear search filter"
            >
              <RotateCcw size={17} />
            </button>
          </div>
          <p className="filter-note">Choose one keyword to explore.</p>
          {[
            ["Location", ["Mohali", "Chandigarh", "Delhi", "Mumbai"]],
            [
              "Role",
              ["Backend Developer", "Frontend Developer", "Data Scientist"],
            ],
            ["Work type", ["Full-time", "Part-time", "Remote"]],
          ].map(([title, options]) => (
            <fieldset key={title}>
              <legend>{title}</legend>
              {options.map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="job-keyword"
                    checked={keyword === option}
                    onChange={() => filter(option)}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          ))}
        </aside>
        <div className="browse-results">
          <div className="results-heading">
            <p role="status">
              {loading
                ? "Finding opportunities..."
                : error
                  ? "Listings unavailable"
                  : keyword
                    ? `Results for ${keyword}`
                    : "All opportunities"}
            </p>
            <label>
              Sort by
              <select
                value={sortBy}
                onChange={(e) => update({ sortBy: e.target.value, page: 1 })}
              >
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
              </select>
            </label>
          </div>
          <div className="browse-grid" aria-busy={loading}>
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)
            ) : error ? (
              <div className="empty-state" role="alert">
                <Search size={30} aria-hidden="true" />
                <h2>We could not load the jobs.</h2>
                <p>Check your connection and try again.</p>
                <button className="btn-primary" onClick={retry}>
                  Try again
                </button>
              </div>
            ) : jobs.length ? (
              jobs.map((job) => <JobCard key={job._id} job={job} />)
            ) : (
              <div className="empty-state">
                <Search size={30} aria-hidden="true" />
                <h2>No matching roles yet.</h2>
                <p>Try a different keyword or browse all opportunities.</p>
                <button className="btn-primary" onClick={() => filter("")}>
                  Clear search
                </button>
              </div>
            )}
          </div>
          {!loading && !error && totalPages > 1 && (
            <nav className="pagination" aria-label="Job result pages">
              <button
                disabled={page === 1}
                onClick={() => update({ page: page - 1 })}
              >
                <ArrowLeft size={17} />
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => update({ page: page + 1 })}
              >
                Next
                <ArrowRight size={17} />
              </button>
            </nav>
          )}
        </div>
      </div>
    </section>
  );
};
