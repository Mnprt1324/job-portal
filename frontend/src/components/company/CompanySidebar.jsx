import { NavLink } from "react-router-dom";
import {
  Building2,
  BriefcaseBusiness,
  Gauge,
  CalendarCheck,
  Settings,
} from "lucide-react";

const navItems = [
  { path: "/company/dashboard", label: "Dashboard", icon: Gauge },
  { path: "/company/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { path: "/company/interviews", label: "Interviews", icon: CalendarCheck },
  { path: "/company/profile", label: "Company Profile", icon: Building2 },
  { path: "/company/settings", label: "Settings", icon: Settings },
];

export const CompanySidebar = () => {
  return (
    <nav aria-label="Company workspace">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink key={path} to={path}>
          <Icon size={19} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
};
