// models/Project.js
const { Schema, model } = require('mongoose');

const ProjectSchema = new Schema({
  title       : { type: String, required: true },
  description : { type: String, required: true },
  tags        : { type: [String], default: [] },       // e.g. ['Python','ML','NLP']
  tagTheme    : { type: String, default: 'teal',
                  enum: ['teal','purple','coral'] },
  bannerEmoji : { type: String, default: '💻' },
  bannerColor : { type: String, default: 'banner-1',
                  enum: ['banner-1','banner-2','banner-3','banner-4'] },
  github      : { type: String },
  demo        : { type: String },
  featured    : { type: Boolean, default: false },
  order       : { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Project', ProjectSchema);