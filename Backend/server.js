// ─────────────────────────────────────────────────────────────
//  server.js  —  Diksha Portfolio API
//  Entry point: configures Express, middleware, routes, DB
// ─────────────────────────────────────────────────────────────
require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');

// ── Route imports ────────────────────────────────────────────
const projectRoutes  = require('./routes/projects');
const skillRoutes    = require('./routes/skills');
const educationRoutes= require('./routes/education');
const contactRoutes  = require('./routes/contact');
const profileRoutes  = require('./routes/profile');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ───────────────────────────────────────
connectDB();

// ── Security middleware ──────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin : process.env.FRONTEND_ORIGIN || '*',
  methods : ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// ── Global rate limiter (100 req / 15 min per IP) ────────────
app.use(rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 100,
  message  : { error: 'Too many requests — please try again later.' },
}));

// ── Body parser ──────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── API Routes ───────────────────────────────────────────────
app.use('/api/profile',   profileRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/skills',    skillRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/contact',   contactRoutes);

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () =>
  console.log(`\n🚀  Portfolio API running → http://localhost:${PORT}/api/health\n`)
);