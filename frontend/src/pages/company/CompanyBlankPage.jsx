import { useLocation, Link } from "react-router-dom";
import { ArrowUpRight, CalendarDays, Settings } from "lucide-react";
import "./CompanyWorkspace.css";

export const CompanyBlankPage = () => {
  const { pathname } = useLocation();
  const section = pathname.split("/").at(-1);
  const content = {
    interviews: ["Interviews", "Interview scheduling is not available yet.", CalendarDays],
    settings: ["Settings", "Workspace settings are not available yet.", Settings],
  };
  const [title, description, Icon] = content[section] || content.settings;
  return <section className="company-panel"><header><div><h1>{title}</h1><p>{description}</p></div><Icon size={24} aria-hidden="true" /></header><div className="company-panel-body">
    <Link to="/company/dashboard">Back to dashboard <ArrowUpRight size={16} aria-hidden="true" /></Link></div></section>;
};
