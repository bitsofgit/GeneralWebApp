import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Dashboard</h1>
        <p>Select a tool to get started</p>
      </header>
      <div className="tools-grid">
        <Link to="/music-trainer" className="tool-card">
          <div className="icon">🎵</div>
          <h2>Music Trainer</h2>
          <p>Practice reading sheet music</p>
        </Link>
        <Link to="/violin-trainer" className="tool-card">
          <div className="icon">🎻</div>
          <h2>Violin Trainer</h2>
          <p>Treble Clef (G3-C6)</p>
        </Link>
        {/* Placeholder for more tools */}
        <div className="tool-card disabled">
          <div className="icon">🔨</div>
          <h2>More Coming Soon</h2>
        </div>
      </div>
    </div>
  );
};

export default Home;
