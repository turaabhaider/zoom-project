import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = "3004cbdcbcf0421d86cec599166d45a3"; 
const CHANNEL = "architect_live";
const TOKEN = "007eJxTYKhp1jXz/5hnfWWDvzTTetnb5QY3AyY8u5DefEDryc8Kr3MKDMYGBibJSSnJSclpBiZGhikWZsmpyaaWloZmZikmponGd2ybMhsCGRkq/z1jZmSAQBCfjyGxKDkjsyQ1uSQ+J7MslYEBAPIjJUE=";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const AgoraMeeting = () => {
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('JOIN LIVE MEETING');
  const [localTracks, setLocalTracks] = useState([]); // Stores [audio, video]
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const startCall = async () => {
    try {
      setStatus('REQUESTING CAMERA...');
      
      // 1. Create tracks FIRST to trigger browser permission popup
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks([audioTrack, videoTrack]);

      setStatus('CONNECTING...');
      
      // 2. Join the channel
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      // 3. Publish tracks so others can see/hear you
      await client.publish([audioTrack, videoTrack]);

      setJoined(true);
      setStatus('LIVE');

      // 4. Play the video locally
      videoTrack.play('local-player');

    } catch (error) {
      console.error("Join Failed:", error);
      if (error.code === 'PERMISSION_DENIED') {
        setStatus('PERMISSION DENIED');
      } else {
        setStatus('JOIN FAILED - RETRY');
      }
    }
  };

  const toggleMute = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(isMuted); // Enable/Disable audio
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(isCamOff); // Enable/Disable video
      setIsCamOff(!isCamOff);
    }
  };

  const leaveCall = async () => {
    // Stop and close all local tracks to release camera/mic
    localTracks.forEach(track => {
      track.stop();
      track.close();
    });
    
    await client.leave();
    setJoined(false);
    setStatus('JOIN LIVE MEETING');
    
    // Refresh to ensure all hardware is released
    window.location.reload();
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'fixed', top: 0, left: 0 }}>
      {!joined ? (
        <>
          <h1 style={{ fontWeight: 'bold', fontSize: '28px', marginBottom: '20px' }}>ARCHITECT STUDIO LIVE</h1>
          <button 
            onClick={startCall} 
            style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {status}
          </button>
        </>
      ) : (
        <>
          {/* Video Player Area */}
          <div id="local-player" style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>

          {/* Controls Overlay */}
          <div style={{ position: 'absolute', bottom: '50px', display: 'flex', gap: '20px', zIndex: 100 }}>
            {/* Mute/Unmute */}
            <button 
              onClick={toggleMute}
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: 'none', backgroundColor: isMuted ? '#ef4444' : '#374151', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {/* Camera On/Off */}
            <button 
              onClick={toggleCamera}
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: 'none', backgroundColor: isCamOff ? '#ef4444' : '#374151', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {isCamOff ? 'Cam On' : 'Cam Off'}
            </button>

            {/* End Meeting */}
            <button 
              onClick={leaveCall}
              style={{ width: '70px', height: '70px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
            >
              End
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AgoraMeeting;