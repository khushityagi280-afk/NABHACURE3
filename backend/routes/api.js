const express = require('express');
const router = express.Router();
const controller = require('../controllers/mainController');

// Routes
router.get('/ping', (req, res) => res.json({ message: 'pong' }));
router.post('/analyze', controller.analyzeSymptoms);
router.post('/appointment', controller.bookAppointment);
router.get('/medicines', controller.getMedicines);
router.get('/doctors', controller.getDoctors);
router.post('/seed-medicines', controller.seedMedicines);
router.post('/seed-doctors', controller.seedDoctors);

module.exports = router;
