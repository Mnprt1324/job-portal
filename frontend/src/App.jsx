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
import { Companies } from "./pages/Companies";
import { Job } from "./pages/Job";
import { CreateCompany } from "./pages/CreateCompany";
import { UpdateCompanyProfile } from "./pages/UpdateCompanyProfile";
import { JobCreate } from "./pages/JobCreate";
import { HomeEntry } from "./utils/HomeEntry";
import { JobseekerLayout } from "./components/layout/JobseekerLayout";
import { JobseekerDashboard } from "./pages/jobseeker/JobseekerDashboard";
import { JobseekerApplications } from "./pages/jobseeker/JobseekerApplications";
import { Contact } from "./pages/Contact";
import { UpdateJob } from "./pages/UpdateJob";
import { Applicants } from "./pages/Applicants";
import { RecruiterDashboard } from "./pages/RecruiterDashboard";
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { CompanySettings } from "./pages/company/CompanySettings";
import { CompanyBlankPage } from "./pages/company/CompanyBlankPage";
import { CompanyProfile } from "./components/company/CompanyProfile";
import { CompanyJobs } from "./components/company/jobs/jobs";
import { PopularJobs } from "./components/home/PopularJobs";
import { NewJobs } from "./components/home/NewJobs";
import { OldJobs } from "./components/home/OldJobs";
import PrivateRoute from "./utils/PrivateRoute";
import { RoleBasedRoute } from "./utils/RoleBasedRoute";
import { CompanyRoute } from "./utils/CompanyRoute";
import { Super } from "./utils/Super";

export const App = () => {
  const router = createBrowserRouter([
    { path: "*", element: <NotFound /> },
        {
          element: <CompanyRoute />,
          children: [
            { path: "company", element: <Navigate to="/company/dashboard" replace /> },
            { path: "company/dashboard", element: <CompanyDashboard /> },
            { path: "company/jobs", element: <CompanyJobs /> },
            { path: "company/interviews", element: <CompanyBlankPage /> },
            { path: "company/profile", element: <CompanyProfile /> },
            { path: "company/account", element: <Navigate to="/company/profile" replace /> },
            { path: "company/settings", element: <CompanySettings /> },
          ],
        },
    { path: "/jobseeker", element: <JobseekerLayout />, children: [
      { index: true, element: <Navigate to="/jobseeker/dashboard" replace /> },
      { path: "dashboard", element: <JobseekerDashboard /> },
      { path: "applications", element: <JobseekerApplications /> },
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
        {
          element: <RoleBasedRoute />, 
          children: [
            { path: "dashboard", element: <RecruiterDashboard /> },
            { path: "companies", element: <Companies /> },
            { path: "companies/create", element: <CreateCompany /> },
            { path: "companies/update/profile/:id", element: <UpdateCompanyProfile /> },
            { path: "job/create", element: <JobCreate /> },
            { path: "jobs", element: <Job /> },
            { path: "jobs/update/:id", element: <UpdateJob /> },
            { path: "jobs/applicants/:id", element: <Applicants /> },
          ],
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
