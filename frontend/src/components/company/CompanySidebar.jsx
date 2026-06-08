import { NavLink } from "react-router-dom";
import {
  Building2,
  BriefcaseBusiness,
  Gauge,
  CalendarCheck,
  Settings,
  UserRound,
} from "lucide-react";

const navItems = [
  { path: "/company/dashboard", label: "Dashboard", icon: Gauge },
  { path: "/company/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { path: "/company/interviews", label: "Interviews", icon: CalendarCheck },
  { path: "/company/profile", label: "Company Profile", icon: Building2 },
  { path: "/company/account", label: "Account", icon: UserRound },
  { path: "/company/settings", label: "Settings", icon: Settings },
];

export const CompanySidebar = () => {
  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 bg-white shadow-sm">

        <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-w-max items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-700"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
