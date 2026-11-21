import axios from "axios";
import { isAuthenticationFailure, redirectForExpiredSession } from '../utils/sessionExpiry';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = /\/users\/(login|register|password\/)/.test(error.config?.url || '');
    if (!isLoginRequest && isAuthenticationFailure(error.response?.status)) redirectForExpiredSession();
    return Promise.reject(error);
  },
);
// "https://job-mortal-1.onrender.com"
export const registerUserApiCall = (data) => {
  return api.post("/users/register", data);
};

export const loginUserApiCall = (data) => {
  return api.post("/users/login", data, { withCredentials: true });
};

export const logoutUserApiCall = () => {
  return api.post("/users/logout");
};

export const forgetPasswordApiCall = (email) => {
  return api.post("/users/password/forget", email, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const userResumeUploadApi = (resume) => {
  return api.post("users/profile/resume", resume, { withCredentials: true });
};

export const verifyOtpApiCall = (data) => {
  return api.post("/users/password/verify", data);
};

export const updatePassApiCall = (data) => {
  return api.post("/users/password/update", data);
};

export const updateUserProfile = (data) => {
  return api.post("/users/profile/update", data, {
    withCredentials: true,
  });
};

export const checkAuth = () => {
  return api.get("users/auth", { withCredentials: true });
};

//fecthing all jobs
export const getAllJobs = (options = {}) => {
  const { keyword = "", page = 1, limit = 6, sortBy = "new" } = options;
  return api.get(
    `job/getAllJobs?${new URLSearchParams({ keyword, page, limit, sortBy })}`,
    { withCredentials: true }
  );
};

// Company profiles owned by the signed-in account.

export const getOwnedCompaniesApi = () => {
  return api.post(`/company/get`, {}, { withCredentials: true });
};

export const updateCompanyProfileApi = (data, id) => {
  return api.post(`/company/update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

// Job listings owned by the signed-in company account.

export const getCompanyJobsApi = () => {
  return api.get(`/job/company/jobs`, { withCredentials: true });
};

// fecthing all applied job by user

export const getAllJobAppByUser = () => {
  return api.get(`/applications/getAppliedJob`, { withCredentials: true });
};

//fetching company by _Id
export const getIndCompanyById = (companyId) => {
  return api.post(`/company/get/${companyId}`, {}, { withCredentials: true });
};

//companies router

export const createCompanyApiCall = (comapny) => {
  return api.post(`/company/register`, comapny, { withCredentials: true });
};

export const postJobApiCall = (data) => {
  console.log(data);
  return api.post(`/job/createJob`, data, { withCredentials: true });
};

export const getSingleJobApiCall = (id) => {
  return api.get(`job/getJob/${id}`, { withCredentials: true });
};
export const updateJobApiCall = (id, data) => {
  return api.post(`job/updateJob/${id}`, data, { withCredentials: true });
};
export const deleteJobApiCall = (id) => api.delete(`/job/deleteJob/${id}`, { withCredentials: true });
export const getCompanySettingsApi = () => api.get('/users/company/settings');
export const updateCompanySettingsApi = (data) => api.patch('/users/company/settings', data);
export const changePasswordApi = (data) => api.post('/users/password/change', data);
export const getPushPublicKeyApi = () => api.get('/push/public-key');
export const subscribePushApi = (subscription) => api.post('/push/subscribe', { subscription });
export const unsubscribePushApi = (endpoint) => api.delete('/push/subscribe', { data: { endpoint } });
export const getAdminOverviewApi = () => api.get('/admin/overview');
export const getAdminRecordsApi = (resource, params) => api.get(`/admin/${resource}`, {params});
export const updateAdminRecordApi = (resource,id,data) => api.patch(`/admin/${resource}/${id}`,data);

export const applyJobApiCall = (id, data = {}) => {
  return api.post(`/applications/apply/${id}`, data, { withCredentials: true });
};

export const getAllApplicantApiCall = (id) => {
  return api.get(`applications/${id}/applicants`, { withCredentials: true });
};

export const getAplliedJobsByUser = () => {
  return api.get(`applications/getAppliedJob`, { withCredentials: true });
};

export const UpdateStatusApiCall = (id, status) => {
  return api.post(`applications/status/${id}/applicants`, status, {
    withCredentials: true,
  });
};

export const fetchOldNewJobs = async (sortOrder, limit) => {
  return api.get(`job/getAllJobs?sortBy=${sortOrder}&limit=${limit}`, {
    withCredentials: true,
  });
};

//send mail api

export const contactUsApiCall = async (data) => {
  return api.post(`/contactUs/sendandsave`, data, { withCredentials: true });
};
