import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = "3004cbdcbcf0421d86cec599166d45a3"; 
const CHANNEL = "architect_live";
const TOKEN = "007eJxTYKhp1jXz/5hnfWWDvzTTetnb5QY3AyY8u5DefEDryc8Kr3MKDMYGBibJSSnJSclpBiZGhikWZsmpyaaWloZmZikmponGd2ybMhsCGRkq/z1jZmSAQBCfjyGxKDkjsyQ1uSQ+J7MslYEBAPIjJUE=";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const AgoraMeeting = () => {
  const [joined, setJoined] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [status, setStatus] = useState('JOIN LIVE MEETING');

  const startCall = async () => {
    try {
      setStatus('CONNECTING...');
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      // Create tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setTracks([audioTrack, videoTrack]);

      setJoined(true);
      
      // Play locally
      videoTrack.play('local-player');
      
      // Publish to others
      await client.publish([audioTrack, videoTrack]);
    } catch (error) {
      console.error("Join Failed:", error);
      setStatus('DEVICE ERROR - CHECK PERMISSIONS'); // Handles
    }
  };

  const toggleMute = async () => {
    if (tracks[0]) {
      await tracks[0].setEnabled(isMuted); // Agora uses enabled/disabled for mute
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (tracks[1]) {
      await tracks[1].setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = async () => {
    tracks.forEach(track => {
      track.stop();
      track.close();
    });
    await client.leave();
    setJoined(false);
    setStatus('JOIN LIVE MEETING');
    window.location.reload(); // Hard reset to ensure hardware is released
  };

  return (
    <div style={{ backgroundColor: '#0a0a0c', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {!joined ? (
        <>
          <h1 style={{ fontWeight: 'bold' }}>ARCHITECT STUDIO LIVE</h1>
          <button onClick={startCall} style={{ backgroundColor: '#2563eb', color: 'white', padding: '15px 40px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>
            {status}
          </button>
        </>
      ) : (
        <>
          {/* Video Container */}
          <div id="local-player" style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>

          {/* Controls Overlay */}
          <div style={{ position: 'absolute', bottom: '40px', display: 'flex', gap: '20px', zIndex: 10 }}>
            {/* Mute Button */}
            <button onClick={toggleMute} style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', backgroundColor: isMuted ? '#ef4444' : '#374151', color: 'white', cursor: 'pointer' }}>
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            {/* Video Toggle Button */}
            <button onClick={toggleVideo} style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', backgroundColor: isVideoOff ? '#ef4444' : '#374151', color: 'white', cursor: 'pointer' }}>
              {isVideoOff ? 'Cam On' : 'Cam Off'}
            </button>

            {/* End Call Button */}
            <button onClick={endCall} style={{ width: '60px', height: '60px', borderRadius: '50%', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              End
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AgoraMeeting;