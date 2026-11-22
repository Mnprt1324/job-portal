import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  FileText,
  Send,
  Mail,
  KeyRound,
  LockKeyhole,
} from "lucide-react";
import { BrandMark } from "../ui/BrandMark";

export const AuthLayout = () => {
  const { pathname } = useLocation();
  const signup = pathname === "/register";
  const recovery = ["/forget", "/verify/password", "/update/password"].includes(
    pathname,
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="auth-layout">
      <a href="#auth-main" className="skip-link">
        Skip to form
      </a>
      <aside className="auth-story" aria-label="About JobOrbit">
        <Link to="/" className="auth-brand" aria-label="JobOrbit home">
          <span>
            <BrandMark size={25} />
          </span>
          JobOrbit
        </Link>
        <div className="auth-story-content">
          <p className="auth-kicker">A little ambition. A new beginning.</p>
          <h2>
            {recovery ? (
              <>
                A fresh start.
                <br />
                The same you.
              </>
            ) : signup ? (
              <>
                Your next chapter
                <br />
                starts with you.
              </>
            ) : (
              <>
                Good to have
                <br />
                you back.
              </>
            )}
          </h2>
          <p>
            {recovery
              ? "A forgotten password should not stop your next move. Get back to your account in three simple steps."
              : signup
                ? "One profile for the work you want to do. Find a role, tell your story, and make your next move."
                : "Pick up where you left off. Explore your next role and keep your applications in view."}
          </p>
          <div className="auth-journey">
            {(recovery
              ? [
                  [
                    Mail,
                    "Check your inbox",
                    "Request a six-digit code by email.",
                  ],
                  [
                    KeyRound,
                    "Verify your code",
                    "Enter the code to continue your reset.",
                  ],
                  [
                    LockKeyhole,
                    "Choose a new password",
                    "Set a new password, then sign in.",
                  ],
                ]
              : [
                  [
                    Search,
                    "Find your fit",
                    "Explore roles that match your direction.",
                  ],
                  [
                    FileText,
                    "Tell your story",
                    "Bring your skills and experience together.",
                  ],
                  [
                    Send,
                    "Make your move",
                    "Apply and follow your application status.",
                  ],
                ]
            ).map(([Icon, title, copy], index) => (
              <div key={title}>
                <span className="auth-journey-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
                <span className="auth-step-number">0{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-story-bottom">
          <span>Good work. A new chapter.</span>
          <ArrowUpRight size={19} aria-hidden="true" />
        </div>
      </aside>
      <div className="auth-workspace">
        <div className="auth-topbar">
          <Link to="/" className="auth-back">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to jobs
          </Link>
          <Link to="/" className="auth-mobile-brand">
            JobOrbit
          </Link>
          <span>
            {recovery
              ? "Remember your password?"
              : signup
                ? "Already a member?"
                : "New to JobOrbit?"}{" "}
            <Link to={signup || recovery ? "/login" : "/register"}>
              {signup || recovery ? "Sign in" : "Create an account"}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </span>
        </div>
        <main id="auth-main" className="auth-main" tabIndex={-1}>
          <Outlet key={pathname} />
        </main>
        <div className="auth-help">
          Need a hand?{" "}
          <Link to="/contact">
            Contact us <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
