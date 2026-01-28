import React, { useState, useEffect } from 'react';
import { getUserStatistics } from '../../services/users';
import { getVideoAnalytics, getAllVideos } from '../../services/videos';
import { getPendingRequests } from '../../services/auth';
import '../../styles/admin.css';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    onlineStudents: 0,
    onlineTeachers: 0,
  });

  const [videoAnalytics, setVideoAnalytics] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError('');
      const [statsData, analyticsData, pendingData] = await Promise.all([
        getUserStatistics(),
        getVideoAnalytics(),
        getPendingRequests(),
      ]);

      setStats(statsData);
      setVideoAnalytics(analyticsData);
      setPendingCount(pendingData.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Overview */}
      <div className="admin-section">
        <h2>Overview</h2>

        <div className="stats-grid">
          <div className="stat-card students">
            <div className="stat-label">Total Students</div>
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-subtext">
              {stats.onlineStudents} online now
            </div>
          </div>

          <div className="stat-card teachers">
            <div className="stat-label">Total Teachers</div>
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-subtext">
              {stats.onlineTeachers} online now
            </div>
          </div>

          <div className="stat-card online">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{stats.onlineStudents + stats.onlineTeachers}</div>
            <div className="stat-subtext">
              {Math.round(
                ((stats.onlineStudents + stats.onlineTeachers) /
                  (stats.totalStudents + stats.totalTeachers)) *
                  100
              ) || 0}% online
            </div>
          </div>

          <div className="stat-card requests">
            <div className="stat-label">Pending Requests</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-subtext">Awaiting approval</div>
          </div>
        </div>
      </div>

      {/* Video Analytics */}
      <div className="admin-section">
        <h2>Video Analytics</h2>

        {error && <div className="error-banner">{error}</div>}

        {videoAnalytics.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📹</div>
            <h3>No Videos Yet</h3>
            <p>Videos will appear here once teachers start uploading.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="videos-table">
              <thead>
                <tr>
                  <th>Video Title</th>
                  <th>Uploaded By</th>
                  <th>Students Watched</th>
                  <th>Upload Date</th>
                </tr>
              </thead>
              <tbody>
                {videoAnalytics.map((video) => (
                  <tr key={video.id}>
                    <td style={{ fontWeight: '500', maxWidth: '300px' }}>
                      <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {video.title}
                      </div>
                    </td>
                    <td>{video.teacher_name}</td>
                    <td>
                      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary-color)' }}>
                        {video.watch_count}
                      </div>
                    </td>
                    <td>{new Date(video.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {videoAnalytics.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Summary</h3>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <div className="stat-label">Total Videos</div>
                <div className="stat-value">{videoAnalytics.length}</div>
              </div>
              <div>
                <div className="stat-label">Total Views</div>
                <div className="stat-value">
                  {videoAnalytics.reduce((sum, v) => sum + v.watch_count, 0)}
                </div>
              </div>
              <div>
                <div className="stat-label">Average Views</div>
                <div className="stat-value">
                  {Math.round(
                    videoAnalytics.reduce((sum, v) => sum + v.watch_count, 0) /
                      videoAnalytics.length
                  )}
                </div>
              </div>
              <div>
                <div className="stat-label">Most Watched</div>
                <div className="stat-value">
                  {Math.max(...videoAnalytics.map((v) => v.watch_count), 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;