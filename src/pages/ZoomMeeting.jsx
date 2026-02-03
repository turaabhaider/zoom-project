import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [status, setStatus] = useState('JOIN ZOOM MEETING');

  const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: SDK_KEY, mn: meetingNumber, role: role, iat: iat, exp: exp, appKey: SDK_KEY, tokenExp: exp
    };
    return KJUR.jws.JWS.sign('HS256', JSON.stringify(oHeader), JSON.stringify(oPayload), SDK_SECRET);
  };

  const startMeeting = async () => {
    // 1. ROBUST RETRY LOOP (Fixes "SDK ERROR" on slow phones)
    if (!window.ZoomMtg) {
      setStatus('LOADING LIBRARIES...');
      let attempts = 0;
      while (!window.ZoomMtg && attempts < 10) {
        await new Promise(r => setTimeout(r, 500)); // Wait 0.5s
        attempts++;
      }
      if (!window.ZoomMtg) {
        setStatus('NETWORK TOO SLOW - RELOAD');
        return;
      }
    }

    setStatus('CONNECTING...');
    const ZoomMtg = window.ZoomMtg;
    
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    // 2. MOVE ZOOM TO FRONT (Fixes "Append" error)
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
        zoomRoot.style.zIndex = '9999';
        zoomRoot.style.opacity = '1';
    }

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true, 
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Mobile',
          sdkKey: SDK_KEY,
          passWord: '',
          success: () => setStatus('JOINED'),
          error: (err) => {
            console.error(err);
            setStatus('JOIN FAILED');
            // Move back to back if failed
            if (zoomRoot) { zoomRoot.style.zIndex = '-1'; zoomRoot.style.opacity = '0'; }
          }
        });
      },
      error: (err) => {
        console.error(err);
        setStatus('INIT ERROR');
        if (zoomRoot) { zoomRoot.style.zIndex = '-1'; zoomRoot.style.opacity = '0'; }
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>ARCHITECT STUDIO LIVE</h1>
      <button 
        onClick={startMeeting} 
        style={{ 
          backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', 
          borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '30px' 
        }}
      >
        {status}
      </button>
    </div>
  );
};

export default ZoomMeeting;