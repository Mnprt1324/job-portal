import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Infinity as InfinityIcon,
} from "lucide-react";

const directories = [
  {
    title: "Find your next move",
    links: [
      ["Browse all jobs", "/findJob"],
      ["Remote opportunities", "/findJob?keyword=Remote"],
      ["Create your profile", "/register"],
    ],
  },
  {
    title: "Your account",
    links: [
      ["Sign in", "/login"],
      ["Join as a recruiter", "/register"],
      ["Reset your password", "/forget"],
    ],
  },
  {
    title: "Get to know ZipJob",
    links: [
      ["Our story", "/about"],
      ["Contact us", "/contact"],
      ["Common questions", "/#questions"],
    ],
  },
];

export const Footer = () => (
  <footer className="site-footer footer-redesign">
    <div className="page-container">
      <div className="footer-invitation">
        <div>
          <p className="eyebrow">There is a next chapter for everyone.</p>
          <h2>Make yours a good one.</h2>
        </div>
        <Link className="btn-primary" to="/findJob">
          Explore opportunities <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
      <div className="footer-directory">
        <div className="footer-brand-column">
          <Link to="/" className="footer-brand">
            <InfinityIcon size={29} aria-hidden="true" />
            ZipJob
          </Link>
          <p>
            A place for people and teams
            <br />
            to find their next move.
          </p>
          <Link to="/about" className="footer-story-link">
            A little about us <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {directories.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h3>{group.title}</h3>
            {group.links.map(([label, to]) => (
              <Link key={label} to={to}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        Good work.<span>New chapter.</span>
      </div>
      <div className="footer-bottom">
        <span>
          Copyright {new Date().getFullYear()} ZipJob. All rights reserved.
        </span>
        <span>Built around your next move.</span>
        <a href="#main-content" className="footer-back-top">
          Back to top <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  </footer>
);
