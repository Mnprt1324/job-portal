import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  MapPin,
} from "lucide-react";
import heroWorkplace from "../../assets/hero/zipjob-workplace.png";
export const ImgSection = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const search = (event) => {
    event.preventDefault();
    navigate(`/findJob?${new URLSearchParams({ keyword: keyword.trim() })}`);
  };
  return (
    <section className="career-hero" data-enter>
      <div className="hero-sky" aria-hidden="true">
        <span className="hero-cloud hero-cloud-one" />
        <span className="hero-cloud hero-cloud-two" />
        <span className="hero-cloud hero-cloud-three" />
        <span className="hero-cloud hero-cloud-four" />
        <span className="hero-cloud hero-cloud-five" />
      </div>
      <div className="page-container career-hero-layout">
        <div className="career-hero-copy">
          <div className="hero-label"><span className="label-line" />JobOrbit careers</div>
          <h1>Find exciting <span>jobs</span><br />today.</h1>
          <p className="hero-description">Discover work that fits your strengths, goals, and the life you want to build next.</p>
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
            Explore jobs <ArrowUpRight size={19} />
          </button>
        </form>
        <div className="popular-searches">
          <span>Popular searches</span>
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
        </div>
        <div className="hero-visual" aria-label="Professionals collaborating in a modern workplace">
          <img src={heroWorkplace} alt="Two professionals collaborating at a laptop in a bright workplace" />
          <span className="hero-visual-search"><Search size={18} aria-hidden="true" /></span>
          <span className="hero-visual-pin"><MapPin size={18} aria-hidden="true" /></span>
          <div className="hero-visual-caption"><strong>Find a team that moves with you.</strong><span>New roles, better direction.</span></div>
        </div>
      </div>
      <div className="hero-marquee" aria-label="Hiring teams on JobOrbit">
        <p>Explore opportunities with ambitious teams</p>
        <span className="sr-only">Companies with roles listed on JobOrbit include NVIDIA, Paytm, Razorpay, Zscaler, Cybage, and Darwinbox.</span>
        <div className="hero-marquee-viewport" aria-hidden="true">
          <div className="hero-marquee-track">
            {["NVIDIA", "Paytm", "Razorpay", "Zscaler", "Cybage", "Darwinbox", "NVIDIA", "Paytm", "Razorpay", "Zscaler", "Cybage", "Darwinbox"].map((company, index) => (
              <span className="hero-marquee-company" key={`${company}-${index}`}>{company}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
