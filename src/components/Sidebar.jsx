import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Settings, 
  BookOpen, 
  Award, 
  User, 
  LogOut, 
  UserCog,
  School,
  Calendar
} from 'lucide-react';

const Sidebar = () => {
  // 1. Get User Role from Storage (Default to student if null)
//   const role =  'admin';
  const role = localStorage.getItem('userRole') || 'student';

  // 2. Define Menu Config (Role-Based)
 const MENU_ITEMS = {
  admin: [
    // { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { 
      label: 'Manage Classes', 
      path: '/admin/classes', 
      icon: School,
      // Logic: This page will handle Creating Classes & Assigning Teachers
    },
    { 
      label: 'Manage Teachers', 
      path: '/admin/teachers', 
      icon: UserCog,
      // Logic: This page will handle Teacher CRUD (Create, Read, Update, Delete)
    },
    // { label: 'Settings', path: '/settings', icon: Settings },
  ],
  teacher: [
    // { label: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { label: 'Manage Exams', path: '/teacher/exams', icon: BookOpen },
    // { label: 'Create Exam', path: '/exam/create', icon: PlusCircle },
    { label: 'Exam Result', path: '/teacher/result', icon: FileText },
    { label: 'Assign Exam', path: '/teacher/assign', icon: Calendar },
    // { label: 'Settings', path: '/settings', icon: Settings },
  ],
  student: [
    // { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'My Exams', path: '/student/exams', icon: BookOpen },
    { label: 'Results', path: '/student/results', icon: Award },
    // { label: 'Profile', path: '/profile', icon: User },
  ]
};

  // 3. Select the correct menu
  const menuToRender = MENU_ITEMS[role] || MENU_ITEMS['student'];

  const handleLogout = () => {
    if(window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      window.location.href = '/'; // Hard reload to clear state
    }
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 80px)', // Full height minus Navbar
      position: 'sticky',
      top: '80px' // Stick below Navbar
    }}>
      
      {/* Menu Label */}
      <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
        {role} Menu
      </p>

      {/* Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuToRender.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              // Dynamic Styling based on Active State
              backgroundColor: isActive ? 'var(--bg-input)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              borderLeft: isActive ? '4px solid var(--accent)' : '4px solid transparent'
            })}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Logout Button (Bottom) */}
      <button 
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          borderRadius: '8px',
          background: 'transparent',
          border: '1px solid var(--border-color)',
          color: 'var(--danger)',
          cursor: 'pointer',
          marginTop: 'auto'
        }}
      >
        <LogOut size={20} />
        Log Out
      </button>

    </aside>
  );
};

export default Sidebar;