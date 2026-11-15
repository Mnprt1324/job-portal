import { useCallback, useEffect, useState } from "react";
import { getAllJobAppByUser } from "../API/api";

export const useJobseekerApplications = (userId, enabled = true) => {
  const [state, setState] = useState({
    applications: [],
    loading: true,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setState({ applications: [], loading: true, error: null });
    const fetchApplications = async () => {
      try {
        const response = await getAllJobAppByUser();
        if (!response.data?.success)
          throw new Error("Applications unavailable");
        if (active)
          setState({
            applications: [...(response.data.application || [])].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            ),
            loading: false,
            error: null,
          });
      } catch {
        if (active)
          setState({
            applications: [],
            loading: false,
            error: "We could not load your applications. Please try again.",
          });
      }
    };
    fetchApplications();
    return () => {
      active = false;
    };
  }, [userId, attempt, enabled]);
  return { ...state, retry };
};
