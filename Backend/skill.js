// models/Skill.js
const { Schema, model } = require('mongoose');

const SkillSchema = new Schema({
  name     : { type: String, required: true },
  icon     : { type: String, required: true },   // emoji
  category : { type: String, default: 'language',
               enum: ['language','framework','database','tool','cloud'] },
  order    : { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Skill', SkillSchema);