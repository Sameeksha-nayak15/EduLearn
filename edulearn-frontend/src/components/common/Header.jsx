import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ title = 'EduLearn' }) => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const styles = {
    header: {
      backgroundColor: 'var(--white)',
      borderBottom: '1px solid var(--border-color)',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow)',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brand: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'var(--primary-color)',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    },
    userDetails: {
      textAlign: 'right',
    },
    userName: {
      fontWeight: '600',
      color: 'var(--text-primary)',
    },
    userRole: {
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      textTransform: 'capitalize',
    },
    profileButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'var(--primary-color)',
      color: 'var(--white)',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    dropdown: {
      position: 'absolute',
      top: '50px',
      right: 0,
      backgroundColor: 'var(--white)',
      border: '1px solid var(--border-color)',
      borderRadius: '0.5rem',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 200,
      minWidth: '200px',
    },
    dropdownItem: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid var(--border-color)',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      color: 'var(--text-primary)',
      textDecoration: 'none',
      display: 'block',
      fontWeight: '500',
      fontSize: '0.95rem',
    },
    dropdownItemLast: {
      borderBottom: 'none',
    },
    logoutButton: {
      backgroundColor: '#fee2e2',
      color: 'var(--danger-color)',
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <a href="/" style={styles.brand}>
          🎓 {title}
        </a>

        {user && (
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user.email}</div>
              <div style={styles.userRole}>{userRole}</div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                style={styles.profileButton}
                onClick={() => setShowMenu(!showMenu)}
                title="User menu"
              >
                👤
              </button>

              {showMenu && (
                <div style={styles.dropdown}>
                  <a
                    href={`/${userRole}`}
                    style={styles.dropdownItem}
                    onClick={() => setShowMenu(false)}
                  >
                    Dashboard
                  </a>
                  <button
                    onClick={handleLogout}
                    style={{
                      ...styles.dropdownItem,
                      ...styles.dropdownItemLast,
                      ...styles.logoutButton,
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;