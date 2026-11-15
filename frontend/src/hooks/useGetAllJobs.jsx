import { useEffect, useState } from "react";
import { setAllJobs } from "../redux/jobSlice";
import { getAllJobs } from "../API/api";
import { useDispatch } from "react-redux";
const useGetAllJobs = ({
  keyword = "",
  sortBy = "new",
  page = 1,
  limit = 10,
}) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({
    jobs: [],
    loading: true,
    error: null,
    totalPages: 1,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs({
          keyword: keyword === "All" ? "" : keyword,
          sortBy,
          page,
          limit,
        });
        if (!active) return;
        if (!response.data.success) throw new Error("Unable to load jobs");
        const jobs = response.data.jobs || [];
        dispatch(setAllJobs(jobs));
        setState({
          jobs,
          loading: false,
          error: null,
          totalPages: response.data.totalPages || 1,
        });
      } catch {
        if (active)
          setState({
            jobs: [],
            loading: false,
            error: "We couldn't load jobs. Please try again.",
            totalPages: 1,
          });
      }
    };
    fetchJobs();
    return () => {
      active = false;
    };
  }, [keyword, sortBy, page, limit, dispatch, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
};
export default useGetAllJobs;
