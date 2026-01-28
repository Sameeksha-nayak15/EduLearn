import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import PendingRequests from '../components/admin/PendingRequests';
import Analytics from '../components/admin/Analytics';
import UsersManagement from '../components/admin/UsersManagement';
import VideosManagement from '../components/admin/VideosManagement';
import '../styles/admin.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { 
      icon: '📊', 
      label: 'Dashboard', 
      href: '#dashboard',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    },
    { 
      icon: '✅', 
      label: 'Pending Requests', 
      href: '#requests',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('requests');
      }
    },
    { 
      icon: '📹', 
      label: 'Videos', 
      href: '#videos',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('videos');
      }
    },
    { 
      icon: '👥', 
      label: 'Users', 
      href: '#users',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('users');
      }
    },
  ];

  const containerStyle = {
    display: 'flex',
    minHeight: 'calc(100vh - 70px)',
  };

  const mainStyle = {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
    backgroundColor: 'var(--light-bg)',
  };

  return (
    <>
      <Header title="EduLearn - Admin" />
      <div style={containerStyle}>
        <Sidebar items={sidebarItems} />
        <main style={mainStyle}>
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Manage users, videos, and monitor platform activity</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <Analytics />
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <PendingRequests />
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <VideosManagement />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UsersManagement />
          )}
        </main>
      </div>
    </>
  );
};

export default AdminPage;