// models/Profile.js
const { Schema, model } = require('mongoose');

const ProfileSchema = new Schema({
  name       : { type: String, required: true },
  tagline    : { type: String },
  bio        : { type: [String], required: true },   // array of paragraphs
  avatar     : { type: String },                      // URL or base64
  email      : { type: String, required: true },
  github     : { type: String },
  linkedin   : { type: String },
  resume     : { type: String },                      // PDF URL
  available  : { type: Boolean, default: true },
  stats      : {
    projects : { type: Number, default: 0 },
    cgpa     : { type: String, default: '—' },
    years    : { type: Number, default: 4 },
  },
}, { timestamps: true });

module.exports = model('Profile', ProfileSchema);