import React, { useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

// --- CONFIGURATION ---
const APP_ID = "3004cbdcbcf0421d86cec599166d45a3"; 
const CHANNEL = "architect_live"; // This is the channel name you used
const TOKEN = "007eJxTYDh5KPdX9B6OzbN5IljX3RP40m482332zzyuXcavxT0PW1xUYDA2MDBJTkpJTkpOMzAxMkyxMEtOTTa1tDQ0M0sxMU00fniwJbMhkJGh7psYAyMUgvh8DIlFyRmZJanJJfE5mWWpDAwA+n4kwQ==";
// ---------------------

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const AgoraMeeting = () => {
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState('JOIN LIVE MEETING');
  const [localTracks, setLocalTracks] = useState([]); 
  const [isMuted, setIsMuted] = useState(false);

  const startCall = async () => {
    try {
      setStatus('CONNECTING...');
      
      // 1. Join the channel
      await client.join(APP_ID, CHANNEL, TOKEN, 0);
      
      // 2. Get Camera & Mic
      let audioTrack, videoTrack;
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([audioTrack, videoTrack]); 
      } catch (deviceError) {
        console.error("Camera/Mic access denied:", deviceError);
        setStatus('CAMERA NOT FOUND');
        await client.leave();
        return;
      }

      setJoined(true);
      setStatus('LIVE');

      // 3. Play Video Locally
      setTimeout(() => {
        const playerDiv = document.getElementById('local-player');
        if (playerDiv) videoTrack.play(playerDiv);
      }, 200);

      // 4. Publish to Channel
      await client.publish([audioTrack, videoTrack]);

    } catch (error) {
      console.error("Join Failed:", error);
      setStatus('JOIN FAILED - CHECK TOKEN');
    }
  };

  // --- CONTROLS ---
  const toggleMute = async () => {
    if (localTracks[0]) {
      // If isMuted is false, we want to mute (enabled = false)
      // If isMuted is true, we want to unmute (enabled = true)
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
    window.location.reload(); 
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