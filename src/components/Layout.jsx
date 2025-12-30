import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ theme, toggleTheme }) => {
  const location = useLocation();

  // Define public routes where Sidebar should NOT appear
  const publicRoutes = ['/', '/signup'];
  const showSidebar = !publicRoutes.includes(location.pathname);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--bg-body)',
      transition: 'background-color 0.3s ease'
    }}>
      
      {/* 1. TOP NAVBAR (Always Visible) */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* 2. FLEX CONTAINER (Sidebar + Main Content) */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* Render Sidebar ONLY if logged in (not on public pages) */}
        {showSidebar && <Sidebar />}

        {/* MAIN CONTENT AREA */}
        <main style={{ 
          flex: 1, 
          padding: '30px', 
          width: '100%',
          overflowX: 'hidden' // Prevents horizontal scroll if tables are wide
        }}>
          <Outlet />
        </main>

      </div>

      {/* 3. FOOTER (Only show on public pages usually, or keep simple) */}
      {!showSidebar && (
        <footer style={{ 
          textAlign: 'center', 
          padding: '20px', 
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>&copy; 2025 ExamSentinel. All Rights Reserved.</p>
        </footer>
      )}

    </div>
  );
};

export default Layout;