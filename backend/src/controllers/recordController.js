// backend/src/controllers/recordController.js
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = require('mongodb');
const Record = require('../models/Record');

function getBucket() {
  const db = mongoose.connection.db;
  return new GridFSBucket(db, { bucketName: 'uploads' });
}

async function listRecords(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const userId = req.user._id;
    const [items, total] = await Promise.all([
      Record.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Record.countDocuments({ userId }),
    ]);

    const data = items.map((it) => ({
      _id: it._id,
      summary: it.summary,
      queryNumber: it.queryNumber || null,
      phone: it.phone, // Added
      details: it.details, // Added just in case
      status: it.status,
      doctorResponse: it.doctorResponse, // Added
      doctorName: it.doctorName, // Added
      doctorDetails: it.doctorDetails, // Added
      createdAt: it.createdAt,
      attachmentPreview: it.attachments && it.attachments.length ? it.attachments[0] : null,
      attachments: it.attachments, // Added to ensure full attachment list if needed by UI
    }));

    return res.json({ ok: true, data, meta: { total, page, limit } });
  } catch (err) {
    console.error('listRecords error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

async function getRecord(req, res) {
  try {
    const rec = await Record.findById(req.params.id).lean();
    if (!rec) return res.status(404).json({ ok: false, error: 'not found' });
    if (String(rec.userId) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }
    return res.json({ ok: true, data: rec });
  } catch (err) {
    console.error('getRecord error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

// Create a new record and save attachments to GridFS
async function createRecord(req, res) {
  try {
    const userId = req.user._id;
    const summary = req.body.summary || '';
    const details = req.body.details || '';
    const queryNumber = req.body.queryNumber || null;
    const phoneRaw = req.body.phone || '';
    const phone = (phoneRaw || '').toString().replace(/\D/g, '');

    const files = req.files || [];
    const attachments = [];

    const bucket = getBucket();

    // Upload files to GridFS sequentially to avoid too many concurrent promises.
    for (const f of files) {
      const filename = f.originalname || `file-${Date.now()}`;
      // open upload stream
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: f.mimetype,
        metadata: { uploadedBy: String(userId), fieldname: f.fieldname },
      });

      // write buffer to stream
      await new Promise((resolve, reject) => {
        uploadStream.end(f.buffer, (err, file) => {
          if (err) return reject(err);
          // file is the file document object with _id, length, filename, etc.
          attachments.push({
            filename: file.filename,
            gridFsId: file._id,       // store GridFS ObjectId
            mimeType: file.contentType || f.mimetype,
            size: file.length || f.size,
            kind: (f.mimetype || '').startsWith('image') ? 'image' :
              (f.mimetype || '').startsWith('video') ? 'video' :
                (f.mimetype || '').startsWith('audio') ? 'audio' : 'file',
          });
          resolve();
        });
      });
    }

    const rec = new Record({
      userId,
      queryNumber,
      phone,
      summary,
      details,
      attachments,
      status: 'pending',
    });

    await rec.save();

    return res.status(201).json({ ok: true, record: { id: rec._id, queryNumber: rec.queryNumber, status: rec.status } });
  } catch (err) {
    console.error('createRecord (GridFS) error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

// Stream a specific attachment by index from GridFS (protected route)
async function streamAttachment(req, res) {
  try {
    const { id, idx } = req.params; // id = record id, idx = attachment index
    const rec = await Record.findById(id).lean();
    if (!rec) return res.status(404).json({ ok: false, error: 'record not found' });

    // authorization: only owner or certain roles; for now allow owner
    if (String(rec.userId) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const index = Number(idx);
    if (!rec.attachments || index < 0 || index >= rec.attachments.length) {
      return res.status(404).json({ ok: false, error: 'attachment not found' });
    }

    const att = rec.attachments[index];
    if (!att.gridFsId) return res.status(404).json({ ok: false, error: 'attachment not available' });

    const bucket = getBucket();
    const fileId = typeof att.gridFsId === 'string' ? new ObjectId(att.gridFsId) : att.gridFsId;

    const downloadStream = bucket.openDownloadStream(fileId);

    res.setHeader('Content-Type', att.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${att.filename || 'file'}"`);

    downloadStream.on('error', (err) => {
      console.error('GridFS download error', err);
      res.status(500).end();
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('streamAttachment error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = { listRecords, getRecord, createRecord, streamAttachment };