import React, { useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = "3004cbdcbcf0421d86cec599166d45a3"; 
const CHANNEL = "architect_live";
const TOKEN = "007eJxTYKhp1jXz/5hnfWWDvzTTetnb5QY3AyY8u5DefEDryc8Kr3MKDMYGBibJSSnJSclpBiZGhikWZsmpyaaWloZmZikmponGd2ybMhsCGRkq/z1jZmSAQBCfjyGxKDkjsyQ1uSQ+J7MslYEBAPIjJUE=";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const AgoraMeeting = () => {
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('JOIN LIVE MEETING');
  const [localTracks, setLocalTracks] = useState([]); // Added to manage controls
  const [isMuted, setIsMuted] = useState(false);

  const startCall = async () => {
    try {
      setStatus('CONNECTING...');
      
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      let audioTrack, videoTrack;
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([audioTrack, videoTrack]); // Store tracks for controls
      } catch (deviceError) {
        console.error("Camera/Mic access denied or not found:", deviceError);
        setStatus('CAMERA NOT FOUND');
        await client.leave();
        return;
      }

      setJoined(true);
      setStatus('LIVE');

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

  // --- NEW CONTROL FUNCTIONS ---
  const toggleMute = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const endMeeting = async () => {
    localTracks.forEach(track => {
      track.stop();
      track.close();
    });
    await client.leave();
    setJoined(false);
    setStatus('JOIN LIVE MEETING');
    window.location.reload(); // Ensures hardware is fully released
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
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div id="local-player" style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'fixed', top: 0, left: 0 }}></div>
          
          {/* CONTROLS OVERLAY */}
          <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', zIndex: 999 }}>
            <button 
              onClick={toggleMute}
              style={{ backgroundColor: isMuted ? '#ef4444' : '#374151', color: 'white', padding: '12px 25px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            
            <button 
              onClick={endMeeting}
              style={{ backgroundColor: '#ef4444', color: 'white', padding: '12px 25px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              End Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgoraMeeting;