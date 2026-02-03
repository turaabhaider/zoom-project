import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio } from 'lucide-react';

// Using your WORKING App ID from the other project
const APP_ID = 'f7eba401610743d8bd1a8c1b13ad66ba'; 
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const localTracksRef = useRef({ video: null, audio: null });

  const startStreaming = async () => {
    if (loading || joined) return;
    setLoading(true);

    try {
      // FIX: Set role to host and join WITHOUT a token (null)
      // This works if your Agora project is in "Testing Mode"
      await client.setClientRole('host');
      await client.join(APP_ID, 'turrab-main', null, null);

      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { video, audio };

      await video.play('local-player');
      await client.publish([audio, video]);
      
      setJoined(true);
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopStreaming = async () => {
    const { video, audio } = localTracksRef.current;
    if (video) { video.stop(); video.close(); }
    if (audio) { audio.stop(); audio.close(); }
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
          <div className="id-badge">ID: f7eb...66ba</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <button onClick={startStreaming} className="btn-launch" disabled={loading}>
                {loading ? "INITIALIZING..." : "GO LIVE NOW"}
              </button>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row">
            <button className="control-btn"><Mic /></button>
            <button className="control-btn"><Video /></button>
            <button onClick={stopStreaming} className="btn-end">END SESSION</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;