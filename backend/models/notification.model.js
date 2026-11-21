const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: { type: String, enum: ['application_received', 'application_status_changed', 'message_received', 'interview_updated'], required: true },
  title: { type: String, required: true, maxlength: 140 },
  body: { type: String, required: true, maxlength: 400 },
  link: { type: String, required: true, maxlength: 500 },
  resourceType: { type: String, enum: ['application', 'conversation', 'interview'], required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  eventKey: { type: String, required: true, unique: true, maxlength: 240 },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
