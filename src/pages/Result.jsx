import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Result = () => {
  const [analysis, setAnalysis] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const lastResult = localStorage.getItem('nabhacure_last_result');
    if (lastResult) {
      setAnalysis(JSON.parse(lastResult));
    }
  }, []);

  if (!analysis) {
    return (
      <div className="card">
        <h2>{t.no_results}</h2>
        <p>Please go back to the Home page and submit your symptoms.</p>
        <Link to="/">{t.go_home}</Link>
      </div>
    );
  }

  return (
    <div className="card fade-in">
      <h2>{t.ai_results}</h2>
      <div style={{ textAlign: 'left', marginTop: '20px' }}>
        <p className="fade-in"><strong>{t.symptoms_provided}</strong> {analysis.symptoms}</p>
        <p className="fade-in"><strong>{t.lang_selected}</strong> {analysis.language}</p>
        
        <div className="fade-in" style={{ 
          padding: '15px', 
          backgroundColor: '#ffffff', 
          borderRadius: '8px',
          border: '1px solid #eee',
          borderLeft: `5px solid ${analysis.urgency === 'High' ? '#f44336' : '#4caf50'}`,
          margin: '20px 0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ color: analysis.urgency === 'High' ? '#f44336' : '#000000' }}>{t.urgency} {analysis.urgency}</h3>
          <p><strong>{t.advice}</strong> {analysis.advice}</p>
        </div>

        <p className="fade-in"><small>{t.analyzed_on} {analysis.date}</small></p>
        
        <div className="fade-in" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {analysis.urgency === 'High' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/video-call">
                <button style={{ backgroundColor: '#2196f3', color: 'white' }}>
                  📹 {t.join_call}
                </button>
              </Link>
              <a href="tel:+911234567890">
                <button style={{ backgroundColor: '#ff9800', color: 'white' }}>
                  📞 {t.audio_call}
                </button>
              </a>
            </div>
          )}
          <Link to="/appointment">
            <button className="submit-btn">{t.book_appointment}</button>
          </Link>
          <Link to="/medicines">
            <button style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc' }}>{t.view_medicines}</button>
          </Link>
          <Link to="/">
            <button style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc' }}>{t.start_new}</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Result;
