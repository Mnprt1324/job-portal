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
  ChevronDown,
} from "lucide-react";
import PropTypes from "prop-types";
import { CompanySidebar } from "../company/CompanySidebar";
import { AdminSidebar } from "../admin/AdminSidebar";
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
        to={user.role === "company" ? "/company/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/login"}
        replace
      />
    );
  return <JobseekerWorkspace />;
};

const JobseekerWorkspace = () => {
  const user = useSelector((store) => store.auth.user);
  const applications = useJobseekerApplications(user._id);
  return <WorkspaceShell applications={applications} />;
};

export const WorkspaceShell = ({ company = false, admin = false, applications = {} }) => {
  const user = useSelector((store) => store.auth.user);
  const base = admin ? "/admin" : company ? "/company" : "/jobseeker";
  const profilePath = admin ? "/admin/dashboard" : company ? "/company/profile" : "/jobseeker/profile";
  const { pathname } = useLocation();
  const messagesPage = company && pathname === "/company/messages";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const drawerRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => {
    if (!accountOpen) return;
    const outside = (event) => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("focusin", outside);
    };
  }, [accountOpen]);
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
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
  const companyTitles = {dashboard: "Dashboard", jobs: "Jobs", interviews: "Interviews", profile: "Company profile", account: "Account", settings: "Settings", messages: "Messages"};
  const adminTitles = {dashboard:"Overview",users:"Users",companies:"Companies",jobs:"Jobs",applications:"Applications",contacts:"Inbox"};
  const title = admin ? (adminTitles[pathname.split("/")[2]] || "Admin") : company ? (companyTitles[pathname.split("/")[2]] || "Workspace") : pathname.endsWith("/applications")
    ? "My applications"
    : pathname.startsWith("/jobseeker/profile")
      ? "My profile"
      : pathname === "/jobseeker/jobs"
        ? "Find jobs"
        : pathname.startsWith("/jobseeker/jobs/")
          ? "Job details"
          : "Dashboard";
  return (
    <div className={`js-workspace ${company || admin ? "company-workspace" : ""} ${admin ? "admin-workspace" : ""}`}>
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
        aria-label={admin ? "Admin navigation" : company ? "Company navigation" : "Jobseeker navigation"}
      >
        <div className="js-brand-row">
          <Link to={`${base}/dashboard`} className="js-brand">
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
        <p className="js-sidebar-label">{admin ? "Platform administration" : "Your workspace"}</p>
        {admin ? <AdminSidebar /> : company ? <CompanySidebar /> : <nav aria-label="Jobseeker workspace">
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
        </nav>}
      </aside>
      <div className={`js-workspace-body ${messagesPage ? "js-messages-workspace" : ""}`} inert={menuOpen}>
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
              to={admin ? "/admin/users" : `${base}/jobs`}
              className="js-topbar-search"
              aria-label={admin ? "Manage users" : company ? "Manage jobs" : "Find jobs"}
            >
              <Search size={19} />
              <span>{admin ? "Manage users" : company ? "Manage jobs" : "Find your next role"}</span>
            </Link>
            <div className="js-account" ref={accountRef}>
            <button type="button" ref={accountButtonRef} className="js-topbar-account" aria-label={user.name || "Your profile"} aria-expanded={accountOpen} aria-controls="jobseeker-account-menu" onClick={() => setAccountOpen((open) => !open)}>
              <span className="js-avatar">{initial}</span>
              <span>{user.name || "Your profile"}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>
            {accountOpen && <div id="jobseeker-account-menu" className="js-account-dropdown" aria-label="Account options">
              <Link to={profilePath} onClick={() => setAccountOpen(false)}><UserRound size={18} aria-hidden="true" />{admin ? "Admin overview" : company ? "Company profile" : "My profile"}</Link>
              <Link to="/contact" onClick={() => setAccountOpen(false)}><CircleHelp size={18} aria-hidden="true" />Help & support</Link>
              <button type="button" onClick={logout} disabled={loggingOut}><LogOut size={18} aria-hidden="true" />{loggingOut ? "Signing out..." : "Sign out"}</button>
              {logoutError && <p className="js-logout-error" role="alert">{logoutError}</p>}
            </div>}
            </div>
          </div>
        </header>
        <main id="jobseeker-main" className="js-main" tabIndex={-1}>
          <Outlet context={{ user, ...applications }} />
        </main>
        {!messagesPage && <div className="js-workspace-note">
          {admin ? "ZipJob administration" : company ? "Your team, your next chapter." : "Your career, your direction."}
          <Link to="/contact">
            Need help?
            <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>}
      </div>
    </div>
  );
};

WorkspaceShell.propTypes = { company: PropTypes.bool, admin: PropTypes.bool, applications: PropTypes.object };
