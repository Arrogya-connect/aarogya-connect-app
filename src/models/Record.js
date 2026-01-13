const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  gridFsId: mongoose.Schema.Types.ObjectId, // added
  mimeType: String,
  size: Number,
  kind: String,
}, { _id: false });

const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  queryNumber: { type: String, index: true },
  phone: { type: String }, 
  summary: { type: String },
  details: { type: String },
  attachments: [AttachmentSchema],
  status: { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Record', RecordSchema);