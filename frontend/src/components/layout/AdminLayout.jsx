import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { WorkspaceShell } from "./JobseekerLayout";
import "../../pages/company/CompanyWorkspace.css";
import "../../pages/admin/Admin.css";
export const AdminLayout=()=>{
 const user=useSelector(state=>state.auth.user);
 if(!user)return <Navigate to="/login" replace/>;
 if(user.role!=='admin')return <Navigate to={user.role==='company'?'/company/dashboard':user.role==='jobseeker'?'/jobseeker/dashboard':'/login'} replace/>;
 return <WorkspaceShell admin/>;
};
