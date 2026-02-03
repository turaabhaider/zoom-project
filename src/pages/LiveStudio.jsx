import React, { useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio, ShieldCheck } from 'lucide-react';

const AGORA_APP_ID = "fd09ede01c4e4cb1a9fb4c07d41e30df"; 
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);

  const startStreaming = async () => {
    try {
      await client.join(AGORA_APP_ID, "main-room", null, null);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: "720p_1" 
      });
      setLocalTracks([audioTrack, videoTrack]);
      if (document.getElementById("local-player")) {
        await videoTrack.play("local-player");
      }
      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (error) {
      console.error("Stream Initialization Failed:", error.message);
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
               <span style={{fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '1px'}}>SECURE LINE</span>
            </div>
          </div>
          <div style={{background: '#0f172a', border: '1px solid #1e293b', padding: '6px 12px', borderRadius: '10px'}}>
            <span style={{color: '#38bdf8', fontFamily: 'monospace', fontSize: '11px'}}>ID: fd09...30df</span>
          </div>
        </header>

        <div className="video-stage">
          <div id="local-player" style={{width: '100%', height: '100%', objectFit: 'cover'}}></div>
          {!joined && (
            <div className="video-overlay">
              <Video color="#38bdf8" size={40} style={{marginBottom: '15px'}} />
              <button onClick={startStreaming} className="btn-launch">GO LIVE NOW</button>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row">
            <button className="control-btn"><Mic size={20} /></button>
            <button className="control-btn"><Video size={20} /></button>
            <button onClick={stopStreaming} className="btn-end"><PhoneOff size={18} /> END</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;