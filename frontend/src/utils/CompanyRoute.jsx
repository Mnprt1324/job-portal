import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { CompanySidebar } from "../components/company/CompanySidebar";

export const CompanyRoute = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "company") {
    return <Navigate to="/" />;
  }

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <CompanySidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </section>
  );
};
