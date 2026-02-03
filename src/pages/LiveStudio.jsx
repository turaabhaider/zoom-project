import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio, ShieldCheck } from 'lucide-react';

const AGORA_APP_ID = "fd09ede01c4e4cb1a9fb4c07d41e30df"; 

// Create client inside the component or ensure it's reset correctly
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const localTracksRef = useRef([]);

  const startStreaming = async () => {
    if (loading || joined) return;
    setLoading(true);

    try {
      // FORCE CLEANUP: If a previous attempt failed, we reset the connection state
      if (client.connectionState === "DISCONNECTED") {
        await client.join(AGORA_APP_ID, "main-room", null, null);
      } else if (client.connectionState === "CONNECTED") {
        console.warn("Already connected to gateway.");
      }

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: "720p_1"
      });

      localTracksRef.current = [audioTrack, videoTrack];
      await videoTrack.play("local-player");
      await client.publish(localTracksRef.current);
      
      setJoined(true);
    } catch (error) {
      console.error("GATEWAY ERROR:", error.message);
      // If gateway fails, we must leave to reset the internal client state
      await client.leave(); 
      alert("Network Error: Please try a different Wi-Fi or Mobile Data.");
    } finally {
      setLoading(false);
    }
  };

  const stopStreaming = async () => {
    localTracksRef.current.forEach(t => { t.stop(); t.close(); });
    await client.leave();
    setJoined(false);
    window.location.reload(); 
  };

  return (
    <div className="studio-wrapper">
      <div className="studio-container">
        <header className="studio-header">
          <h1 className="studio-title">
            <Radio className={joined ? "live-pulse" : ""} size={32} color={joined ? "#ef4444" : "#475569"} />
            ARCHITECT STUDIO
          </h1>
          <div className="id-badge">ID: fd09...30df</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <Video size={48} color="#38bdf8" style={{marginBottom: '20px'}} />
              <button onClick={startStreaming} className="btn-launch" disabled={loading}>
                {loading ? "ESTABLISHING SECURE CONNECTION..." : "GO LIVE NOW"}
              </button>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row">
            <button className="control-btn"><Mic /></button>
            <button className="control-btn"><Video /></button>
            <button onClick={stopStreaming} className="btn-end"><PhoneOff /> END SESSION</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;