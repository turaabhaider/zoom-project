import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Mic, Video, PhoneOff, Users } from 'lucide-react';

// VERIFIED CREDENTIALS
const APP_ID = '615b3153f3ec43329f543142287f9684'; 
const TOKEN = '007eJxTYBCMUq+/9cyTc9KT3w/4tRvyXUo4lmgk+nEv+qKXW1y5oVmBwczQNMnY0NQ4zTg12cTY2MgyzdTE2NDEyMjCPM3SzMJE+UhjZkMgI8O6qnssjAwQCOJzM5SUFhUlJunmJmbmMTAAAIl0IA8=';
const CHANNEL = 'turrab-main';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

const MeetingRoom = () => {
  const [users, setUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const localTracks = useRef([]);

  const joinMeeting = async () => {
    // State guard to prevent INVALID_OPERATION
    if (client.connectionState !== 'DISCONNECTED') return;

    try {
      // 1. Join with Secure Token
      await client.join(APP_ID, CHANNEL, TOKEN, null);
      
      // 2. Setup Mic and Camera
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracks.current = [audioTrack, videoTrack];

      // 3. Display local video
      videoTrack.play('local-video');
      
      // 4. Listen for other people joining
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prev) => [...prev, user]);
          // Wait for DOM update then play
          setTimeout(() => user.videoTrack.play(`user-${user.uid}`), 100);
        }
        if (mediaType === 'audio') user.audioTrack.play();
      });

      client.on('user-unpublished', (user) => {
        setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      await client.publish(localTracks.current);
      setJoined(true);
    } catch (error) {
      console.error("Zoom Join Failed:", error);
    }
  };

  const leaveMeeting = async () => {
    localTracks.current.forEach(t => { t.stop(); t.close(); });
    await client.leave();
    setJoined(false);
    window.location.reload(); 
  };

  return (
    <div className="meeting-wrapper p-4 bg-slate-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users /> ARCHITECT MEETING
        </h2>
        {!joined ? (
          <button onClick={joinMeeting} className="bg-blue-600 px-6 py-2 rounded-lg font-bold">JOIN MEETING</button>
        ) : (
          <button onClick={leaveMeeting} className="bg-red-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            <PhoneOff size={18}/> LEAVE
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local User */}
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-blue-500">
          <div id="local-video" className="w-full h-full"></div>
          <span className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 text-xs">You (Architect)</span>
        </div>

        {/* Remote Users */}
        {users.map(user => (
          <div key={user.uid} className="relative aspect-video bg-black rounded-xl overflow-hidden">
            <div id={`user-${user.uid}`} className="w-full h-full"></div>
            <span className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 text-xs">Guest {user.uid}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingRoom;