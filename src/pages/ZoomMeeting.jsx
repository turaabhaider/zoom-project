import React from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg'; // Verified
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR'; // Verified

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
    // Access Zoom from the global window object to bypass Vite C$1 error
    const ZoomMtg = window.ZoomMtg;

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201'; // Replace with a REAL meeting ID from your Zoom dashboard
    const passWord = ''; // Replace with meeting passcode if set
    const userName = 'Architect Admin';
    const role = 0; 

    const signature = generateSignature(meetingNumber, role);

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: SDK_KEY,
          passWord: passWord,
          success: (res) => console.log('Zoom Join Success'),
          error: (err) => console.error('Zoom Join Error', err)
        });
      },
      error: (err) => console.error('Zoom Init Error', err)
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white' }}>ARCHITECT STUDIO LIVE</h1>
      <button onClick={startMeeting} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 30px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginTop: '20px' }}>
        JOIN ZOOM MEETING
      </button>
      <div id="zmmtg-root"></div>
    </div>
  );
};

export default ZoomMeeting;