const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  symptoms: { type: String, required: true },
  language: { type: String, required: true },
  urgency: { type: String, required: true },
  advice: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Symptom', symptomSchema);
