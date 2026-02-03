import React, { useState, useEffect } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkZoom = setInterval(() => {
      if (window.ZoomMtg) {
        setIsReady(true);
        clearInterval(checkZoom);
      }
    }, 1000);
    return () => clearInterval(checkZoom);
  }, []);

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
    if (!isReady) return;

    // 1. MOBILE FIX: Force permission popup so the browser "wakes up"
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop it immediately, Zoom will take over
    } catch (err) {
      console.log("Permission denied or already handled.");
    }

    // 2. SHOW THE HIDDEN CONTAINER
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';

    const ZoomMtg = window.ZoomMtg;
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

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
          success: (res) => console.log('Joined!'),
          error: (err) => {
            console.error(err);
            if (zoomRoot) zoomRoot.style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error(err);
        if (zoomRoot) zoomRoot.style.display = 'none';
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white' }}>ARCHITECT STUDIO LIVE</h1>
      <button 
        onClick={startMeeting} 
        disabled={!isReady}
        style={{ 
          backgroundColor: isReady ? '#2563eb' : '#333', 
          color: 'white', padding: '15px 35px', borderRadius: '8px', 
          border: 'none', cursor: isReady ? 'pointer' : 'wait', marginTop: '20px' 
        }}
      >
        {isReady ? 'JOIN ZOOM MEETING' : 'PREPARING...'}
      </button>
    </div>
  );
};

export default ZoomMeeting;