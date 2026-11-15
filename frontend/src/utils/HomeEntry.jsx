import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Home } from "../pages/Home";
export const HomeEntry = () => {
  const user = useSelector((store) => store.auth.user);
  return user?.role === "jobseeker" ? (
    <Navigate to="/jobseeker/dashboard" replace />
  ) : (
    <Home />
  );
};
