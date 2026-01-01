import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  return (
    <nav className="card-box" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 2rem',
        // --- Added for Sticky Top ---
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // Ensures it stays above page content
        backgroundColor: 'var(--bg-card)', // Ensure it has a solid background
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', // Optional: subtle shadow for depth
        marginBottom: '2rem'
    }}>
      {/* Click Logo to go Home */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <div style={{ width: '24px', height: '24px', background: 'var(--accent)', borderRadius: '4px' }}></div>
        <h3 className="text-title" style={{ margin: 0 }}>ExamSentinel</h3>
      </div>
      
      {/* Optional: Navigation items could go here */}
    </nav>
  );
};

export default Navbar;