import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
export const Super = () => {
  const { forgetAuth, resetFlowStep } = useSelector((store) => store.auth);
  const { pathname } = useLocation();
  if (!forgetAuth || !localStorage.getItem("email"))
    return <Navigate to="/forget" replace />;
  if (pathname === "/update/password" && resetFlowStep !== "update")
    return <Navigate to="/verify/password" replace />;
  return <Outlet />;
};
