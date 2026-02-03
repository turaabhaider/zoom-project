import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio } from 'lucide-react';

// EXACT IDs FROM YOUR DASHBOARD
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const TOKEN = '007eJxTYBCMUq+/9cyTc9KT3w/4tRvyXUo4lmgk+nEv+qKXW1y5oVmBwczQNMnY0NQ4zTg12cTY2MgyzdTE2NDEyMjCPM3SzMJE+UhjZkMgI8O6qnssjAwQCOJzM5SUFhUlJunmJmbmMTAAAIl0IA8=';
const CHANNEL = 'turrab-main';

const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const localTracksRef = useRef({ video: null, audio: null });

  const startStreaming = async () => {
    if (loading || joined) return;
    setLoading(true);

    try {
      // 1. Join with secure role and token to fix the Gateway Error
      await client.setClientRole('host');
      await client.join(APP_ID, CHANNEL, TOKEN, null);

      // 2. Initialize Hardware for 720p Mobile Video
      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: "720p_1"
      });

      localTracksRef.current = { video, audio };

      // 3. Play and Publish
      await video.play('local-player');
      await client.publish([audio, video]);
      
      setJoined(true);
    } catch (err) {
      console.error("Broadcast failed:", err);
      alert("Stream Error: " + err.message);
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
          <div className="id-badge">SECURE HANDSHAKE ACTIVE</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <button onClick={startStreaming} className="btn-launch" disabled={loading}>
                {loading ? "CONNECTING TO GATEWAY..." : "GO LIVE NOW"}
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