import React, { useState } from 'react';
import { KJUR } from 'jsrsasign';

const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';

const ZoomMeeting = () => {
  const [btnText, setBtnText] = useState('JOIN ZOOM MEETING');

  const generateSignature = (meetingNumber, role) => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: SDK_KEY, mn: meetingNumber, role: role, iat: iat, exp: exp, appKey: SDK_KEY, tokenExp: exp
    };
    return KJUR.jws.JWS.sign('HS256', JSON.stringify(oHeader), JSON.stringify(oPayload), SDK_SECRET);
  };

  const startMeeting = () => {
    if (!window.ZoomMtg) {
      setBtnStatus('SDK LOADING... TRY AGAIN');
      return;
    }

    setBtnText('CONNECTING...');
    const ZoomMtg = window.ZoomMtg;
    
    // Fix for "Init invalid parameter"
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    const meetingNumber = '8145639201';
    const signature = generateSignature(meetingNumber, 0);

    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
      leaveUrl: window.location.origin,
      patchJsMedia: true, // Crucial for mobile video/audio
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: 'Architect Admin',
          sdkKey: SDK_KEY,
          passWord: '',
          success: () => setBtnText('JOINED'),
          error: (err) => {
            console.error(err);
            setBtnText('JOIN FAILED');
            document.getElementById('zmmtg-root').style.display = 'none';
          }
        });
      },
      error: (err) => {
        console.error(err);
        setBtnText('INIT ERROR');
        document.getElementById('zmmtg-root').style.display = 'none';
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
          borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' 
        }}
      >
        {btnText}
      </button>
    </div>
  );
};

export default ZoomMeeting;