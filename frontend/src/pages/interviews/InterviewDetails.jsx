import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock3, ExternalLink, MapPin, UserRound, Video } from 'lucide-react';
import { getInterviewApi } from '../../API/api';
import './Interviews.css';

export function InterviewDetails({ company = false }) {
  const { id } = useParams(); const [interview, setInterview] = useState(null); const [error, setError] = useState('');
  useEffect(() => { getInterviewApi(id).then(({data})=>setInterview(data.interview)).catch(()=>setError('This interview could not be loaded.')); }, [id]);
  const back = company ? '/company/interviews' : '/jobseeker/interviews';
  if (error) return <section className="interviews-page"><Link className="ca-back" to={back}><ArrowLeft size={17}/>Back to interviews</Link><div className="interview-empty"><h1>Interview unavailable</h1><p>{error}</p></div></section>;
  if (!interview) return <section className="interviews-page"><div className="interview-skeleton" aria-busy="true"/></section>;
  const date = new Date(interview.scheduledAt).toLocaleString('en-IN',{dateStyle:'full',timeStyle:'short'});
  return <section className="interviews-page interview-details" aria-labelledby="interview-title"><Link className="ca-back" to={back}><ArrowLeft size={17}/>Back to interviews</Link><header><p>{company ? 'Candidate interview' : 'Your scheduled interview'}</p><h1 id="interview-title">{interview.job?.title || 'Interview'}</h1><span>{company ? interview.applicant?.name : interview.scheduledBy?.name || 'Hiring team'}</span></header><div className="interview-detail-grid"><article className="interview-card"><h2>Interview details</h2><dl className="interview-detail-list"><div><dt><CalendarDays size={18}/>Date & time</dt><dd>{date}</dd></div><div><dt><Clock3 size={18}/>Duration</dt><dd>{interview.durationMinutes} minutes · {interview.round} round</dd></div><div><dt>{interview.mode==='online'?<Video size={18}/>:<MapPin size={18}/>}Format</dt><dd>{interview.mode==='online'?'Online meeting':interview.location}</dd></div><div><dt><UserRound size={18}/>{company?'Candidate':'Interviewer'}</dt><dd>{company ? `${interview.applicant?.name || 'Unavailable'} · ${interview.applicant?.email || ''}` : `${interview.scheduledBy?.name || 'Hiring team'} · ${interview.scheduledBy?.email || ''}`}</dd></div></dl>{interview.notes && <><h2>Preparation notes</h2><p className="interview-notes">{interview.notes}</p></>}</article><aside className="interview-card"><p className="interview-status">{interview.status.replaceAll('_',' ')}</p><h2>Ready for the next step?</h2><p className="interview-notes">Keep this page open for the interview details and joining instructions.</p>{interview.mode==='online' && interview.meetingUrl && <a className="btn-primary" href={interview.meetingUrl} target="_blank" rel="noreferrer">Join meeting <ExternalLink size={17}/></a>}</aside></div></section>;
}
