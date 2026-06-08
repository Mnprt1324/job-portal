import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BriefcaseBusiness,
  Building2,
  FilePlus2,
  Gauge,
  PlusCircle,
  Users,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: Gauge },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { path: "/companies/create", label: "New Company", icon: PlusCircle },
  { path: "/job/create", label: "Post Job", icon: FilePlus2 },
];

export const RecruiterSidebar = () => {
  const user = useSelector((state) => state.auth.user);
  const workspaceLabel = user?.role === "company" ? "Company" : "Recruiter";

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">
      <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {workspaceLabel}
          </p>
          <h2 className="mt-1 text-xl font-bold text-gray-950">Workspace</h2>
        </div>

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

        <div className="hidden border-t border-gray-100 p-4 lg:block">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Hiring Panel
                </p>
                <p className="text-xs text-gray-500">Manage applicants faster</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
