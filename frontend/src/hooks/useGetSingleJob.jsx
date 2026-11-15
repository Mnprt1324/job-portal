import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setSingleJob } from "../redux/jobSlice";
import { getSingleJobApiCall } from "../API/api";

const useGetSingleJob = (id) => {
  const dispatch = useDispatch();
  const [state, setState] = useState({ loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    dispatch(setSingleJob(null));
    setState({ loading: true, error: null });
    const fetchJob = async () => {
      try {
        const response = await getSingleJobApiCall(id);
        if (!response.data?.success) throw new Error();
        if (active) {
          dispatch(setSingleJob(response.data.job));
          setState({ loading: false, error: null });
        }
      } catch {
        if (active)
          setState({
            loading: false,
            error:
              "We could not load this role. It may no longer be available.",
          });
      }
    };
    fetchJob();
    return () => {
      active = false;
    };
  }, [id, dispatch, attempt]);
  return { ...state, retry: () => setAttempt((value) => value + 1) };
};
export default useGetSingleJob;
