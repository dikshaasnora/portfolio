// routes/education.js
const express   = require('express');
const router    = express.Router();
const Education = require('../models/Education');

// GET  /api/education  — sorted newest first
router.get('/', async (_req, res, next) => {
  try {
    const education = await Education.find().sort({ order: 1 }).lean();
    res.json(education);
  } catch (err) { next(err); }
});

// POST /api/education
router.post('/', async (req, res, next) => {
  try {
    const entry = await Education.create(req.body);
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

// PUT  /api/education/:id
router.put('/:id', async (req, res, next) => {
  try {
    const entry = await Education.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!entry) return res.status(404).json({ error: 'Education entry not found' });
    res.json(entry);
  } catch (err) { next(err); }
});

// DELETE /api/education/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education entry deleted' });
  } catch (err) { next(err); }
});

module.exports = router;