const Symptom = require('../models/Symptom');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');

// AI Analysis Logic
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms, language } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }

    let urgency = 'Medium';
    let advice = '';

    const lowerSymptoms = symptoms.toLowerCase();

    // Simple Rule-based AI Logic
    if (lowerSymptoms.includes('pain') || lowerSymptoms.includes('dard') || lowerSymptoms.includes('pira')) {
      urgency = 'High';
    } else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('bukhar') || lowerSymptoms.includes('taap')) {
      urgency = 'Medium';
    } else {
      urgency = 'Low';
    }

    // Advice based on language
    if (language === 'Hindi') {
      advice = urgency === 'High' 
        ? `कृपया तुरंत डॉक्टर से मिलें। आराम करें और खूब पानी पिएं।` 
        : `आराम करें और लक्षणों पर नज़र रखें। यदि स्थिति बिगड़ती है, तो डॉक्टर से परामर्श लें।`;
    } else if (language === 'Punjabi') {
      advice = urgency === 'High' 
        ? `ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਡਾਕਟਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ। ਆਰਾਮ ਕਰੋ ਅਤੇ ਬਹੁਤ ਸਾਰਾ ਪਾਣੀ ਪੀਓ।` 
        : `ਆਰਾਮ ਕਰੋ ਅਤੇ ਲੱਛਣਾਂ 'ਤੇ ਨਜ਼ਰ ਰੱਖੋ। ਜੇ ਸਥਿਤੀ ਵਿਗੜਦੀ ਹੈ, ਤਾਂ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।`;
    } else {
      advice = urgency === 'High' 
        ? `Please consult a doctor immediately. Rest and stay hydrated.` 
        : `Take rest and monitor your symptoms. If it gets worse, consult a physician.`;
    }

    const newAnalysis = {
      symptoms,
      language,
      urgency,
      advice,
      date: new Date().toLocaleString()
    };

    try {
      const savedSymptom = new Symptom(newAnalysis);
      await savedSymptom.save();
      res.json(savedSymptom);
    } catch (dbError) {
      console.error('Failed to save to MongoDB:', dbError.message);
      // Return the mock result anyway if DB fails
      res.json(newAnalysis);
    }
  } catch (error) {
    res.status(5000).json({ error: 'Analysis failed', details: error.message });
  }
};

// Appointment Booking
exports.bookAppointment = async (req, res) => {
  try {
    const { name, phone, date, time, specialty } = req.body;
    const newAppointment = { name, phone, date, time, specialty };
    
    try {
      const savedAppointment = new Appointment(newAppointment);
      await savedAppointment.save();
      res.json({ message: 'Appointment booked successfully', appointment: savedAppointment });
    } catch (dbError) {
      console.error('Failed to save appointment to MongoDB:', dbError.message);
      res.json({ message: 'Appointment booked (offline mode)', appointment: newAppointment });
    }
  } catch (error) {
    res.status(5000).json({ error: 'Booking failed', details: error.message });
  }
};

// Get Medicines
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    if (medicines.length === 0) throw new Error('No medicines found in DB');
    res.json(medicines);
  } catch (error) {
    console.error('Failed to fetch from DB, using fallback meds:', error.message);
    const fallbackMeds = [
      { 
        name: 'Paracetamol', 
        type: 'Pain Reliever & Fever Reducer', 
        dosage: '500mg as needed', 
        location: 'Sector 17, Chandigarh',
        pharmacyName: 'City Medicos',
        lat: 30.7333,
        lng: 76.7794
      },
      { 
        name: 'Ibuprofen', 
        type: 'NSAID / Pain Relief', 
        dosage: '200-400mg every 4-6 hours', 
        location: 'Phase 7, Mohali',
        pharmacyName: 'Healthy Life Pharmacy',
        lat: 30.7046,
        lng: 76.7179
      },
      { 
        name: 'Cetirizine', 
        type: 'Antihistamine / Allergy', 
        dosage: '10mg once daily', 
        location: 'Panchkula, Haryana',
        pharmacyName: 'Life Care Chemist',
        lat: 30.6942,
        lng: 76.8606
      }
    ];
    res.json(fallbackMeds);
  }
};

// Get Doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    if (doctors.length === 0) throw new Error('No doctors found in DB');
    res.json(doctors);
  } catch (error) {
    console.error('Failed to fetch from DB, using fallback doctors:', error.message);
    const fallbackDoctors = [
      { name: 'Dr. Sharma', specialization: 'General Physician', appointmentFee: 500, availableTime: '10:00 AM - 2:00 PM', image: 'https://via.placeholder.com/150' },
      { name: 'Dr. Kaur', specialization: 'Pediatrician', appointmentFee: 600, availableTime: '4:00 PM - 8:00 PM', image: 'https://via.placeholder.com/150' },
      { name: 'Dr. Gupta', specialization: 'Cardiologist', appointmentFee: 800, availableTime: '12:00 PM - 4:00 PM', image: 'https://via.placeholder.com/150' }
    ];
    res.json(fallbackDoctors);
  }
};

// Seed Doctors
exports.seedDoctors = async (req, res) => {
  try {
    const count = await Doctor.countDocuments();
    if (count > 0) return res.json({ message: 'Doctors already seeded' });

    const initialDoctors = [
      { name: 'Dr. Sharma', specialization: 'General Physician', appointmentFee: 500, availableTime: '10:00 AM - 2:00 PM' },
      { name: 'Dr. Kaur', specialization: 'Pediatrician', appointmentFee: 600, availableTime: '4:00 PM - 8:00 PM' },
      { name: 'Dr. Gupta', specialization: 'Cardiologist', appointmentFee: 800, availableTime: '12:00 PM - 4:00 PM' }
    ];

    await Doctor.insertMany(initialDoctors);
    res.json({ message: 'Doctors seeded successfully' });
  } catch (error) {
    res.status(5000).json({ error: 'Seeding failed', details: error.message });
  }
};

// Seed Medicines (Initial data)
exports.seedMedicines = async (req, res) => {
  try {
    const count = await Medicine.countDocuments();
    if (count > 0) return res.json({ message: 'Medicines already seeded' });

    const initialMeds = [
      { name: 'Paracetamol', type: 'Pain Reliever & Fever Reducer', dosage: '500mg as needed', location: 'Pharmacy A' },
      { name: 'Ibuprofen', type: 'NSAID / Pain Relief', dosage: '200-400mg every 4-6 hours', location: 'Pharmacy B' },
      { name: 'Cetirizine', type: 'Antihistamine / Allergy', dosage: '10mg once daily', location: 'Pharmacy A' }
    ];

    await Medicine.insertMany(initialMeds);
    res.json({ message: 'Medicines seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Seeding failed', details: error.message });
  }
};
