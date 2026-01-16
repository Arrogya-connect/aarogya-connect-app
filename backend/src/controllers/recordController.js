// backend/src/controllers/recordController.js
const mongoose = require('mongoose');
const Record = require('../models/Record');

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
      phone: it.phone,
      details: it.details,
      status: it.status,
      doctorResponse: it.doctorResponse,
      doctorName: it.doctorName,
      doctorDetails: it.doctorDetails,
      createdAt: it.createdAt,
      attachmentPreview: it.attachments && it.attachments.length ? it.attachments[0] : null,
      attachments: it.attachments,
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

// Create a new record (JSON only, no multipart/GridFS)
async function createRecord(req, res) {
  try {
    console.log('createRecord request body:', req.body);

    const userId = req.user._id;
    const summary = req.body.summary || '';
    const details = req.body.details || '';
    const queryNumber = req.body.queryNumber || null;
    const phoneRaw = req.body.phone || '';
    const phone = (phoneRaw || '').toString().replace(/\D/g, '');
    const attachments = [];

    // Expecting "Direct Upload" attachments (Cloudinary URLs)
    if (req.body.attachments && Array.isArray(req.body.attachments)) {
      for (const att of req.body.attachments) {
        // att: { uri: "https://...", type: "image", name: "..." }
        if (att.uri) {
          attachments.push({
            filename: att.name || 'upload',
            gridFsId: att.uri, // Storing the Cloudinary URL here
            mimeType: att.type === 'video' ? 'video/mp4' : 'image/jpeg',
            size: 0,
            kind: (att.type || '').startsWith('video') ? 'video' : 'image',
          });
        }
      }
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
    console.error('createRecord error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

// Stream (Redirect) a specific attachment by index
async function streamAttachment(req, res) {
  try {
    const { id, idx } = req.params;
    const rec = await Record.findById(id).lean();
    if (!rec) return res.status(404).json({ ok: false, error: 'record not found' });

    if (String(rec.userId) !== String(req.user._id)) {
      return res.status(403).json({ ok: false, error: 'forbidden' });
    }

    const index = Number(idx);
    if (!rec.attachments || index < 0 || index >= rec.attachments.length) {
      return res.status(404).json({ ok: false, error: 'attachment not found' });
    }

    const att = rec.attachments[index];
    if (!att.gridFsId) return res.status(404).json({ ok: false, error: 'attachment not available' });

    // Handle Cloudinary / External URLs
    if (typeof att.gridFsId === 'string' && att.gridFsId.startsWith('http')) {
      return res.redirect(att.gridFsId);
    }

    // GridFS support removed. Old files are no longer accessible.
    return res.status(410).json({ ok: false, error: 'Legacy file storage not supported' });

  } catch (err) {
    console.error('streamAttachment error', err);
    return res.status(500).json({ ok: false, error: 'server error' });
  }
}

module.exports = { listRecords, getRecord, createRecord, streamAttachment };