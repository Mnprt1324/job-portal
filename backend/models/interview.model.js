const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  round: { type: String, enum: ['hr', 'technical', 'final', 'other'], default: 'other' },
  scheduledAt: { type: Date, required: true, index: true },
  durationMinutes: { type: Number, min: 15, max: 480, default: 30 },
  mode: { type: String, enum: ['online', 'in_person'], required: true },
  meetingUrl: { type: String, maxlength: 1000, default: '' },
  location: { type: String, maxlength: 500, default: '' },
  notes: { type: String, maxlength: 3000, default: '' },
  status: { type: String, enum: ['scheduled', 'confirmed', 'reschedule_requested', 'declined', 'cancelled', 'completed'], default: 'scheduled', index: true },
  candidateResponseNote: { type: String, maxlength: 1000, default: '' },
  statusHistory: [{ status: String, actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, note: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

interviewSchema.index({ applicant: 1, scheduledAt: 1 });
interviewSchema.index({ job: 1, scheduledAt: 1 });
module.exports = mongoose.model('Interview', interviewSchema);
