import React from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  
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

  const startMeeting = () => {
    // FIX: Check if SDK is actually loaded
    if (!window.ZoomMtg) {
      alert("Zoom SDK is still loading or failed to load. Please refresh the page.");
      return;
    }

    const ZoomMtg = window.ZoomMtg;

    // Show the hidden Zoom container
    const meetingRoot = document.getElementById('zmmtg-root');
    if (meetingRoot) {
      meetingRoot.style.display = 'block';
    }

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201'; // Ensure this is a real ID
    const passWord = ''; 
    const userName = 'Architect Admin';
    const role = 0; 

    const signature = generateSignature(meetingNumber, role);

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true,
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: SDK_KEY,
          passWord: passWord,
          success: (res) => console.log('Zoom Joined'),
          error: (err) => {
            console.error('Join Error', err);
            if (meetingRoot) meetingRoot.style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error('Init Error', err);
        if (meetingRoot) meetingRoot.style.display = 'none';
      }
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white' }}>ARCHITECT STUDIO LIVE</h1>
      <button onClick={startMeeting} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 30px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '20px' }}>
        JOIN ZOOM MEETING
      </button>
    </div>
  );
};

export default ZoomMeeting;