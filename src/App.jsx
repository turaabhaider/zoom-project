import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importing your actual files visible in image_3a8e5c.png
import Dashboard from './pages/Dashboard'; 
import LiveStudio from './pages/LiveStudio';
import ZoomMeeting from './pages/ZoomMeeting';

function App() {
  return (
    <Routes>
      {/* 1. Your Original Dashboard with all content */}
      <Route path="/" element={<Dashboard />} />
      
      {/* 2. The Broadcast Studio page */}
      <Route path="/stream/live" element={<LiveStudio />} />
      
      {/* 3. The Zoom Meeting (Works with or without an ID) */}
      <Route path="/meeting/zoom/:id" element={<ZoomMeeting />} />
      <Route path="/meeting/zoom" element={<ZoomMeeting />} />
    </Routes>
  );
}

export default App;