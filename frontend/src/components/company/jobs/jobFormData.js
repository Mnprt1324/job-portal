export const emptyJobForm = {
  title: "",
  company: "",
  location: "",
  salary: "",
  requirement: "",
  description: "",
  jobType: "Full-time",
  workMode: "",
  experienceLevel: "",
  department: "",
  openings: "",
  applicationDeadline: "",
  responsibilities: "",
  education: "",
  benefits: "",
};

export const mapJobToForm = (job) => ({
  title: job?.title || "",
  company: job?.company?._id || job?.company || "",
  location: job?.location || "",
  salary: String(job?.salary ?? ""),
  requirement: Array.isArray(job?.requirement)
    ? job.requirement.join(", ")
    : job?.requirement || "",
  description: job?.description || "",
  jobType: job?.jobType || "Full-time",
  workMode: job?.workMode || "",
  experienceLevel: job?.experienceLevel || "",
  department: job?.department || "",
  openings: String(job?.openings ?? ""),
  applicationDeadline: job?.applicationDeadline || "",
  responsibilities: job?.responsibilities || "",
  education: job?.education || "",
  benefits: job?.benefits || "",
});
