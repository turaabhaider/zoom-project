import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, Radio } from 'lucide-react';

// VERIFIED CREDENTIALS
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const CHANNEL = 'turrab-main'; 
const TOKEN = '007eJxTYChfurrS+FHvmovdRYzPjl26tTAg6uJvLXND5zUrwuYk71NXYDAzNE0yNjQ1TjNOTTYxNjayTDM1MTY0MTKyME+zNLMwcT7cktkQyMiQpsPIAIMgPjdDSWlRUWKSbm5iZh4DAwB/BCG2';

// Create client outside to keep state consistent
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });

const LiveStudio = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVidOff, setIsVidOff] = useState(false);
  const localTracksRef = useRef({ video: null, audio: null });

  const startStreaming = async () => {
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

  const toggleMic = async () => {
    if (localTracksRef.current.audio) {
      await localTracksRef.current.audio.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracksRef.current.video) {
      await localTracksRef.current.video.setEnabled(isVidOff);
      setIsVidOff(!isVidOff);
    }
  };

  const stopStreaming = async () => {
    try {
      const { video, audio } = localTracksRef.current;
      if (video) { video.stop(); video.close(); }
      if (audio) { audio.stop(); audio.close(); }
      await client.leave();
      setJoined(false);
      window.location.reload(); 
    } catch (err) {
      window.location.reload();
    }
  };

  return (
    <div className="studio-wrapper" style={{ backgroundColor: '#0f172a', height: '100vh', color: 'white' }}>
      <div className="studio-container" style={{ padding: '20px' }}>
        <header className="studio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 className="studio-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio className={joined ? "live-pulse" : ""} size={32} color={joined ? "#ef4444" : "#475569"} />
            ARCHITECT STUDIO
          </h1>
          <div className="id-badge" style={{ opacity: 0.6 }}>ID: 615b...9684</div>
        </header>

        <div className="video-stage" style={{ position: 'relative', width: '100%', height: '70vh', backgroundColor: 'black', borderRadius: '15px', overflow: 'hidden' }}>
          <div id="local-player" className="player-view" style={{ width: '100%', height: '100%' }}></div>
          {!joined && (
            <div className="video-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <button 
                onClick={startStreaming} 
                className="btn-launch" 
                disabled={loading}
                style={{ backgroundColor: '#2563eb', padding: '15px 40px', borderRadius: '30px', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? "ESTABLISHING..." : "GO LIVE NOW"}
              </button>
            </div>
          )}
        </div>

        {joined && (
          <div className="controls-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button onClick={toggleMic} className="control-btn" style={{ padding: '15px', borderRadius: '50%', backgroundColor: isMuted ? '#ef4444' : '#334155', border: 'none', color: 'white', cursor: 'pointer' }}>
              {isMuted ? <MicOff /> : <Mic />}
            </button>
            <button onClick={toggleVideo} className="control-btn" style={{ padding: '15px', borderRadius: '50%', backgroundColor: isVidOff ? '#ef4444' : '#334155', border: 'none', color: 'white', cursor: 'pointer' }}>
              {isVidOff ? <VideoOff /> : <Video />}
            </button>
            <button onClick={stopStreaming} className="btn-end" style={{ backgroundColor: '#ef4444', padding: '10px 30px', borderRadius: '10px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              END SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;