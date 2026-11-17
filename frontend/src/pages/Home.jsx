import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Search, FileText, Send, ArrowRight } from "lucide-react";
import { ImgSection } from "../components/home/ImgSection";
import { JobCard } from "../components/ui/JobCard";
import { Accordian } from "../components/home/Accordian";
import useGetAllJobs from "../hooks/useGetAllJobs";
import { JobCardSkeleton } from "../components/home/JobCardSkeleton";
export const Home = () => {
  useEffect(() => {
    let active = true;
    let moment;
    import("../design/liquid-type.js")
      .then(({ default: mount }) => {
        const element = document.querySelector('[data-moment="liquid-type"]');
        if (active && element)
          moment = mount(
            element,
            { strength: 0.4 },
            {
              reduced: () =>
                matchMedia("(prefers-reduced-motion: reduce)").matches,
              coarse: () => matchMedia("(pointer: coarse)").matches,
              clamp: (value, min = 0, max = 1) =>
                Math.min(max, Math.max(min, value)),
            },
          );
      })
      .catch(() => {});
    return () => {
      active = false;
      moment?.destroy?.();
    };
  }, []);
  const { jobs, loading, error, retry } = useGetAllJobs({
    keyword: "",
    limit: 6,
  });
  return (
    <div className="home-page">
      <ImgSection />
      <section className="jobs-section" id="opportunities">
        <div className="page-container">
          <div className="section-top">
            <div>
              <p className="eyebrow">Your next chapter</p>
              <h2>Good work starts here.</h2>
              <p className="section-description">
                Explore roles, compare the details, and find your next move.
              </p>
            </div>
            <Link className="text-link" to="/findJob">
              Explore all jobs <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="jobs-grid" aria-busy={loading}>
            {loading ? (
              Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)
            ) : error ? (
              <div className="empty-state" role="status">
                <Search size={32} aria-hidden="true" />
                <h3>We could not load the jobs.</h3>
                <p>Please try again to see available opportunities.</p>
                <button className="btn-primary" onClick={retry}>
                  Try again
                </button>
              </div>
            ) : jobs.length ? (
              jobs.map((job) => <JobCard key={job._id} job={job} />)
            ) : (
              <div className="empty-state">
                <Search size={32} aria-hidden="true" />
                <h3>Your next opportunity is on its way.</h3>
                <p>
                  There are no listings to show right now. Check back for new
                  roles.
                </p>
                <Link className="text-link" to="/register">
                  Create your profile <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="how-section">
        <div className="page-container">
          <p className="eyebrow">Less searching. More direction.</p>
          <h2>
            From your next step
            <br />
            to your next role.
          </h2>
          <div className="steps-grid">
            {[
              [
                Search,
                "01",
                "Find your fit",
                "Search by role, skill, or location. Read the requirements before you apply.",
              ],
              [
                FileText,
                "02",
                "Tell your story",
                "Build your profile and upload a resume that shows what you bring.",
              ],
              [
                Send,
                "03",
                "Make your move",
                "Apply to a role and follow your application status from your profile.",
              ],
            ].map(([Icon, number, title, copy]) => (
              <article key={number}>
                <div className="step-top">
                  <Icon size={26} aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="career-statement">
        <div className="page-container">
          <p className="eyebrow">A little ambition goes a long way</p>
          <h2 data-moment="liquid-type" data-moment-opts='{"strength":0.4}'>
            Your skills.
            <br />A new setting.
          </h2>
          <Link className="btn-primary" to="/register">
            Create your profile <ArrowUpRight size={19} />
          </Link>
          <span className="statement-note">
            For your first role. And the one after that.
          </span>
        </div>
      </section>
      <section className="faq-section" id="questions">
        <div className="page-container faq-layout">
          <div>
            <p className="eyebrow">A few useful answers</p>
            <h2>
              Before you
              <br />
              make a move.
            </h2>
            <Link to="/contact" className="text-link">
              Talk to us <ArrowUpRight size={18} />
            </Link>
          </div>
          <div>
            {[
              [
                "How do I apply for a job?",
                "Open a listing and sign in as a jobseeker to apply. Complete your profile and upload your resume so companies can review your experience.",
              ],
              [
                "Where can I track my applications?",
                "Sign in and open your profile to see your applications and their current status: pending, accepted, or rejected.",
              ],
              [
                "Can I search by location?",
                "Yes. Enter a city or Remote in the job search, or choose one of the location options in Browse jobs.",
              ],
              [
                "How do companies post a job?",
                "Register as a company, create a company profile, then add a listing from your jobs dashboard.",
              ],
            ].map(([title, content]) => (
              <Accordian key={title} title={title} content={content} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
