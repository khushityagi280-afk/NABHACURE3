const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  appointmentFee: { type: Number, required: true },
  availableTime: { type: String, required: true },
  image: { type: String, default: 'https://via.placeholder.com/150' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
