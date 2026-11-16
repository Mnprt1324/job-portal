import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { WorkspaceShell } from "../components/layout/JobseekerLayout";

export const CompanyRoute = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "company") {
    return <Navigate to="/" />;
  }

  return <WorkspaceShell company />;
};
