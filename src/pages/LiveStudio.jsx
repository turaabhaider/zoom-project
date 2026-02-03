import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio, ShieldCheck } from 'lucide-react';

const AGORA_APP_ID = "fd09ede01c4e4cb1a9fb4c07d41e30df"; 
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // Prevents INVALID_OPERATION
  const localTracksRef = useRef([]);

  const startStreaming = async () => {
    if (isConnecting || joined) return; // Stop if already trying to connect
    
    setIsConnecting(true);
    try {
      // 1. Join with protection against multiple clicks
      await client.join(AGORA_APP_ID, "main-room", null, null);

      // 2. Request Hardware with specific mobile-friendly constraints
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: { width: { max: 1280 }, height: { max: 720 }, frameRate: 30 }
      });
      
      localTracksRef.current = [audioTrack, videoTrack];

      // 3. Play immediately after verifying the player exists
      const player = document.getElementById("local-player");
      if (player) {
        await videoTrack.play("local-player");
      }
      
      await client.publish([audioTrack, videoTrack]);
      setJoined(true);
    } catch (error) {
      console.error("Connection failed:", error.message);
      // If gateway fails, it's usually a network/firewall issue
    } finally {
      setIsConnecting(false);
    }
  };

  const stopStreaming = async () => {
    localTracksRef.current.forEach(track => {
      track.stop();
      track.close();
    });
    await client.leave();
    setJoined(false);
    window.location.reload(); 
  };

  return (
    <div className="studio-wrapper">
      <div className="studio-container">
        <header className="studio-header">
          <div className="header-left">
            <h1 className="studio-title">
              <Radio className={joined ? "live-pulse" : ""} size={32} color={joined ? "#ef4444" : "#475569"} />
              ARCHITECT STUDIO
            </h1>
            <p className="status-text"><ShieldCheck size={14} /> SECURE LINE ACTIVE</p>
          </div>
          <div className="id-badge">ID: fd09...30df</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <div className="icon-box"><Video size={40} color="#38bdf8" /></div>
              <button 
                onClick={startStreaming} 
                className="btn-launch" 
                disabled={isConnecting}
              >
                {isConnecting ? "CONNECTING..." : "GO LIVE NOW"}
              </button>
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