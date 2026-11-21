import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, CircleDot, FileText, MapPin, Search, UsersRound, XCircle } from 'lucide-react';
import { getAllApplicantApiCall, UpdateStatusApiCall } from '../../API/api';
import { MessageApplicationButton } from '../../components/messages/MessageApplicationButton';
import './CompanyApplicants.css';

const statusMeta = {
  pending: { label: 'In review', icon: CircleDot },
  accepted: { label: 'Accepted', icon: CheckCircle2 },
  rejected: { label: 'Not selected', icon: XCircle },
};

const getInitials = (name = '') => name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || '?';
const shortDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function CompanyApplicants() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [retry, setRetry] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAllApplicantApiCall(id)
      .then(({ data }) => {
        if (!active) return;
        setItems(data.applicants || []);
        setJob(data.job || null);
      })
      .catch(() => {
        if (active) setError('Unable to load applicants. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id, retry]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter((item) => item.status === 'pending').length,
    accepted: items.filter((item) => item.status === 'accepted').length,
    rejected: items.filter((item) => item.status === 'rejected').length,
  }), [items]);

  const visibleApplicants = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((application) => {
      const candidate = application.applicant || {};
      const matchesStatus = filter === 'all' || application.status === filter;
      const matchesSearch = !needle || `${candidate.name || ''} ${candidate.email || ''} ${candidate.profile?.location || ''}`.toLowerCase().includes(needle);
      return matchesStatus && matchesSearch;
    });
  }, [items, filter, search]);

  const changeStatus = async (application, status) => {
    setSaving(application._id);
    setError('');
    try {
      await UpdateStatusApiCall(application._id, { status });
      setItems((previous) => previous.map((item) => (item._id === application._id ? { ...item, status } : item)));
    } catch {
      setError('Could not update this application. Please try again.');
    } finally {
      setSaving('');
    }
  };

  return <section className="company-applicants" aria-labelledby="applicants-title">
    <Link className="ca-back" to="/company/jobs"><ArrowLeft size={17} aria-hidden="true" />Back to jobs</Link>
    <header className="ca-hero">
      <div>
        <p className="ca-eyebrow">Hiring pipeline</p>
        <h1 id="applicants-title">{job?.title || 'Applicants'}</h1>
        <p>Review candidates, update their progress, and continue the conversation in one place.</p>
        {job && <div className="ca-job-meta"><span><BriefcaseBusiness size={15} aria-hidden="true" />{job.jobType || 'Role'}</span>{job.location && <span><MapPin size={15} aria-hidden="true" />{job.location}</span>}</div>}
      </div>
      <div className="ca-total" aria-label={`${counts.all} total applicants`}><UsersRound size={22} aria-hidden="true" /><strong>{counts.all}</strong><span>Applicants</span></div>
    </header>
    {error && <div className="ca-alert" role="alert"><span>{error}</span><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}
    <div className="ca-summary" aria-label="Application status summary">
      <SummaryCard label="All candidates" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
      <SummaryCard label="In review" count={counts.pending} tone="review" active={filter === 'pending'} onClick={() => setFilter('pending')} />
      <SummaryCard label="Accepted" count={counts.accepted} tone="accepted" active={filter === 'accepted'} onClick={() => setFilter('accepted')} />
      <SummaryCard label="Not selected" count={counts.rejected} tone="rejected" active={filter === 'rejected'} onClick={() => setFilter('rejected')} />
    </div>
    <section className="ca-list-panel" aria-label="Applicant list">
      <div className="ca-list-toolbar"><div><h2>Candidate review</h2><p>{visibleApplicants.length} {visibleApplicants.length === 1 ? 'candidate' : 'candidates'} shown</p></div><label className="ca-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search candidates</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidates" maxLength={100} /></label></div>
      {loading ? <ApplicantSkeletons /> : visibleApplicants.length ? <div className="ca-applicant-grid">{visibleApplicants.map((application) => <ApplicantCard key={application._id} application={application} saving={saving === application._id} onStatusChange={changeStatus} />)}</div> : <div className="ca-empty"><UsersRound size={30} aria-hidden="true" /><h2>{items.length ? 'No candidates match this view.' : 'No applications yet.'}</h2><p>{items.length ? 'Try another status or search term.' : 'Candidates who apply to this role will appear here.'}</p>{items.length > 0 && <button type="button" onClick={() => { setFilter('all'); setSearch(''); }}>Clear filters</button>}</div>}
    </section>
  </section>;
}

function SummaryCard({ label, count, tone = 'all', active, onClick }) {
  return <button type="button" className={`ca-summary-card ca-summary-${tone} ${active ? 'is-active' : ''}`} aria-pressed={active} onClick={onClick}><span>{label}</span><strong>{count}</strong></button>;
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  tone: PropTypes.string,
  active: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

function ApplicantCard({ application, saving, onStatusChange }) {
  const candidate = application.applicant || {};
  const meta = statusMeta[application.status] || statusMeta.pending;
  const StatusIcon = meta.icon;
  const resumeUrl = candidate.profile?.resume;
  return <article className="ca-applicant-card">
    <div className="ca-candidate-heading"><span className="ca-avatar" aria-hidden="true">{getInitials(candidate.name)}</span><div><h3>{candidate.name || 'Account unavailable'}</h3><a href={`mailto:${candidate.email}`}>{candidate.email || 'Email unavailable'}</a></div><span className={`ca-status ca-status-${application.status || 'pending'}`}><StatusIcon size={14} aria-hidden="true" />{meta.label}</span></div>
    <div className="ca-candidate-details"><span><MapPin size={15} aria-hidden="true" />{candidate.profile?.location || 'Location not shared'}</span><span>Applied {shortDate(application.createdAt)}</span></div>
    <div className="ca-card-actions"><label><span>Application status</span><select aria-label={`Application status for ${candidate.name || 'candidate'}`} value={application.status} disabled={saving} onChange={(event) => onStatusChange(application, event.target.value)}><option value="pending">In review</option><option value="accepted">Accepted</option><option value="rejected">Not selected</option></select></label><div className="ca-action-links">{resumeUrl && /^https?:\/\//.test(resumeUrl) && <a className="btn-secondary" href={resumeUrl} target="_blank" rel="noreferrer"><FileText size={16} aria-hidden="true" />Resume</a>}<MessageApplicationButton applicationId={application._id} /></div></div>
  </article>;
}

ApplicantCard.propTypes = {
  application: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['pending', 'accepted', 'rejected']).isRequired,
    createdAt: PropTypes.string,
    applicant: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      profile: PropTypes.shape({ location: PropTypes.string, resume: PropTypes.string }),
    }),
  }).isRequired,
  saving: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

function ApplicantSkeletons() { return <div className="ca-applicant-grid" role="status" aria-label="Loading applicants">{[1, 2, 3].map((item) => <div key={item} className="ca-skeleton"><span /><span /><span /></div>)}</div>; }
