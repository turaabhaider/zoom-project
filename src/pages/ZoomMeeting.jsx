import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [status, setStatus] = useState('JOIN ZOOM MEETING');

  const startMeeting = async () => {
    setStatus('LOADING...');

    // Silent wait loop replaces the alert
    let waitCount = 0;
    while (!window.ZoomMtg && waitCount < 10) {
      await new Promise(r => setTimeout(r, 300));
      waitCount++;
    }

    if (!window.ZoomMtg) {
      setStatus('NETWORK ERROR');
      return;
    }

    const ZoomMtg = window.ZoomMtg;
    
    // Fix for 'undefined' error
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    
    // Signature Generation
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const signature = KJUR.jws.JWS.sign('HS256', 
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }), 
      JSON.stringify({ sdkKey: SDK_KEY, mn: meetingNumber, role: 0, iat, exp, appKey: SDK_KEY, tokenExp: exp }), 
      SDK_SECRET
    );

    // Make Zoom visible immediately
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.zIndex = '999999';
      zoomRoot.style.opacity = '1';
    }

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true, 
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Admin',
          sdkKey: SDK_KEY,
          passWord: '',
          success: () => setStatus('SUCCESS'),
          error: (e) => {
            console.error(e);
            setStatus('JOIN FAILED');
          }
        });
      },
      error: (e) => {
        console.error(e);
        setStatus('INIT ERROR');
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white', fontWeight: 'bold' }}>ARCHITECT STUDIO LIVE</h1>
      <button 
        onClick={startMeeting} 
        style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', marginTop: '30px' }}
      >
        {status}
      </button>
    </div>
  );
};

export default ZoomMeeting;