import React, { useState, useEffect } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio, ShieldCheck } from 'lucide-react';

const AGORA_APP_ID = "fd09ede01c4e4cb1a9fb4c07d41e30df"; 
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);

  const startStreaming = async () => {
    try {
      // 1. Join with null token for testing mode
      await client.join(AGORA_APP_ID, "main-room", null, null);

      // 2. Optimized for mobile and web
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: "720p_1" 
      });
      
      setLocalTracks([audioTrack, videoTrack]);

      // 3. Play video only if the div exists to avoid console errors
      if (document.getElementById("local-player")) {
        await videoTrack.play("local-player");
      }
      
      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
      console.log("VORA: Broadcast Live");
    } catch (error) {
      // No more alerts, just silent debugging
      console.error("Stream Error:", error.message);
    }
  };

  const stopStreaming = async () => {
    localTracks.forEach(track => { track.stop(); track.close(); });
    await client.leave();
    setJoined(false);
    window.location.reload(); 
  };

  return (
    <div className="studio-wrapper">
      <div className="studio-container">
        <header className="studio-header">
          <div>
            <h1 className="studio-title">
              <Radio className={joined ? "live-icon active" : "live-icon"} color={joined ? "#ef4444" : "#475569"} size={32} />
              ARCHITECT STUDIO
            </h1>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px'}}>
               <ShieldCheck size={14} color="#38bdf8" />
               <span style={{fontSize: '12px', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px'}}>SECURE BROADCAST</span>
            </div>
          </div>
          <div className="id-badge">
            <span style={{color: '#38bdf8', fontFamily: 'monospace', fontSize: '12px'}}>ID: fd09...30df</span>
          </div>
        </header>

        <div className="video-stage">
          <div id="local-player" style={{width: '100%', height: '100%', objectFit: 'cover'}}></div>
          
          {!joined && (
            <div className="video-overlay">
              <div className="icon-pulse">
                <Video color="#38bdf8" size={40} />
              </div>
              <button onClick={startStreaming} className="btn-launch">
                GO LIVE NOW
              </button>
              <p style={{color: '#94a3b8', marginTop: '20px', fontSize: '14px'}}>Encrypted Connection Ready</p>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row">
            <button className="control-btn"><Mic size={24} /></button>
            <button className="control-btn"><Video size={24} /></button>
            <button onClick={stopStreaming} className="btn-end">
              <PhoneOff size={20} /> END SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;