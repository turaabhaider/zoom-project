import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Credentials updated with your NEW token
const APP_ID = "3004cbdcbcf0421d86cec599166d45a3"; 
const CHANNEL = "architect_live";
const TOKEN = "007eJxTYKhp1jXz/5hnfWWDvzTTetnb5QY3AyY8u5DefEDryc8Kr3MKDMYGBibJSSnJSclpBiZGhikWZsmpyaaWloZmZikmponGd2ybMhsCGRkq/z1jZmSAQBCfjyGxKDkjsyQ1uSQ+J7MslYEBAPIjJUE=";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const AgoraMeeting = () => {
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('JOIN LIVE MEETING');

  const startCall = async () => {
    try {
      setStatus('CONNECTING...');
      
      // Use 0 for UID to match the token's security requirement
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      // Request Camera/Mic permission only after click
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      setJoined(true);
      setStatus('LIVE');

      // Immediate video playback logic
      setTimeout(() => {
        const playerDiv = document.getElementById('local-player');
        if (playerDiv) {
          videoTrack.play(playerDiv);
        }
      }, 200);

      await client.publish([audioTrack, videoTrack]);

    } catch (error) {
      console.error("Agora Join Failed:", error);
      // If you see 'invalid token', ensure the channel name is exactly 'architect_live'
      setStatus('JOIN FAILED - RETRY');
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      {!joined ? (
        <>
          <h1 style={{ fontWeight: 'bold', fontSize: '24px' }}>ARCHITECT STUDIO LIVE</h1>
          <button 
            onClick={startCall} 
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
          >
            {status}
          </button>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div id="local-player" style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>
          <button 
            onClick={() => window.location.reload()}
            style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '30px', fontWeight: 'bold', zIndex: 10 }}
          >
            END STREAM
          </button>
        </div>
      )}
    </div>
  );
};

export default AgoraMeeting;