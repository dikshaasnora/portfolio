// routes/contact.js  —  POST /api/contact
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const nodemailer = require('nodemailer');
const Contact    = require('../models/Contact');

// Strict rate limit just for the contact form (5 per hour per IP)
const contactLimiter = rateLimit({
  windowMs : 60 * 60 * 1000,
  max      : 5,
  message  : { error: 'Too many messages sent. Please wait an hour.' },
});

// Simple email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // ── Validation ───────────────────────────────────────────
    if (!name || !email || !message)
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });
    if (message.length > 2000)
      return res.status(400).json({ error: 'Message too long (max 2000 chars).' });

    // ── Save to DB ───────────────────────────────────────────
    await Contact.create({
      name, email, subject, message,
      ip: req.ip,
    });

    // ── Send email notification (if credentials configured) ──
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from    : `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to      : process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject : `[Portfolio] ${subject || 'New message'} — from ${name}`,
        html    : `
          <h2>New portfolio contact</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject || '—'}</p>
          <hr/>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      });
    }

    res.status(201).json({ message: 'Message received! Diksha will get back to you soon.' });
  } catch (err) { next(err); }
});

// GET /api/contact  — retrieve all messages (admin use)
router.get('/', async (_req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) { next(err); }
});

module.exports = router;