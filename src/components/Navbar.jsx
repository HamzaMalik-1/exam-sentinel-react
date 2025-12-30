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
      
      <button onClick={toggleTheme} className="btn-toggle" style={{ fontSize: '0.9rem' }}>
        {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
      </button>
    </nav>
  );
};

export default Navbar;