import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  // FIXED: Both names now match exactly to avoid ReferenceError
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
    // Check if Zoom is there, if not, wait 1.5s
    if (!window.ZoomMtg) {
      setStatus('LOADING SDK...');
      await new Promise(r => setTimeout(r, 1500));
      if (!window.ZoomMtg) {
        setStatus('SDK ERROR - REFRESH');
        return;
      }
    }

    setStatus('CONNECTING...');
    const ZoomMtg = window.ZoomMtg;
    
    // Fix for "Init invalid parameter"
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    // Make the Zoom window visible
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) zoomRoot.style.display = 'block';

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
          success: () => setStatus('JOINED'),
          error: (err) => {
            console.error(err);
            setStatus('JOIN FAILED');
            if (zoomRoot) zoomRoot.style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error(err);
        setStatus('RETRY JOIN');
        if (zoomRoot) zoomRoot.style.display = 'none';
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white', fontWeight: 'bold' }}>ARCHITECT STUDIO LIVE</h1>
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