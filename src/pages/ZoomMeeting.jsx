import React, { useState, useRef } from 'react';
import ZoomVideo from '@zoom/videosdk';
import { Users, ShieldCheck, Video, Mic, PhoneOff } from 'lucide-react';
import jsrsign from 'jsrsign'; // Corrected import

// YOUR ZOOM CREDENTIALS
const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';
const TOPIC = 'turrab-main'; 

const client = ZoomVideo.createClient();

const ZoomMeetingRoom = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoContainerRef = useRef(null);

  const generateSignature = () => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: 'HS256', typ: 'JWT' };
    const oPayload = {
      sdkKey: SDK_KEY,
      mn: TOPIC,
      role: 1,
      iat: iat,
      exp: exp,
      appKey: SDK_KEY,
      tokenExp: exp
    };
    
    // Using the jsrsign library to create the secure Zoom key
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    return jsrsign.jws.JWS.sign('HS256', sHeader, sPayload, SDK_SECRET);
  };

  const joinMeeting = async () => {
    if (loading || joined) return;
    setLoading(true);

    try {
      await client.init('en-US', 'Global');
      const signature = generateSignature();
      
      await client.join(TOPIC, signature, 'Architect');
      
      const mediaStream = client.getMediaStream();
      await mediaStream.startAudio();
      
      // Zoom renders to a canvas or video element
      await mediaStream.startVideo({ videoElement: document.querySelector('#zoom-video-element') });

      setJoined(true);
    } catch (err) {
      console.error("Zoom Error:", err);
      alert("Zoom Connection Failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    await client.leave();
    window.location.reload();
  };

  // Standard CSS styles to bypass Tailwind issues
  const styles = {
    page: { backgroundColor: '#0a0a0c', minHeight: '100vh', color: 'white', padding: '40px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' },
    videoBox: { position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto', aspectRatio: '16/9', backgroundColor: '#111', borderRadius: '24px', overflow: 'hidden', border: '2px solid #333' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={{fontSize: '24px', fontWeight: 'bold'}}><Users color="#2563eb" /> ARCHITECT MEETING</h1>
          <p style={{fontSize: '10px', color: '#555'}}><ShieldCheck size={12}/> ZOOM VIDEO SDK ACTIVE</p>
        </div>
        {!joined ? (
          <button onClick={joinMeeting} disabled={loading} style={{backgroundColor: '#2563eb', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
            {loading ? "GENERATING SIGNATURE..." : "JOIN ZOOM SESSION"}
          </button>
        ) : (
          <button onClick={leaveMeeting} style={{backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold'}}>LEAVE SESSION</button>
        )}
      </div>

      <div style={styles.videoBox}>
        <video id="zoom-video-element" style={{width: '100%', height: '100%', objectFit: 'cover'}}></video>
        {joined && <div style={{position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', border: '1px solid #444'}}>LIVE | ARCHITECT MODE</div>}
      </div>
    </div>
  );
};

export default ZoomMeetingRoom;