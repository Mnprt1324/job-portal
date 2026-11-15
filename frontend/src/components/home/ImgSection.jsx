import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  Briefcase,
  MapPin,
  ArrowRight,
} from "lucide-react";
export const ImgSection = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const search = (event) => {
    event.preventDefault();
    navigate(`/findJob?${new URLSearchParams({ keyword: keyword.trim() })}`);
  };
  return (
    <section className="career-hero" data-enter>
      <div className="page-container">
        <div className="hero-label">
          <span className="label-line" />
          Work is a big part of life. Make it a good one.
        </div>
        <h1>
          Find work.
          <br />
          <span>Make your next move.</span>
        </h1>
        <p className="hero-description">
          A fresh start. A bigger challenge. A role that feels like you.
          <br className="desktop-break" /> Find your next opportunity with
          ZipJob.
        </p>
        <form className="hero-search" onSubmit={search} role="search">
          <label htmlFor="home-keyword">
            <Search size={21} aria-hidden="true" />
            <span className="sr-only">Job title, skill, or location</span>
          </label>
          <input
            id="home-keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, skill, or location"
          />
          <button className="btn-primary" type="submit">
            Search jobs <ArrowUpRight size={19} />
          </button>
        </form>
        <div className="popular-searches">
          <span>Try a search</span>
          {["Frontend Developer", "Design", "Remote"].map((term) => (
            <Link
              key={term}
              to={`/findJob?keyword=${encodeURIComponent(term)}`}
            >
              {term}
              <ArrowUpRight size={13} />
            </Link>
          ))}
        </div>
        <div
          className="hero-window app-frame"
          aria-label="Explore job search options"
        >
          <div className="window-bar">
            <span className="window-brand">ZipJob / Your next move</span>
            <span className="window-hint">Built around your career</span>
          </div>
          <div className="window-body">
            <div className="window-intro">
              <span className="eyebrow">A place to begin</span>
              <h2>
                What does your <br />
                next chapter look like?
              </h2>
              <Link to="/findJob" className="text-link">
                Browse opportunities <ArrowRight size={18} />
              </Link>
            </div>
            <div className="window-options">
              {[
                [
                  Briefcase,
                  "A role to grow into",
                  "Explore development roles",
                  "Developer",
                ],
                [
                  MapPin,
                  "A different place to work",
                  "Find remote opportunities",
                  "Remote",
                ],
              ].map(([Icon, title, copy, term]) => (
                <Link
                  key={term}
                  to={`/findJob?keyword=${term}`}
                  className="window-option"
                >
                  <Icon size={24} aria-hidden="true" />
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
