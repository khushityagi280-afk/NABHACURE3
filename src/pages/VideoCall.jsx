import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const VideoCall = () => {
  const jitsiContainerRef = useRef(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Jitsi script dynamically
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      const domain = 'meet.jit.si';
      const options = {
        roomName: 'NabhaCure_Consultation_' + Math.random().toString(36).substring(7),
        width: '100%',
        height: 600,
        parentNode: jitsiContainerRef.current,
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fms', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        },
      };
      const api = new window.JitsiMeetExternalAPI(domain, options);
      
      api.addEventListener('videoConferenceLeft', () => {
        navigate('/');
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  return (
    <div className="card fade-in" style={{ padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0 }}>{t.call_doctor}</h2>
        <button 
          onClick={() => navigate('/')} 
          style={{ backgroundColor: '#f44336', color: 'white', padding: '8px 15px', fontSize: '14px' }}
        >
          {t.end_call}
        </button>
      </div>
      <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '8px', marginBottom: '15px', color: '#2e7d32' }}>
        <strong>✅ {t.doctor_waiting}</strong>
      </div>
      <div ref={jitsiContainerRef} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}></div>
    </div>
  );
};

export default VideoCall;
