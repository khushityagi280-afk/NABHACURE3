import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

const Home = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [recognition, setRecognition] = useState(null);
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Request location permission on load
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('nabhacure_user_location', JSON.stringify({ latitude, longitude }));
          console.log('Location access granted:', latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    }
  }, []);

  const performAnalysis = async (symptomsToAnalyze) => {
    if (!symptomsToAnalyze.trim()) {
      alert(language === 'Hindi' ? 'कृपया अपने लक्षण दर्ज करें।' : language === 'Punjabi' ? 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲੱਛਣ ਦਰਜ ਕਰੋ।' : 'Please enter your symptoms.');
      return;
    }

    setLoading(true);

    try {
      // Call Backend API
      const response = await axios.post('http://127.0.0.1:5000/api/analyze', {
        symptoms: symptomsToAnalyze,
        language
      });

      const analysis = response.data;

      // Small delay for smooth transition
      setTimeout(() => {
        localStorage.setItem('nabhacure_last_result', JSON.stringify(analysis));
        
        const history = JSON.parse(localStorage.getItem('nabhacure_history') || '[]');
        history.push(analysis);
        localStorage.setItem('nabhacure_history', JSON.stringify(history));

        navigate('/result');
      }, 800);
    } catch (error) {
      setLoading(false);
      console.error('Error analyzing symptoms:', error);
      if (error.response && error.response.status === 5000) {
        alert('Backend Error (Code: 5000). Please check server logs.');
      } else {
        alert('Failed to connect to backend. Please make sure the server is running.');
      }
    }
  };

  const handleVoiceInput = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const msg = language === 'Hindi' ? 
        'आपके ब्राउज़र में स्पीच रिकग्निशन (Speech Recognition) समर्थित नहीं है। कृपया Google Chrome का उपयोग करें।' : 
        'Speech Recognition is not supported in your browser. Please use Google Chrome.';
      setVoiceError(msg);
      alert(msg);
      return;
    }

    if (isListening || loading) return; 

    setVoiceError('');
    setSymptoms('');
    
    try {
      // Test if microphone is accessible at all
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'Hindi' ? 'hi-IN' : language === 'Punjabi' ? 'pa-IN' : 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started...');
      };

      recognitionInstance.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        if (fullTranscript) {
          setSymptoms(fullTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error event:', event.error);
        setIsListening(false);
        
        let errorMessage = `Voice input failed (${event.error}). Please try again.`;
        
        if (event.error === 'not-allowed') {
          errorMessage = language === 'Hindi' ? 'माइक्रोफ़ोन की अनुमति नहीं दी गई है।' : 
                         'Microphone permission denied.';
        } else if (event.error === 'no-speech') {
          errorMessage = language === 'Hindi' ? 'कोई आवाज़ नहीं सुनाई दी।' : 
                         'No speech detected.';
        } else if (event.error === 'network') {
          errorMessage = language === 'Hindi' ? 'नेटवर्क की समस्या है। कृपया Chrome इस्तेमाल करें।' : 
                         'Network error. Please use Chrome.';
        } else if (event.error === 'service-not-allowed') {
          errorMessage = 'Speech service not allowed. Try restarting your browser.';
        }
        
        setVoiceError(errorMessage);
        recognitionInstance.stop();
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended.');
        setIsListening(false);
      };

      recognitionInstance.start();
      setRecognition(recognitionInstance);
    } catch (e) {
      console.error('Microphone/Recognition error:', e);
      setIsListening(false);
      const msg = language === 'Hindi' ? 
        'माइक्रोफ़ोन एक्सेस नहीं मिला। कृपया ब्राउज़र में अनुमति दें।' : 
        'Microphone access denied. Please allow it in browser settings.';
      setVoiceError(msg);
    }
  };

  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      // Automatically analyze after stopping if there's text
      if (symptoms.trim()) {
        performAnalysis(symptoms);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performAnalysis(symptoms);
  };

  return (
    <div className={`card fade-in ${(loading || isListening) ? 'pulse' : ''}`}>
      <h1>{t.symptoms_checker}</h1>
      <p>{t.describe_symptoms}</p>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Analyzing your symptoms...</h3>
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
          <p>Please wait a moment while our AI processes your request.</p>
        </div>
      ) : isListening ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ color: '#f44336' }}>🎤 {language === 'Hindi' ? 'सुन रहा हूँ... कृपया बोलें' : language === 'Punjabi' ? 'ਸੁਣ ਰਿਹਾ ਹਾਂ... ਕਿਰਪਾ ਕਰਕੇ ਬੋਲੋ' : 'Listening... Please speak'}</h3>
          
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px', 
            borderRadius: '10px', 
            margin: '20px 0', 
            minHeight: '100px',
            border: '1px dashed #ccc',
            textAlign: 'left',
            fontSize: '1.1rem'
          }}>
            {symptoms || (language === 'Hindi' ? 'जो आप बोलेंगे यहाँ दिखेगा...' : 'Your speech will appear here...')}
          </div>

          <div className="pulse" style={{ width: '60px', height: '60px', backgroundColor: '#f44336', borderRadius: '50%', margin: '20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '50%' }}></div>
          </div>
          
          <button 
            type="button" 
            onClick={stopVoiceInput}
            style={{ backgroundColor: '#4caf50', color: 'white', padding: '12px 30px', fontSize: '1.1rem', marginTop: '10px' }}
          >
            ✅ {language === 'Hindi' ? 'बोलना बंद करें और जांचें' : language === 'Punjabi' ? 'ਬੋਲਣਾ ਬੰਦ ਕਰੋ ਅਤੇ ਜਾਂਚੋ' : 'Stop & Analyze'}
          </button>
          
          <p style={{ marginTop: '15px', color: '#666' }}>Speak clearly into your microphone.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.select_language}</label>
            <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t.how_feeling}</label>
            <textarea 
              rows="6" 
              placeholder={t.placeholder_symptoms}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="voice-btn" onClick={handleVoiceInput}>
              🎤 {t.voice_input}
            </button>
            <button type="submit" className="submit-btn">
              {t.analyze}
            </button>
          </div>

          {voiceError && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #ef9a9a' }}>
              <strong>⚠️ {voiceError}</strong>
              <div style={{ marginTop: '5px' }}>
                <small>{language === 'Hindi' ? 'कृपया टाइप करके लक्षण बताएं।' : language === 'Punjabi' ? 'ਕਿਰਪਾ ਕਰਕੇ ਟਾਈਪ ਕਰਕੇ ਲੱਛਣ ਦੱਸੋ।' : 'Please type your symptoms instead.'}</small>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Home;
