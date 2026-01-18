import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MusicTrainer from './pages/MusicTrainer';
import ViolinTrainer from './pages/ViolinTrainer';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/music-trainer" element={<MusicTrainer />} />
      <Route path="/violin-trainer" element={<ViolinTrainer />} />
    </Routes>
  );
}

export default App;
