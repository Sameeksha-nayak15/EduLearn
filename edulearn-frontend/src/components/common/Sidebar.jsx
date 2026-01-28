import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ items = [] }) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Check if using hash-based navigation (admin pages)
  const isHashNav = items[0]?.href?.startsWith('#');

  const styles = {
    sidebar: {
      width: '250px',
      backgroundColor: 'var(--white)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 0',
      maxHeight: 'calc(100vh - 70px)',
      overflow: 'auto',
      position: 'sticky',
      top: '70px',
    },
    mobileSidebar: {
      position: 'fixed',
      left: 0,
      top: '70px',
      width: '100%',
      maxHeight: 'calc(100vh - 70px)',
      backgroundColor: 'var(--white)',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 0',
      zIndex: 150,
      display: isMobileOpen ? 'block' : 'none',
    },
    nav: {
      display: 'flex',
      flexDirection: 'column',
    },
    navItem: {
      padding: '1rem 1.5rem',
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      transition: 'all 0.3s ease',
      borderLeft: '3px solid transparent',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '0.95rem',
    },
    navItemActive: {
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      color: 'var(--primary-color)',
      borderLeftColor: 'var(--primary-color)',
    },
    navItemHover: {
      backgroundColor: 'var(--light-bg)',
    },
  };

  const isActive = (href) => {
    if (isHashNav) {
      return location.hash === href;
    }
    return location.pathname === href;
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        style={{
          display: 'none',
          '@media (max-width: 768px)': {
            display: 'block',
          },
          position: 'fixed',
          top: '80px',
          left: '1rem',
          zIndex: 160,
          backgroundColor: 'var(--primary-color)',
          color: 'var(--white)',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          cursor: 'pointer',
        }}
      >
        {isMobileOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <nav style={styles.nav}>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                ...(isActive(item.href) && styles.navItemActive),
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.href)) {
                  e.target.style.backgroundColor = 'var(--light-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.href)) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e);
                } else {
                  setIsMobileOpen(false);
                }
              }}
            >
              <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile sidebar */}
      <div style={styles.mobileSidebar}>
        <nav style={styles.nav}>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                ...(isActive(item.href) && styles.navItemActive),
              }}
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e);
                } else {
                  setIsMobileOpen(false);
                }
              }}
            >
              <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;