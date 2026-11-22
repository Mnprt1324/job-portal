import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  FileText,
  Send,
  Building2,
  ClipboardList,
  Users,
  Check,
} from "lucide-react";

const audiences = {
  jobseeker: {
    eyebrow: "For your next move",
    title: "Put your experience\nin the right place.",
    description:
      "Find a role worth applying for, bring your experience together in a profile, and follow what happens next.",
    steps: [
      [
        Search,
        "Discover your next role",
        "Search by role, skill, or location and read the details before applying.",
      ],
      [
        FileText,
        "Build your profile",
        "Add your skills, experience, and resume so companies can get to know your work.",
      ],
      [
        Send,
        "Keep your applications in view",
        "See the status of your applications from your profile.",
      ],
    ],
    action: "Explore jobs",
    href: "/findJob",
    panelTitle: "Your next move, in three steps.",
  },
  company: {
    eyebrow: "For the team you are building",
    title: "Make room for\nyour next great hire.",
    description:
      "Give your company a home, share the role you need to fill, and review the people who apply.",
    steps: [
      [
        Building2,
        "Introduce your company",
        "Create a company profile with its name, location, website, and logo.",
      ],
      [
        ClipboardList,
        "Share the opportunity",
        "Post a role with clear requirements, location, job type, and salary.",
      ],
      [
        Users,
        "Review your applicants",
        "Read applications and update their status from your company dashboard.",
      ],
    ],
    action: "Create a company account",
    href: "/register",
    panelTitle: "From a new role to a new teammate.",
  },
};

export const About = () => {
  const [audience, setAudience] = useState("jobseeker");
  const content = audiences[audience];
  return (
    <div className="about-page">
      <section className="about-hero" data-enter>
        <div className="page-container">
          <div className="about-hero-top">
            <p className="eyebrow">A little about JobOrbit</p>
            <span>People. Possibility. A next step.</span>
          </div>
          <h1>
            Work is personal.
            <br />
            <span>
              Your next move
              <br className="about-mobile-break" /> should be, too.
            </span>
          </h1>
          <div className="about-hero-bottom">
            <p>
              Behind every application is a person ready for something new.
              Behind every role is a team looking for someone to join them.
              JobOrbit brings those two sides together.
            </p>
            <Link className="text-link" to="/findJob">
              Find your next role <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className="about-purpose">
        <div className="page-container about-purpose-grid">
          <div>
            <p className="eyebrow">Why we are here</p>
            <h2>
              A clearer path
              <br />
              to good work.
            </h2>
          </div>
          <div>
            <p className="about-lead">
              Finding work is a big decision.
              <br />
              The process should feel manageable.
            </p>
            <p>
              JobOrbit puts job discovery, profiles, and applications in one
              place. Jobseekers can explore their options and keep track of
              their progress. Companies can publish openings and review
              applicants.
            </p>
            <p>
              Our aim is simple: give both sides the information and tools to
              take the next step.
            </p>
            <Link className="text-link" to="/contact">
              Get in touch <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section className="about-audience">
        <div className="page-container">
          <div className="about-audience-heading">
            <div>
              <p className="eyebrow">Two sides. One place to connect.</p>
              <h2>Where do you want to begin?</h2>
            </div>
            <div
              className="about-audience-switch"
              role="group"
              aria-label="Choose your perspective"
            >
              <button
                type="button"
                aria-pressed={audience === "jobseeker"}
                onClick={() => setAudience("jobseeker")}
              >
                Looking for work
              </button>
              <button
                type="button"
                aria-pressed={audience === "company"}
                onClick={() => setAudience("company")}
              >
                Hiring talent
              </button>
            </div>
          </div>
          <div className="about-audience-layout">
            <div className="about-audience-copy">
              <p className="eyebrow">{content.eyebrow}</p>
              <h3>{content.title}</h3>
              <p>{content.description}</p>
              <Link className="btn-primary" to={content.href}>
                {content.action}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div
              className="about-workflow"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="about-workflow-header">
                <span className="workflow-dot" aria-hidden="true" />
                <span>{content.panelTitle}</span>
              </div>
              {content.steps.map(([Icon, title, copy], index) => (
                <article key={title}>
                  <span className="about-workflow-icon">
                    <Icon size={23} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="about-step-label">Step 0{index + 1}</span>
                    <h4>{title}</h4>
                    <p>{copy}</p>
                  </div>
                  <Check
                    size={17}
                    className="workflow-check"
                    aria-hidden="true"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="about-principles">
        <div className="page-container">
          <div className="section-top">
            <div>
              <p className="eyebrow">What guides the experience</p>
              <h2>Useful at every step.</h2>
            </div>
            <p className="about-principles-intro">
              Less uncertainty in the process.
              <br />
              More room to decide what comes next.
            </p>
          </div>
          <div className="about-principle-grid">
            {[
              [
                "01",
                "Details before decisions.",
                "Read the role, requirements, location, and salary before you decide to apply.",
              ],
              [
                "02",
                "Your experience, together.",
                "Keep your skills, background, and resume in one profile instead of starting from scratch.",
              ],
              [
                "03",
                "A view of your progress.",
                "Check your submitted applications and see when their status changes.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <Link className="text-link" to="/register">
            Start your next chapter <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
};
