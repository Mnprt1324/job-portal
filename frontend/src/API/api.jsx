import axios from "axios";

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
    `job/getAllJobs?keyword=${keyword}&page=${page}&limit=${limit}&sortBy=${sortBy}`,
    { withCredentials: true }
  );
};

//fecthing all company created by recuriter

export const getAllRecurCompanied = () => {
  return api.post(`/company/get`, {}, { withCredentials: true });
};

export const updateCompanyProfileApi = (data, id) => {
  return api.post(`/company/update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });
};

// fecthing all job create by admin(recur) GetAllAdminJobs

export const GetAllJobsCrtByRec = () => {
  return api.get(`/job/getAllrecJob`, { withCredentials: true });
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
  return api.post(`/contactUs//sendandsave`, data, { withCredentials: true });
};
