import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import the new Agora file instead of Zoom
import Dashboard from './pages/Dashboard'; 
import LiveStudio from './pages/LiveStudio';
import AgoraMeeting from './pages/AgoraMeeting'; // Updated line

function App() {
  return (
    <Routes>
      {/* 1. Your Original Dashboard */}
      <Route path="/" element={<Dashboard />} />
      
      {/* 2. The Broadcast Studio page */}
      <Route path="/stream/live" element={<LiveStudio />} />
      
      {/* 3. The Agora Meeting (Replaces Zoom) */}
      <Route path="/meeting/zoom" element={<AgoraMeeting />} />
      <Route path="/meeting/zoom/:id" element={<AgoraMeeting />} />
    </Routes>
  );
}

export default App;