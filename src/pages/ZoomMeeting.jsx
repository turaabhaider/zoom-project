import React, { useState } from 'react';
import ZoomVideo from '@zoom/videosdk';
import { Users, ShieldCheck, Video, Mic, PhoneOff } from 'lucide-react';

// YOUR ZOOM CREDENTIALS
const SDK_KEY = '07JZ0mQXRz2Yi0RNRgO4cg';
const SDK_SECRET = 'IU4zHxFeC57UlV71VtAaRpzm80oUOEZR';
const TOPIC = 'turrab-main'; 

const client = ZoomVideo.createClient();

const ZoomMeetingRoom = () => {
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  // PURE JS SIGNATURE GENERATOR (NO NPM LIBRARIES NEEDED)
  const generateSignature = async () => {
    const iat = Math.round(new Date().getTime() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      sdkKey: SDK_KEY,
      mn: TOPIC,
      role: 1,
      iat: iat,
      exp: exp,
      appKey: SDK_KEY,
      tokenExp: exp
    };

    const sHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const sPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const message = `${sHeader}.${sPayload}`;
    
    const enc = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw', enc.encode(SDK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false, ['sign']
    );
    
    const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
    const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    return `${message}.${b64Sig}`;
  };

  const joinMeeting = async () => {
    if (loading || joined) return;
    setLoading(true);

    try {
      await client.init('en-US', 'Global');
      const signature = await generateSignature(); // Uses our new Pure JS function
      
      await client.join(TOPIC, signature, 'Architect');
      
      const mediaStream = client.getMediaStream();
      await mediaStream.startAudio();
      await mediaStream.startVideo({ videoElement: document.querySelector('#zoom-video-element') });

      setJoined(true);
    } catch (err) {
      console.error("Zoom Error:", err);
      alert("Zoom failed. Check browser console.");
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    await client.leave();
    window.location.reload();
  };

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
          <p style={{fontSize: '10px', color: '#555'}}><ShieldCheck size={12}/> ZOOM NATIVE MODE ACTIVE</p>
        </div>
        {!joined ? (
          <button onClick={joinMeeting} disabled={loading} style={{backgroundColor: '#2563eb', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
            {loading ? "AUTHENTICATING..." : "JOIN ZOOM"}
          </button>
        ) : (
          <button onClick={leaveMeeting} style={{backgroundColor: '#ef4444', border: 'none', color: 'white', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold'}}>LEAVE</button>
        )}
      </div>

      <div style={styles.videoBox}>
        <video id="zoom-video-element" style={{width: '100%', height: '100%', objectFit: 'cover'}}></video>
        {joined && <div style={{position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.8)', padding: '8px 15px', borderRadius: '20px', fontSize: '12px'}}>SECURE LINE | ARCHITECT</div>}
      </div>
    </div>
  );
};

export default ZoomMeetingRoom;