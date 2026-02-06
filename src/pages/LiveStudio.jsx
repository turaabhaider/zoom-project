import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, Radio } from 'lucide-react';

// VERIFIED CREDENTIALS FOR "THE OTHER ONE"
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const CHANNEL = 'turrab-main'; 
const TOKEN = '007eJxTYJhlaS760fCQV0Rx7mntpFDOO3PY8zUvRfvvPhYtMlNBN1WBwczQNMnY0NQ4zTg12cTY2MgyzdTE2NDEyMjCPM3SzMKk9VtrZkMgI8O5K9JMjAwQCOJzM5SUFhUlJunmJmbmMTAAADWvHzI=';

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
    <div style={{ backgroundColor: '#0f172a', height: '100vh', color: 'white', overflow: 'hidden' }}>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
            <Radio className={joined ? "live-pulse" : ""} size={32} color={joined ? "#ef4444" : "#475569"} />
            ARCHITECT STUDIO
          </h1>
          <div style={{ opacity: 0.6, fontSize: '14px' }}>ID: 615b...9684</div>
        </header>

        <div style={{ position: 'relative', width: '100%', height: '70vh', backgroundColor: 'black', borderRadius: '15px', overflow: 'hidden' }}>
          <div id="local-player" style={{ width: '100%', height: '100%' }}></div>
          {!joined && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.6)' }}>
              <button 
                onClick={startStreaming} 
                disabled={loading}
                style={{ backgroundColor: '#2563eb', padding: '15px 45px', borderRadius: '30px', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '18px', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.3s' }}
              >
                {loading ? "CONNECTING..." : "GO LIVE NOW"}
              </button>
            </div>
          )}
        </div>

        {joined && (
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '25px', alignItems: 'center' }}>
            <button onClick={toggleMic} style={{ padding: '15px', borderRadius: '50%', backgroundColor: isMuted ? '#ef4444' : '#334155', border: 'none', color: 'white', cursor: 'pointer' }}>
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button onClick={toggleVideo} style={{ padding: '15px', borderRadius: '50%', backgroundColor: isVidOff ? '#ef4444' : '#334155', border: 'none', color: 'white', cursor: 'pointer' }}>
              {isVidOff ? <VideoOff size={24} /> : <Video size={24} />}
            </button>
            <button onClick={stopStreaming} style={{ backgroundColor: '#ef4444', padding: '12px 35px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
              END SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStudio;