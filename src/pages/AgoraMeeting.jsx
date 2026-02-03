import React, { useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

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
      
      // 1. Join the channel first
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      // 2. Try to create tracks with error handling for 'Device Not Found'
      let audioTrack, videoTrack;
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      } catch (deviceError) {
        console.error("Camera/Mic access denied or not found:", deviceError);
        setStatus('CAMERA NOT FOUND');
        await client.leave();
        return;
      }

      setJoined(true);
      setStatus('LIVE');

      // 3. Play and Publish
      setTimeout(() => {
        const playerDiv = document.getElementById('local-player');
        if (playerDiv) videoTrack.play(playerDiv);
      }, 200);

      await client.publish([audioTrack, videoTrack]);

    } catch (error) {
      console.error("Join Failed:", error);
      setStatus('JOIN FAILED - RETRY');
    }
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      {!joined ? (
        <>
          <h1 style={{ fontWeight: 'bold' }}>ARCHITECT STUDIO LIVE</h1>
          <button 
            onClick={startCall} 
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
          >
            {status}
          </button>
        </>
      ) : (
        <div id="local-player" style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'fixed', top: 0, left: 0 }}></div>
      )}
    </div>
  );
};

export default AgoraMeeting;