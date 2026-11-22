import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home } from "../pages/Home";
export const HomeEntry = () => {
  const user = useSelector((store) => store.auth.user);
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "company") return <Navigate to="/company/dashboard" replace />;
  return user?.role === "jobseeker" ? (
    <Navigate to="/jobseeker/dashboard" replace />
  ) : (
    <Home />
  );
};
