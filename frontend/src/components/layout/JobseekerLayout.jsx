import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Infinity as InfinityIcon,
  LayoutDashboard,
  ClipboardList,
  Search,
  UserRound,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  CircleHelp,
  ChevronRight,
} from "lucide-react";
import Cookies from "js-cookie";
import { logoutUserApiCall } from "../../API/api";
import { logoutUser } from "../../redux/authSlice";
import { useJobseekerApplications } from "../../hooks/useJobseekerApplications";
import "../jobseeker/Jobseeker.css";

export const JobseekerLayout = () => {
  const user = useSelector((store) => store.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "jobseeker")
    return (
      <Navigate
        to={user.role === "company" ? "/company/dashboard" : "/dashboard"}
        replace
      />
    );
  return <JobseekerWorkspace />;
};

const JobseekerWorkspace = () => {
  const user = useSelector((store) => store.auth.user);
  const applications = useJobseekerApplications(user._id);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const controls = () =>
      [
        ...drawerRef.current.querySelectorAll("a[href],button:not([disabled])"),
      ].filter((el) => el.getClientRects().length);
    controls()[0]?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        requestAnimationFrame(() => toggleRef.current?.focus());
      }
      if (event.key === "Tab") {
        const elements = controls();
        const first = elements[0],
          last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const desktop = matchMedia("(min-width:1024px)");
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen]);
  const logout = async () => {
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await logoutUserApiCall();
      if (!response.data?.success) throw new Error();
      localStorage.removeItem("token");
      Cookies.remove("token");
      dispatch(logoutUser());
      navigate("/login", { replace: true });
    } catch {
      setLogoutError("Sign out failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };
  const initial = (user.name || "J").trim().slice(0, 1).toUpperCase();
  const title = pathname.endsWith("/applications")
    ? "My applications"
    : pathname.startsWith("/jobseeker/profile")
      ? "My profile"
      : pathname === "/jobseeker/jobs"
        ? "Find jobs"
        : pathname.startsWith("/jobseeker/jobs/")
          ? "Job details"
          : "Dashboard";
  return (
    <div className="js-workspace">
      <a className="skip-link" href="#jobseeker-main">
        Skip to dashboard
      </a>
      {menuOpen && (
        <button
          type="button"
          className="js-drawer-backdrop"
          onClick={() => {
            setMenuOpen(false);
            requestAnimationFrame(() => toggleRef.current?.focus());
          }}
          aria-label="Close navigation overlay"
          tabIndex={-1}
        />
      )}
      <aside
        ref={drawerRef}
        id="jobseeker-navigation"
        className={`js-sidebar ${menuOpen ? "is-open" : ""}`}
        aria-label="Jobseeker navigation"
      >
        <div className="js-brand-row">
          <Link to="/jobseeker/dashboard" className="js-brand">
            <span>
              <InfinityIcon size={24} aria-hidden="true" />
            </span>
            ZipJob
          </Link>
          <button
            className="js-close-menu"
            type="button"
            onClick={() => {
              setMenuOpen(false);
              requestAnimationFrame(() => toggleRef.current?.focus());
            }}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>
        <p className="js-sidebar-label">Your workspace</p>
        <nav aria-label="Jobseeker workspace">
          <NavLink to="/jobseeker/dashboard">
            <LayoutDashboard size={19} aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/jobseeker/applications">
            <ClipboardList size={19} aria-hidden="true" />
            My applications
            {!applications.loading && !applications.error && (
              <span className="js-nav-count">
                {applications.applications.length}
              </span>
            )}
          </NavLink>
          <NavLink to="/jobseeker/jobs">
            <Search size={19} aria-hidden="true" />
            Find jobs
            <ArrowUpRight size={15} className="js-nav-out" aria-hidden="true" />
          </NavLink>
          <NavLink to="/jobseeker/profile">
            <UserRound size={19} aria-hidden="true" />
            My profile
            <ArrowUpRight size={15} className="js-nav-out" aria-hidden="true" />
          </NavLink>
        </nav>
        <div className="js-sidebar-tip">
          <span className="js-tip-icon">
            <UserRound size={20} aria-hidden="true" />
          </span>
          <h2>A profile that tells your story.</h2>
          <p>Keep your experience, skills, and resume up to date.</p>
          <Link to="/jobseeker/profile">
            View your profile
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="js-sidebar-bottom">
          <Link to="/contact">
            <CircleHelp size={18} aria-hidden="true" />
            Help & support
          </Link>
          <button type="button" onClick={logout} disabled={loggingOut}>
            <LogOut size={18} aria-hidden="true" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
          {logoutError && (
            <p className="js-logout-error" role="alert">
              {logoutError}
            </p>
          )}
          <Link to="/jobseeker/profile" className="js-sidebar-person">
            <span className="js-avatar">{initial}</span>
            <span>
              <strong>{user.name || "Your profile"}</strong>
              <small>Jobseeker account</small>
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <div className="js-workspace-body" inert={menuOpen}>
        <header className="js-topbar">
          <div>
            <button
              ref={toggleRef}
              className="js-menu-toggle"
              aria-label="Open menu"
              aria-controls="jobseeker-navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
            <span className="js-breadcrumb">
              Workspace <ChevronRight size={14} aria-hidden="true" />{" "}
              <strong>{title}</strong>
            </span>
          </div>
          <div>
            <Link
              to="/jobseeker/jobs"
              className="js-topbar-search"
              aria-label="Find jobs"
            >
              <Search size={19} />
              <span>Find your next role</span>
            </Link>
            <Link to="/jobseeker/profile" className="js-topbar-account">
              <span className="js-avatar">{initial}</span>
              <span>{user.name || "Your profile"}</span>
            </Link>
          </div>
        </header>
        <main id="jobseeker-main" className="js-main" tabIndex={-1}>
          <Outlet context={{ user, ...applications }} />
        </main>
        <div className="js-workspace-note">
          Your career, your direction.
          <Link to="/contact">
            Need help?
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
