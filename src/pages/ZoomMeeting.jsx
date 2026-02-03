import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ZoomMeeting = () => {
  const { id } = useParams();

  const joinMeeting = async () => {
    try {
      // This calls the 'Join' route we added to your backend
      const response = await fetch(`http://localhost:5000/api/zoom/join/${id}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("Meeting found in database:", data.meeting.title);
      } else {
        alert("Meeting not found! Try code: test-room");
      }
    } catch (err) {
      console.error("Connection error to backend");
    }
  };

  useEffect(() => {
    joinMeeting();
  }, [id]);

  return (
    <div style={{ backgroundColor: '#1a1a1a', height: '100vh', color: 'white', textAlign: 'center', paddingTop: '50px' }}>
      <h1>🎥 Zoom Room</h1>
      <p>Current Code: <strong>{id}</strong></p>
      <div style={{ width: '600px', height: '400px', background: 'black', margin: 'auto', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Video will appear here on your Mom's laptop tomorrow!</p>
      </div>
    </div>
  );
};

export default ZoomMeeting;