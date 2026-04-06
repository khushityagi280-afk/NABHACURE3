const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  dosage: { type: String, required: true },
  location: { type: String, default: 'In Stock' },
  pharmacyName: { type: String, default: 'Local Pharmacy' },
  lat: { type: Number },
  lng: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medicine', medicineSchema);
