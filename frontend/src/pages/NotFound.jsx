import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import "./NotFound.css";

export const NotFound = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Page not found | ZipJob";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="not-found page-container" aria-labelledby="not-found-title">
      <p className="eyebrow">A small detour</p>
      <div className="not-found-code" aria-hidden="true">404<span>.</span></div>
      <h1 id="not-found-title">This page took a different path.</h1>
      <p className="not-found-description">The page you are looking for may have moved, or the link may be incorrect. Your next opportunity is still out there.</p>
      <div className="not-found-actions">
        <Link to="/" className="btn-primary"><ArrowLeft size={18} aria-hidden="true"/>Back to home</Link>
        <Link to="/findJob" className="text-link">Explore jobs <ArrowUpRight size={18} aria-hidden="true"/></Link>
      </div>
      <p className="not-found-help">Something not working? <Link to="/contact">Let us know.</Link></p>
    </main>
  );
};
