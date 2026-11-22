import {CompanyApplicants} from "./pages/company/CompanyApplicants";
import {JobseekerMessages} from "./pages/jobseeker/JobseekerMessages";
import { NotFound } from "./pages/NotFound";
import { AuthLayout } from "./components/layout/AuthLayout";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayou"; // ✅ Fixed import
import { About } from "./pages/About";
import { FindJob } from "./pages/FindJob";
import "./App.css";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Forget } from "./pages/Forget";
import { UpdatePass } from "./pages/Updatepass"; 
import { VerifyPass } from "./pages/VerifyPass";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { JobApply } from "./pages/JobApply";
import { Profile } from "./pages/Profile";
import { ProfileUpdate } from "./components/ProfileUpdate";
import { HomeEntry } from "./utils/HomeEntry";
import { JobseekerLayout } from "./components/layout/JobseekerLayout";
import { JobseekerDashboard } from "./pages/jobseeker/JobseekerDashboard";
import { JobseekerApplications } from "./pages/jobseeker/JobseekerApplications";
import { Contact } from "./pages/Contact";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { CompanySettings } from "./pages/company/CompanySettings";
import { CompanyMessages } from "./pages/company/CompanyMessages";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { AdminLayout } from "./components/layout/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminRecords } from "./pages/admin/AdminRecords";
import { AdminJobDetails } from "./pages/admin/AdminJobDetails";
import { AdminCompanyProfile } from "./pages/admin/AdminCompanyProfile";
import { AdminUserProfile } from "./pages/admin/AdminUserProfile";
import { AdminApplicationDetails } from "./pages/admin/AdminApplicationDetails";
import { CompanyBlankPage } from "./pages/company/CompanyBlankPage";
import { Interviews } from "./pages/interviews/Interviews";
import { InterviewDetails } from "./pages/interviews/InterviewDetails";
import { CompanyProfile } from "./components/company/CompanyProfile";
import { CompanyJobs } from "./components/company/jobs/jobs";
import { PopularJobs } from "./components/home/PopularJobs";
import { NewJobs } from "./components/home/NewJobs";
import { OldJobs } from "./components/home/OldJobs";
import PrivateRoute from "./utils/PrivateRoute";
import { CompanyRoute } from "./utils/CompanyRoute";
import { Super } from "./utils/Super";

export const App = () => {
  const router = createBrowserRouter([
    { path: "*", element: <NotFound /> },
    {path:"/admin",element:<AdminLayout/>,children:[
      {index:true,element:<Navigate to="/admin/dashboard" replace/>},
      {path:"dashboard",element:<AdminDashboard/>},
      {path:"jobs/:id",element:<AdminJobDetails/>},
      {path:"companies/:id",element:<AdminCompanyProfile/>},
      {path:"users/:id",element:<AdminUserProfile/>},
      {path:"applications/:id",element:<AdminApplicationDetails/>},
      ...['users','companies','jobs','applications','contacts'].map(resource=>({path:resource,element:<AdminRecords key={resource} resource={resource}/>})),
    ]},
        {
          element: <CompanyRoute />,
          children: [
            { path: "company", element: <Navigate to="/company/dashboard" replace /> },
            { path: "company/dashboard", element: <CompanyDashboard /> },
            { path: "company/jobs", element: <CompanyJobs /> },
            { path: "company/jobs/:id/applicants", element: <CompanyApplicants /> },
            { path: "company/interviews", element: <Interviews company /> },
            { path: "company/interviews/:id", element: <InterviewDetails company /> },
            { path: "company/profile", element: <CompanyProfile /> },
            { path: "company/account", element: <Navigate to="/company/profile" replace /> },
            { path: "company/settings", element: <CompanySettings /> },
            { path: "company/messages", element: <CompanyMessages /> },
            { path: "company/notifications", element: <NotificationsPage /> },
          ],
        },
    { path: "/jobseeker", element: <JobseekerLayout />, children: [
      { index: true, element: <Navigate to="/jobseeker/dashboard" replace /> },
      { path: "dashboard", element: <JobseekerDashboard /> },
      { path: "applications", element: <JobseekerApplications /> },
      { path: "messages", element: <JobseekerMessages /> },
      { path: "interviews", element: <Interviews /> },
      { path: "interviews/:id", element: <InterviewDetails /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "jobs", element: <FindJob /> },
      { path: "jobs/:id", element: <div className="js-job-detail-route"><JobApply /></div> },
      { path: "profile", element: <div className="js-profile-route"><Profile /></div> },
    ] },
    { element: <AuthLayout />, children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forget", element: <Forget /> },
      { element: <Super />, children: [
        { path: "/verify/password", element: <VerifyPass /> },
        { path: "/update/password", element: <UpdatePass /> },
      ] },
    ] },
    {
      path: "/",
      element: <AppLayout />,
      children: [
        {
          path: "",
          element: <HomeEntry />,
          children: [
            { path: "", element: <PopularJobs /> },
            { path: "jobs/new", element: <NewJobs /> },
            { path: "jobs/old", element: <OldJobs /> },
          ],
        },
        { path: "findJob", element: <FindJob /> },
        { path: "about", element: <About /> },
        { path: "contact", element: <Contact /> },
        {
          path: "job/apply/:id",
          element: (
            <PrivateRoute>
              <JobApply />
            </PrivateRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          ),
        },
        {
          path: "extra",
          element: (
            <PrivateRoute>
              <ProfileUpdate />
            </PrivateRoute>
          ),
        },


      ],
    },
  ]);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
