import React, { useState, useEffect } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [isZoomReady, setIsZoomReady] = useState(false);

  // 1. Silent watcher - replaces the alert error
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (window.ZoomMtg) {
        setIsZoomReady(true);
        clearInterval(checkInterval);
        console.log("Zoom SDK is now ready on mobile.");
      }
    }, 1000);
    return () => clearInterval(checkInterval);
  }, []);

  const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: SDK_KEY, mn: meetingNumber, role: role, iat: iat, exp: exp, appKey: SDK_KEY, tokenExp: iat + 60 * 60 * 2
    };
    return KJUR.jws.JWS.sign('HS256', JSON.stringify(oHeader), JSON.stringify(oPayload), SDK_SECRET);
  };

  const startMeeting = async () => {
    // If the library isn't ready yet, do nothing (button is disabled anyway)
    if (!isZoomReady) return;

    const ZoomMtg = window.ZoomMtg;
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true,
      disableJoinAudioVideoUI: false,
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Admin',
          sdkKey: SDK_KEY,
          passWord: '',
          success: (res) => console.log('Join Success'),
          error: (err) => console.error(err)
        });
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white' }}>ARCHITECT STUDIO LIVE</h1>
      
      <button 
        onClick={startMeeting} 
        disabled={!isZoomReady}
        style={{ 
          backgroundColor: isZoomReady ? '#2563eb' : '#444', 
          color: 'white', 
          padding: '12px 30px', 
          borderRadius: '8px', 
          border: 'none', 
          cursor: isZoomReady ? 'pointer' : 'wait', 
          marginTop: '20px' 
        }}
      >
        {isZoomReady ? 'JOIN ZOOM MEETING' : 'PREPARING SYSTEM...'}
      </button>
    </div>
  );
};

export default ZoomMeeting;