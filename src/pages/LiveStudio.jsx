import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Radio } from 'lucide-react';

// VERIFIED CREDENTIALS
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const TOKEN = '007eJxTYBCMUq+/9cyTc9KT3w/4tRvyXUo4lmgk+nEv+qKXW1y5oVmBwczQNMnY0NQ4zTg12cTY2MgyzdTE2NDEyMjCPM3SzMJE+UhjZkMgI8O6qnssjAwQCOJzM5SUFhUlJunmJmbmMTAAAIl0IA8=';
const CHANNEL = 'turrab-main';

// Create client outside to keep state consistent
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const localTracksRef = useRef({ video: null, audio: null });

  const startStreaming = async () => {
    // PREVENT INVALID_OPERATION: Do nothing if already connecting
    if (loading || joined || client.connectionState !== 'DISCONNECTED') return;
    
    setLoading(true);

    try {
      await client.setClientRole('host');
      
      // Join using the provided token
      await client.join(APP_ID, CHANNEL, TOKEN, null);

      const [audio, video] = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: "720p_1"
      });

      localTracksRef.current = { video, audio };
      await video.play('local-player');
      await client.publish([audio, video]);
      
      setJoined(true);
    } catch (err) {
      console.error("Setup Failed:", err);
      // Reset client on failure to allow retry
      if (client.connectionState !== 'DISCONNECTED') await client.leave();
    } finally {
      setLoading(false);
    }
  };

  const stopStreaming = async () => {
    try {
      const { video, audio } = localTracksRef.current;
      if (video) { video.stop(); video.close(); }
      if (audio) { audio.stop(); audio.close(); }
      await client.leave();
      setJoined(false);
      // Hard refresh to ensure clean state for next session
      window.location.reload(); 
    } catch (err) {
      window.location.reload();
    }
  };

  return (
    <div className="studio-wrapper">
      <div className="studio-container">
        <header className="studio-header">
          <h1 className="studio-title">
            <Radio className={joined ? "live-pulse" : ""} size={32} color={joined ? "#ef4444" : "#475569"} />
            ARCHITECT STUDIO
          </h1>
          <div className="id-badge">ID: 615b...9684</div>
        </header>

        <div className="video-stage">
          <div id="local-player" className="player-view"></div>
          {!joined && (
            <div className="video-overlay">
              <button 
                onClick={startStreaming} 
                className="btn-launch" 
                disabled={loading}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? "ESTABLISHING..." : "GO LIVE NOW"}
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