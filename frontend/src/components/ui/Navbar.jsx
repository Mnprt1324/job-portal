import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BrandMark } from "./BrandMark";
import { logoutUserApiCall } from "../../API/api";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/authSlice";
import { useState, useEffect, useRef, useCallback } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { HiMiniXMark } from "react-icons/hi2";
import {
  IoHome, IoSearch, IoInformationCircle, IoMail,
  IoLogOut, IoPersonCircle, IoChevronDown,
} from "react-icons/io5";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: IoHome },
  { path: "/findJob", label: "Find Jobs", icon: IoSearch },
  { path: "/about", label: "About", icon: IoInformationCircle },
  { path: "/contact", label: "Contact", icon: IoMail },
];

const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239ca3af'><circle cx='12' cy='8' r='4'/><path d='M4 20c0-4 4-6 8-6s8 2 8 6'/></svg>";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dropdownRef = useRef(null);
  const profileBtnRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!showProfileDropdown) return;
    const onClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !profileBtnRef.current?.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setShowProfileDropdown(false); profileBtnRef.current?.focus(); }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showProfileDropdown]);

  useEffect(() => {
    const escape = (event) => { if (event.key === "Escape") { setIsOpen(false); document.querySelector('[aria-label="Close menu"]')?.focus(); } };
    document.addEventListener("keydown", escape);
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", escape); };
  }, [isOpen]);

  const handleOpenBoxClick = useCallback(() => {
    setIsOpen((v) => !v);
    setShowProfileDropdown(false);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await logoutUserApiCall();
      if (response?.data?.success) {
        localStorage.clear();
        Cookies.remove("token");
        dispatch(logoutUser());
        toast.success(response.data.message);
        setIsOpen(false);
        setShowProfileDropdown(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsOpen(false);
    setShowProfileDropdown(false);
  };

  const dashboardPath = user?.role === "admin" ? "/admin/dashboard" : user?.role === "company" ? "/company/dashboard" : "/jobseeker/dashboard";

  const isCompany = ["company","admin"].includes(user?.role);
  const navigationItems = isCompany ? [] : NAV_ITEMS.map(item => user?.role === "jobseeker" && item.path === "/" ? { ...item, path: "/jobseeker/dashboard", label: "Dashboard" } : item);

  const avatarSrc = user?.profile?.profileImg || FALLBACK_AVATAR;
  const displayName = user?.name || user?.fullname || "User";

  return (
    <>
      {/* Floating navbar wrapper */}
      <div className="site-header fixed top-0 left-0 right-0 z-50">
        <nav
          className={`max-w-7xl mx-auto transition-all duration-500 rounded-2xl ${
            scrolled
              ? "bg-white/85 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60"
              : "bg-white/60 backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-white/40"
          }`}
        >
          <div className="px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 lg:h-[72px]">

              {/* ── Logo ───────────────────────────── */}
              <NavLink
                to="/"
                className="flex items-center gap-3 group shrink-0"
                aria-label="JobOrbit home"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-violet-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  <BrandMark size={42} className="relative drop-shadow-md transition-transform duration-500 group-hover:rotate-6" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xl font-extrabold tracking-tight">
                    <span className="text-gray-900">Job</span>
                    <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Orbit</span>
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 tracking-[0.2em] uppercase">
                    Find Your Future
                  </span>
                </div>
              </NavLink>

              {/* ── Desktop nav links ───────────────── */}
              <div className="public-nav-links hidden lg:flex items-center gap-1 p-1 rounded-full bg-gray-50/70 border border-gray-100">
                {navigationItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                      `relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-100"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                      }`
                    }
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>

              {/* ── Desktop auth ─────────────────────── */}
              <div className="nav-auth-actions hidden lg:flex items-center gap-3">
                {isAuthenticated && <NavLink to={dashboardPath} className="nav-dashboard-button" aria-label="Go to dashboard"><IoHome className="w-[18px] h-[18px]" aria-hidden="true"/><span>Dashboard</span></NavLink>}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      ref={profileBtnRef}
                      type="button"
                      onClick={() => setShowProfileDropdown((v) => !v)}
                      aria-haspopup="menu"
                      aria-expanded={showProfileDropdown}
                      className="flex items-center gap-3 pl-1.5 pr-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="relative">
                        <img
                          src={avatarSrc}
                          alt=""
                          onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                      </div>
                      <div className="text-left leading-tight">
                        <p className="text-[13px] font-semibold text-gray-900 truncate max-w-[120px]">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">
                          {user?.role || "user"}
                        </p>
                      </div>
                      <IoChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                          showProfileDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showProfileDropdown && (
                      <div
                        ref={dropdownRef}
                        role="menu"
                        className="absolute right-0 top-full mt-3 w-72 origin-top-right bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                      >
                        {/* gradient header */}
                        <div className="relative p-4 bg-gradient-to-br from-blue-50 via-violet-50 to-white border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarSrc}
                              alt=""
                              onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow"
                            />
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 truncate">{displayName}</h3>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600/10 text-blue-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
                                {user?.role}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <button
                            role="menuitem"
                            onClick={handleProfile}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                          >
                            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                              <IoPersonCircle className="w-4 h-4" />
                            </span>
                            <span>View Profile</span>
                          </button>
                          <button
                            role="menuitem"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                              <IoLogOut className="w-4 h-4" />
                            </span>
                            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="nav-signin px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      Sign in
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="nav-primary-cta relative px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                    >
                      Get Started
                    </NavLink>
                  </>
                )}
              </div>

              {/* ── Mobile toggle ────────────────────── */}
              <button
                type="button"
                onClick={handleOpenBoxClick}
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
                className="lg:hidden p-2.5 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <HiMiniXMark className="text-xl" />
                ) : (
                  <RxHamburgerMenu className="text-xl" />
                )}
              </button>
            </div>
          </div>

          {/* ── Mobile menu ─────────────────────────── */}
          {isOpen && (
            <div className="lg:hidden border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="px-4 py-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <div className="space-y-1 mb-4">
                  {navigationItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                      key={path}
                      to={path}
                      end={path === "/"}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-blue-50 to-violet-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      <span>{label}</span>
                    </NavLink>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <NavLink to={dashboardPath} onClick={() => setIsOpen(false)} className="nav-dashboard-button nav-dashboard-mobile" aria-label="Go to dashboard"><IoHome className="w-[18px] h-[18px]" aria-hidden="true"/><span>Dashboard</span></NavLink>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <img
                          src={avatarSrc}
                          alt=""
                          onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate text-sm">{displayName}</p>
                          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <IoPersonCircle className="w-[18px] h-[18px]" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl shadow-lg shadow-red-500/25 disabled:opacity-50 transition-all"
                      >
                        <IoLogOut className="w-[18px] h-[18px]" />
                        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <NavLink
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Sign in
                      </NavLink>
                      <NavLink
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block w-full px-4 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                      >
                        Get Started
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Spacer so page content isn't hidden behind floating bar */}
      <div className="site-header-spacer" aria-hidden="true" />
    </>
  );
};
