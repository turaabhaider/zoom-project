import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  // No more "waiting" state. We let the user click immediately.
  const [status, setStatus] = useState('JOIN ZOOM MEETING');

  const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: SDK_KEY,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      appKey: SDK_KEY,
      tokenExp: exp
    };
    return KJUR.jws.JWS.sign('HS256', JSON.stringify(oHeader), JSON.stringify(oPayload), SDK_SECRET);
  };

  const startMeeting = () => {
    setStatus('CONNECTING...');

    // 1. Check if Zoom script is loaded
    if (!window.ZoomMtg) {
      alert("Zoom script missing! Please refresh the page.");
      setStatus('JOIN ZOOM MEETING');
      return;
    }

    // 2. FORCE THE ZOOM CONTAINER TO FRONT
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.display = 'block';
      zoomRoot.style.zIndex = '999999'; // Force on top
    }

    const ZoomMtg = window.ZoomMtg;
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    // 3. FIXED INIT (Solves "Init invalid parameter" error)
    ZoomMtg.init({
      leaveUrl: window.location.href, // Must be full URL
      patchJsMedia: true,             // Required for mobile
      isSupportAV: true,              // Required for video
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Mobile',
          sdkKey: SDK_KEY,
          passWord: '', 
          success: (res) => {
            console.log('Join Success');
          },
          error: (err) => {
            console.error(err);
            alert("Join Error: " + JSON.stringify(err));
            setStatus('JOIN ZOOM MEETING');
          }
        });
      },
      error: (err) => {
        console.error("Init Error", err);
        // If Init fails, hide the black box so user sees the app again
        if (zoomRoot) zoomRoot.style.display = 'none';
        setStatus('TRY AGAIN');
      }
    });
  };

  return (
    <div style={{ 
      backgroundColor: '#0a0a0c', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <h1 style={{ color: 'white' }}>ARCHITECT STUDIO LIVE</h1>
      
      {/* BUTTON IS ALWAYS CLICKABLE NOW */}
      <button 
        onClick={startMeeting} 
        style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '15px 40px', 
          borderRadius: '8px', 
          border: 'none', 
          fontSize: '18px',
          cursor: 'pointer',
          marginTop: '20px' 
        }}
      >
        {status}
      </button>
    </div>
  );
};

export default ZoomMeeting;