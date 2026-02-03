import React, { useEffect } from 'react';
import { KJUR } from 'jsrsasign'; // You may need: npm install jsrsasign

const CLIENT_ID = '07JZ0mQXRz2Yi0RNRgO4cg'; // From General app 275
const CLIENT_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  
  const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };

    const oPayload = {
      sdkKey: CLIENT_ID,
      mn: meetingNumber,
      role: role,
      iat: iat,
      exp: exp,
      appKey: CLIENT_ID,
      tokenExp: iat + 60 * 60 * 2
    };

    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    return KJUR.jws.JWS.sign('HS256', sHeader, sPayload, CLIENT_SECRET);
  };

  const startMeeting = async () => {
    const { ZoomMtg } = await import('@zoomus/websdk');

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '1234567890'; // Replace with a real meeting ID from your Zoom account
    const passWord = ''; // Meeting passcode
    const userName = 'Architect Studio';
    const role = 0; // 0 for participant, 1 for host

    const signature = generateSignature(meetingNumber, role);

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      success: (success) => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: CLIENT_ID,
          passWord: passWord,
          success: (res) => console.log('Join Success', res),
          error: (err) => console.error('Join Error', err)
        });
      },
      error: (err) => console.error('Init Error', err)
    });
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>ARCHITECT STUDIO LIVE</h1>
      <button 
        onClick={startMeeting}
        style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '12px', fontSize: '18px', border: 'none', cursor: 'pointer' }}
      >
        JOIN ZOOM MEETING
      </button>
      <div id="zmmtg-root"></div> {/* Required for Zoom UI */}
    </div>
  );
};

export default ZoomMeeting;