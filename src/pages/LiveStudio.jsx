import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio, ShieldCheck } from 'lucide-react';

// Use your WORKING App ID here
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
      // 1. Get Token (Using your local server logic)
      const res = await fetch('http://localhost:5000/api/get-token?channel=turrab-main');
      const { token } = await res.json();

      // 2. Set Role to Host (This is the "magic" fix)
      await client.setClientRole('host');
      await client.join(APP_ID, 'turrab-main', token, null);

      // 3. Create Tracks
      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { video, audio };

      // 4. Play and Publish
      await video.play('local-player');
      await client.publish([audio, video]);
      
      setJoined(true);
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Check if your Token Server (Port 5000) is running!");
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
          <div className="id-badge">CHANNEL: turrab-main</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <button onClick={startStreaming} className="btn-launch" disabled={loading}>
                {loading ? "CONNECTING..." : "START BROADCAST"}
              </button>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row">
            <button className="control-btn"><Mic /></button>
            <button className="control-btn"><Video /></button>
            <button onClick={stopStreaming} className="btn-end"><PhoneOff /> END</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;