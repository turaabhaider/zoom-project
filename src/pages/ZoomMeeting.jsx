import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [buttonText, setButtonText] = useState('JOIN ZOOM MEETING');

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
    setButtonText('CONNECTING...');

    // 1. SILENT RETRY LOOP: If script is missing, wait 1s and try again (up to 3 times)
    let attempts = 0;
    while (!window.ZoomMtg && attempts < 3) {
      console.log("Script missing, retrying...");
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }

    if (!window.ZoomMtg) {
      // If still missing, just log it. DO NOT SHOW ALERT.
      console.error("Zoom Library Failed to Load");
      setButtonText('NETWORK ERROR - REFRESH');
      return;
    }

    // 2. FORCE VISIBILITY (Mobile Fix)
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.display = 'block';
      zoomRoot.style.zIndex = '2147483647'; // Max integer z-index
    }

    const ZoomMtg = window.ZoomMtg;
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    ZoomMtg.init({
      leaveUrl: window.location.href,
      patchJsMedia: true,
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Mobile',
          sdkKey: SDK_KEY,
          passWord: '',
          success: () => console.log('Joined'),
          error: (err) => {
            console.error(err);
            // Silent fail - just reset button
            setButtonText('TRY AGAIN');
            if (zoomRoot) zoomRoot.style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error(err);
        setButtonText('TRY AGAIN');
        if (zoomRoot) zoomRoot.style.display = 'none';
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white', marginBottom: '30px' }}>ARCHITECT STUDIO LIVE</h1>
      
      {/* BUTTON IS INSTANTLY CLICKABLE */}
      <button 
        onClick={startMeeting} 
        style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '15px 40px', 
          borderRadius: '8px', 
          border: 'none', 
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer' 
        }}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ZoomMeeting;