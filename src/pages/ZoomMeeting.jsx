import React, { useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Users, ShieldCheck, Radio } from 'lucide-react';

// SECURE CREDENTIALS
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const TOKEN = '007eJxTYBCMUq+/9cyTc9KT3w/4tRvyXUo4lmgk+nEv+qKXW1y5oVmBwczQNMnY0NQ4zTg12cTY2MgyzdTE2NDEyMjCPM3SzMJE+UhjZkMgI8O6qnssjAwQCOJzM5SUFhUlJunmJmbmMTAAAIl0IA8=';
const CHANNEL = 'turrab-main';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const ZoomMeetingRoom = () => {
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const localTracks = useRef([]);

  const joinMeeting = async () => {
    // PREVENT INVALID_OPERATION:
    if (loading || joined || client.connectionState !== 'DISCONNECTED') return;
    setLoading(true);

    try {
      // 1. Join with Secure Token
      await client.join(APP_ID, CHANNEL, TOKEN, null);
      
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracks.current = [audioTrack, videoTrack];

      videoTrack.play('local-video');
      
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prev) => [...prev, user]);
          setTimeout(() => user.videoTrack.play(`user-${user.uid}`), 200);
        }
        if (mediaType === 'audio') user.audioTrack.play();
      });

      client.on('user-unpublished', (user) => {
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.publish(localTracks.current);
      setJoined(true);
    } catch (error) {
      console.error("Join Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const leaveMeeting = async () => {
    localTracks.current.forEach(t => { t.stop(); t.close(); });
    await client.leave();
    setJoined(false);
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-6 font-sans">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
            <Users className="text-blue-500" size={32} />
            ARCHITECT <span className="text-blue-500">MEETING</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-1 flex items-center gap-2">
            <ShieldCheck size={12} className="text-green-500"/> Secure Encrypted Line Active
          </p>
        </div>
        
        {!joined ? (
          <button onClick={joinMeeting} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-blue-500/20">
            {loading ? "AUTHENTICATING..." : "START SESSION"}
          </button>
        ) : (
          <button onClick={leaveMeeting} className="bg-red-500 hover:bg-red-600 px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all">
            DISCONNECT
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Participant */}
        <div className="group relative aspect-video bg-[#121214] rounded-[2.5rem] overflow-hidden border-4 border-white/5 hover:border-blue-500/50 transition-all shadow-2xl">
          <div id="local-video" className="w-full h-full object-cover"></div>
          <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">You (Architect)</span>
          </div>
          {!joined && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
              <Radio className="text-gray-600 mb-4 animate-pulse" size={48} />
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.4em]">Camera Standby</p>
            </div>
          )}
        </div>

        {/* Remote Participants */}
        {users.map(user => (
          <div key={user.uid} className="relative aspect-video bg-[#121214] rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl">
            <div id={`user-${user.uid}`} className="w-full h-full object-cover"></div>
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest">Guest_{user.uid}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoomMeetingRoom;