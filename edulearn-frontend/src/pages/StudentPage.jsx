import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import AvailableVideos from '../components/student/AvailableVideos';
import { useAuth } from '../context/AuthContext';
import { getCompletedVideos, getInProgressVideos } from '../services/videoProgress';
import { getAllVideos } from '../services/videos';
import '../styles/student.css';

const StudentPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({
    totalVideos: 0,
    completedVideos: 0,
    inProgressVideos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [allVideos, completed, inProgress] = await Promise.all([
        getAllVideos(),
        getCompletedVideos(user.id),
        getInProgressVideos(user.id),
      ]);

      setStats({
        totalVideos: allVideos.length,
        completedVideos: completed.length,
        inProgressVideos: inProgress.length,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    {
      icon: '📚',
      label: 'All Videos',
      href: '#all',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('all');
      },
    },
    {
      icon: '⏱️',
      label: 'In Progress',
      href: '#in-progress',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('in-progress');
      },
    },
    {
      icon: '✅',
      label: 'Completed',
      href: '#completed',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('completed');
      },
    },
    {
      icon: '🔍',
      label: 'Search',
      href: '#search',
      onClick: (e) => {
        e.preventDefault();
        setActiveTab('search');
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
      <Header title="EduLearn - Student" />
      <div style={containerStyle}>
        <Sidebar items={sidebarItems} />
        <main style={mainStyle}>
          <div className="student-header">
            <h1>Student Dashboard</h1>
            <p>Browse and watch educational videos</p>
          </div>

          {/* Statistics */}
          {!loading && (
            <div className="student-stats">
              <div className="stat-item">
                <div className="stat-number">📚</div>
                <div className="stat-label">Available Videos</div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', margin: '0.5rem 0 0 0' }}>
                  {stats.totalVideos}
                </p>
              </div>

              <div className="stat-item in-progress">
                <div className="stat-number">⏱️</div>
                <div className="stat-label">In Progress</div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b', margin: '0.5rem 0 0 0' }}>
                  {stats.inProgressVideos}
                </p>
              </div>

              <div className="stat-item completed">
                <div className="stat-number">✅</div>
                <div className="stat-label">Completed</div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981', margin: '0.5rem 0 0 0' }}>
                  {stats.completedVideos}
                </p>
              </div>

              <div className="stat-item">
                <div className="stat-number">🏆</div>
                <div className="stat-label">Completion Rate</div>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)', margin: '0.5rem 0 0 0' }}>
                  {Math.round((stats.completedVideos / Math.max(stats.totalVideos, 1)) * 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          {activeTab === 'all' && (
            <AvailableVideos />
          )}

          {activeTab === 'in-progress' && (
            <div className="videos-section">
              <h2>In Progress Videos</h2>
              <div className="empty-state">
                <div className="empty-state-icon">⏱️</div>
                <h3>Resume Your Learning</h3>
                <p>
                  {stats.inProgressVideos > 0
                    ? 'Click on a video to continue watching from where you left off.'
                    : 'Start watching a video to see your progress here.'}
                </p>
                {stats.inProgressVideos === 0 && (
                  <button
                    onClick={() => setActiveTab('all')}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Browse Videos →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="videos-section">
              <h2>Completed Videos</h2>
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h3>Achievement Unlocked</h3>
                <p>
                  {stats.completedVideos > 0
                    ? `Great job! You have completed ${stats.completedVideos} video${stats.completedVideos !== 1 ? 's' : ''}.`
                    : 'Complete videos to earn achievements and track your progress.'}
                </p>
                {stats.completedVideos === 0 && (
                  <button
                    onClick={() => setActiveTab('all')}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--success-color)',
                      color: 'var(--white)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Start Learning →
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="videos-section">
              <h2>Search Videos</h2>
              <AvailableVideos />
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default StudentPage;