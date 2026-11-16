import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, Trash2, X } from "lucide-react";
import PropTypes from "prop-types";
import { deleteJobApiCall } from "../../../API/api";

export const DeleteJobDialog = ({ job, onCancel, onDeleted }) => {
  const ref = useRef(null);
  const cancelRef = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  const remove = async () => {
    if (deleting) return;
    setDeleting(true); setError("");
    try {
      const { data } = await deleteJobApiCall(job._id);
      if (!data.success) throw Error(data.message || "Unable to delete this job.");
      onDeleted(job._id);
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message || "Unable to delete this job. Please try again.");
      setDeleting(false);
    }
  };
  return <dialog ref={ref} className="cj-delete-dialog" aria-labelledby="cj-delete-title" aria-describedby="cj-delete-description cj-delete-history" aria-busy={deleting} onCancel={(event) => {event.preventDefault();if (!deleting) onCancel();}}>
    <div className="cj-delete-body">
      <div className="cj-delete-heading"><span className="cj-delete-icon"><Trash2 size={21} aria-hidden="true" /></span><h2 id="cj-delete-title">Delete this job?</h2><button className="cj-delete-close" type="button" aria-label="Close delete dialog" disabled={deleting} onClick={onCancel}><X size={19} aria-hidden="true" /></button></div>
      <div className="cj-delete-job"><Building2 size={20} aria-hidden="true" /><div><p className="cj-delete-job-name">{job.title}</p>{job.company?.companyName && <p className="cj-delete-company">{job.company.companyName}</p>}</div></div>
      <p id="cj-delete-description">This job will be removed from listings and will no longer accept applications.</p>
      <p id="cj-delete-history">Existing application history will be kept.</p>
      {error && <p className="cj-field-error" role="alert">{error}</p>}
    </div>
    <div className="cj-delete-actions"><button ref={cancelRef} className="btn-secondary" type="button" disabled={deleting} onClick={onCancel}>Cancel</button><button className="cj-delete-confirm" type="button" disabled={deleting} onClick={remove}>{deleting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}{deleting ? "Deleting job..." : "Delete job"}</button></div>
  </dialog>;
};
DeleteJobDialog.propTypes = {job:PropTypes.object.isRequired,onCancel:PropTypes.func.isRequired,onDeleted:PropTypes.func.isRequired};
