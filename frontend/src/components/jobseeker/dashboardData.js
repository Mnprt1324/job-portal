export const getProfileChecklist = (user) => [
  { label: "Name and email", complete: !!(user?.name && user?.email) },
  { label: "Professional bio", complete: !!user?.profile?.bio?.trim() },
  { label: "Location", complete: !!user?.profile?.location?.trim() },
  { label: "Skills", complete: !!user?.profile?.skills?.length },
  { label: "Resume", complete: !!user?.profile?.resume },
];
export const applicationStatus = (application) =>
  ["pending", "accepted", "rejected"].includes(
    application.status?.toLowerCase(),
  )
    ? application.status.toLowerCase()
    : "pending";
