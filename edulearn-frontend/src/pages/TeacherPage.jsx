import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import UploadVideo from '../components/teacher/UploadVideo';
import VideoList from '../components/teacher/VideoList';
import '../styles/teacher.css';

const TeacherPage = () => {
  const [refreshVideos, setRefreshVideos] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleVideoUploaded = () => {
    // Trigger refresh of video list
    setRefreshVideos((prev) => prev + 1);
  };

  const sidebarItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      href: '#dashboard',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('dashboard');
      },
    },
    {
      icon: '📹',
      label: 'Upload Video',
      href: '#upload',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('upload');
      },
    },
    {
      icon: '📚',
      label: 'My Videos',
      href: '#videos',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('videos');
      },
    },
    {
      icon: '📊',
      label: 'Analytics',
      href: '#analytics',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('analytics');
      },
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
      <Header title="EduLearn - Teacher" />
      <div style={containerStyle}>
        <Sidebar items={sidebarItems} />
        <main style={mainStyle}>
          <div className="teacher-header">
            <h1>Teacher Dashboard</h1>
            <p>Manage your videos and track student engagement</p>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="teacher-stats">
                <div className="stat-item">
                  <div className="stat-number">📹</div>
                  <div className="stat-label">Upload Videos</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                    Click to upload your content
                  </p>
                </div>

                <div className="stat-item">
                  <div className="stat-number">👥</div>
                  <div className="stat-label">Student Views</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                    Track engagement metrics
                  </p>
                </div>

                <div className="stat-item">
                  <div className="stat-number">📊</div>
                  <div className="stat-label">Analytics</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                    View detailed statistics
                  </p>
                </div>

                <div className="stat-item">
                  <div className="stat-number">✅</div>
                  <div className="stat-label">Completion</div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                    Monitor completion rates
                  </p>
                </div>
              </div>

              <div className="upload-card" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Quick Start</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Welcome to EduLearn! You can upload videos to engage your students.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--white)',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Upload Your First Video →
                </button>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <UploadVideo onVideoUploaded={handleVideoUploaded} />
          )}

          {/* Videos Tab */}
          {activeTab === 'videos' && (
            <VideoList refreshTrigger={refreshVideos} />
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="video-section">
              <h2>Video Analytics</h2>
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>Detailed Analytics</h3>
                <p>Advanced analytics and insights coming soon.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default TeacherPage;