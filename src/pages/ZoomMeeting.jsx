import React, { useState, useEffect } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [isZoomReady, setIsZoomReady] = useState(false);

  // 1. SILENT WATCHER: Removes the "Wait 5 seconds" alert. 
  // The button stays grey until the SDK is fully loaded in the background.
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (window.ZoomMtg) {
        setIsZoomReady(true);
        clearInterval(checkInterval);
        console.log("Zoom SDK is ready.");
      }
    }, 1000);
    return () => clearInterval(checkInterval);
  }, []);

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
      tokenExp: iat + 60 * 60 * 2
    };
    return KJUR.jws.JWS.sign('HS256', JSON.stringify(oHeader), JSON.stringify(oPayload), SDK_SECRET);
  };

  const startMeeting = async () => {
    if (!isZoomReady) return;

    // 2. WAKE UP CAMERA: Forces mobile browsers to ask for permission immediately
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
      console.log("Permissions check finished.");
    }

    // 3. FORCE VISIBILITY: Show the container before Zoom starts
    const zoomRoot = document.getElementById('zmmtg-root');
    if (zoomRoot) {
      zoomRoot.style.display = 'block';
    }

    const ZoomMtg = window.ZoomMtg;
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true, // Fixes mobile audio/video
      disableJoinAudioVideoUI: false,
      isSupportMobileWeb: true, // Specific for mobile browsers
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Admin',
          sdkKey: SDK_KEY,
          passWord: '', // Empty if no password
          success: (res) => console.log('Successfully Joined'),
          error: (err) => {
            console.error("Join Error:", err);
            if (zoomRoot) zoomRoot.style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error("Init Error:", err);
        if (zoomRoot) zoomRoot.style.display = 'none';
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
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ letterSpacing: '2px', fontWeight: 'bold' }}>ARCHITECT STUDIO LIVE</h1>
      <p style={{ color: '#888', marginBottom: '20px' }}>
        {isZoomReady ? 'System Ready' : 'Initializing Secure Connection...'}
      </p>

      <button 
        onClick={startMeeting} 
        disabled={!isZoomReady}
        style={{ 
          backgroundColor: isZoomReady ? '#2563eb' : '#333', 
          color: 'white', 
          padding: '15px 40px', 
          borderRadius: '10px', 
          border: 'none', 
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isZoomReady ? 'pointer' : 'wait',
          transition: 'all 0.3s ease'
        }}
      >
        {isZoomReady ? 'JOIN ZOOM MEETING' : 'LOADING...'}
      </button>
    </div>
  );
};

export default ZoomMeeting;