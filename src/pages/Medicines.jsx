import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

const Medicines = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineList, setMedicineList] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get stored location
    const storedLocation = localStorage.getItem('nabhacure_user_location');
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
    }

    const fetchMedicines = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/medicines');
        if (response.data.length > 0) {
          setMedicineList(response.data);
        } else {
          setMedicineList(fallbackMeds);
        }
      } catch (error) {
        console.error('Error fetching medicines:', error);
        setMedicineList(fallbackMeds);
      }
    };
    fetchMedicines();
  }, []);

  // Distance calculation (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d.toFixed(1);
  };

  const medicineWithDistance = medicineList.map(med => ({
    ...med,
    distance: userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, med.lat, med.lng) : null
  })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  const filteredMedicines = medicineWithDistance.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    med.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fallbackMeds = [
    { 
      id: 1, 
      name: 'Paracetamol', 
      type: 'Pain Reliever & Fever Reducer', 
      dosage: '500mg as needed', 
      location: 'Sector 17, Chandigarh',
      pharmacyName: 'City Medicos',
      lat: 30.7333,
      lng: 76.7794
    },
    { 
      id: 2, 
      name: 'Ibuprofen', 
      type: 'NSAID / Pain Relief', 
      dosage: '200-400mg every 4-6 hours', 
      location: 'Phase 7, Mohali',
      pharmacyName: 'Healthy Life Pharmacy',
      lat: 30.7046,
      lng: 76.7179
    },
    { 
      id: 3, 
      name: 'Amoxicillin', 
      type: 'Antibiotic (Prescription Only)', 
      dosage: 'As directed by doctor', 
      location: 'Panchkula, Haryana',
      pharmacyName: 'Life Care Chemist',
      lat: 30.6942,
      lng: 76.8606
    }
  ];

  return (
    <div className="card">
      <h2>{t.essential_meds}</h2>
      <p>{t.meds_desc}</p>
      
      <div className="form-group">
        <input 
          type="text" 
          placeholder={t.search_meds}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', marginBottom: '20px' }}
        />
      </div>

      <div style={{ textAlign: 'left' }}>
        {filteredMedicines.length > 0 ? (
          <ul>
            {filteredMedicines.map(med => (
              <li key={med.id} style={{ padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '5px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2em', color: '#000000' }}>{med.name}</span>
                  <span style={{ 
                    padding: '4px 10px', 
                    backgroundColor: '#ffffff', 
                    color: '#000000', 
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    fontSize: '0.8em',
                    fontWeight: 'bold'
                  }}>{med.type}</span>
                </div>
                <div style={{ color: '#000000', fontSize: '0.95em' }}>
                  <strong>{t.dosage}</strong> {med.dosage}
                </div>
                <div style={{ color: '#000000', fontSize: '0.95em' }}>
                  <strong>{t.pharmacy}</strong> {med.pharmacyName}
                </div>
                <div style={{ color: '#666', fontSize: '0.85em', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <span>📍 <strong>{t.location}</strong> {med.location}</span>
                  {med.distance && (
                    <span style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                      {med.distance} {t.km}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{t.no_results} for "{searchTerm}"</p>
        )}
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#ffffff', border: '1px solid #ccc', borderLeft: '5px solid #000000', borderRadius: '4px' }}>
        <p><strong>{t.note}</strong> {t.note_desc}</p>
      </div>
    </div>
  );
};

export default Medicines;
