import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Appointment = () => {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    specialty: '',
    doctor: ''
  });
  const [success, setSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/doctors');
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.date || !formData.time || !formData.doctor) {
      alert('Please fill in all the details and select a doctor.');
      return;
    }

    try {
      // Call Backend API
      await axios.post('http://127.0.0.1:5000/api/appointment', formData);

      // Save to localStorage
      const appointments = JSON.parse(localStorage.getItem('nabhacure_appointments') || '[]');
      appointments.push({ ...formData, id: Date.now() });
      localStorage.setItem('nabhacure_appointments', JSON.stringify(appointments));

      setSuccess(true);
      setFormData({ name: '', phone: '', date: '', time: '', specialty: '', doctor: '' });
      setSelectedDoctor(null);
      alert(t.confirmed);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to connect to backend.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'doctor') {
      const doc = doctors.find(d => d.name === value);
      setSelectedDoctor(doc);
    }
  };

  return (
    <div className="card">
      <h2>{t.book_title}</h2>
      <p>{t.book_desc}</p>
      
      {success ? (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '2px solid #2e7d32', borderRadius: '8px', color: '#2e7d32' }}>
          <h3>{t.confirmed}</h3>
          <p>{t.confirmed_desc}</p>
          <button onClick={() => setSuccess(false)} style={{ backgroundColor: '#ffffff', color: '#2e7d32', border: '1px solid #2e7d32' }}>
            {t.book_another}
          </button>
        </div>
      ) : (
        <>
          <div className="doctor-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px', textAlign: 'left' }}>
            {doctors.map((doctor, index) => (
              <div 
                key={index} 
                className={`doctor-card ${formData.doctor === doctor.name ? 'selected' : ''}`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, doctor: doctor.name, specialty: doctor.specialization }));
                  setSelectedDoctor(doctor);
                }}
                style={{
                  padding: '15px',
                  border: formData.doctor === doctor.name ? '2px solid #2e7d32' : '1px solid #ddd',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: formData.doctor === doctor.name ? '#f1f8e9' : '#fff',
                  transition: 'all 0.3s ease'
                }}
              >
                <img src={doctor.image} alt={doctor.name} style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px' }} />
                <h4 style={{ margin: '5px 0' }}>{doctor.name}</h4>
                <p style={{ margin: '3px 0', fontSize: '0.9rem', color: '#666' }}><strong>{t.specialization}</strong> {doctor.specialization}</p>
                <p style={{ margin: '3px 0', fontSize: '0.9rem', color: '#2e7d32', fontWeight: 'bold' }}><strong>{t.appointment_fee}</strong> ₹{doctor.appointmentFee}</p>
                <p style={{ margin: '3px 0', fontSize: '0.85rem', color: '#ff9800' }}><strong>{t.available_time}</strong> {doctor.availableTime}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t.select_doctor}</label>
              <select name="doctor" value={formData.doctor} onChange={handleChange} required>
                <option value="">-- {t.select_doctor} --</option>
                {doctors.map((doc, idx) => (
                  <option key={idx} value={doc.name}>{doc.name} ({doc.specialization})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t.full_name}</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter your name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.phone_number}</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="Enter your phone number" 
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.pref_date}</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>{t.pref_time}</label>
              <input 
                type="time" 
                name="time" 
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '20px' }}>
              {t.book_my}
            </button>
            
            <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <p>{t.call_doctor}</p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Link to="/video-call">
                  <button type="button" style={{ backgroundColor: '#2196f3', color: 'white' }}>
                    📹 {t.join_call}
                  </button>
                </Link>
                <a href="tel:+911234567890">
                  <button type="button" style={{ backgroundColor: '#ff9800', color: 'white' }}>
                    📞 {t.audio_call}
                  </button>
                </a>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Appointment;
