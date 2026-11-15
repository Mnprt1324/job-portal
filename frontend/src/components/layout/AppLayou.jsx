import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Footer } from "../ui/Footer";
import { Navbar } from "../ui/Navbar";
export const AppLayout = () => {
  const { pathname, hash, search } = useLocation();
  const user = useSelector((store) => store.auth.user);
  useEffect(() => {
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  if (user?.role === "jobseeker") {
    const destination =
      pathname.toLowerCase() === "/findjob"
        ? "/jobseeker/jobs"
        : pathname === "/profile"
          ? "/jobseeker/profile"
          : pathname.startsWith("/job/apply/")
            ? pathname.replace("/job/apply/", "/jobseeker/jobs/")
            : null;
    if (destination)
      return <Navigate to={`${destination}${search}${hash}`} replace />;
  }
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
