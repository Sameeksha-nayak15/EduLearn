import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVideosByTeacher, deleteVideo, getVideoWatchStats } from '../../services/videos';
import '../../styles/teacher.css';

const VideoList = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [videoStats, setVideoStats] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getVideosByTeacher(user.id);
      setVideos(data);

      // Fetch stats for each video
      const stats = {};
      for (const video of data) {
        try {
          const videoStats = await getVideoWatchStats(video.id);
          stats[video.id] = videoStats;
        } catch (err) {
          console.error(`Error fetching stats for video ${video.id}:`, err);
          stats[video.id] = { totalWatches: 0, completed: 0, inProgress: 0, avgWatchTime: 0 };
        }
      }
      setVideoStats(stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId, storagePath) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setDeleting(videoId);
      setError('');
      await deleteVideo(videoId, storagePath);

      setVideos(videos.filter((v) => v.id !== videoId));
      setSelectedVideo(null);
      alert('Video deleted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="video-section">
      <h2>My Videos ({videos.length})</h2>

      {error && <div className="error-banner">{error}</div>}

      {videos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📹</div>
          <h3>No Videos Yet</h3>
          <p>Start by uploading your first video to get students engaged!</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map((video) => {
            const stats = videoStats[video.id] || { totalWatches: 0, completed: 0, inProgress: 0, avgWatchTime: 0 };

            return (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  📹
                  <span className={`video-type-indicator type-${video.video_type}`}>
                    {video.video_type}
                  </span>
                </div>

                <div className="video-body">
                  <div className="video-title">{video.title}</div>

                  <div className="video-subject">{video.subject}</div>

                  <div className="video-description">
                    {video.description}
                  </div>

                  <div className="video-meta">
                    <div className="video-date">
                      📅 {new Date(video.created_at).toLocaleDateString()}
                    </div>
                    <div className="video-views">
                      👁️ {stats.totalWatches}
                    </div>
                  </div>

                  {/* Stats Preview */}
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--light-bg)',
                    borderRadius: '0.375rem',
                    marginBottom: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    <div style={{ marginBottom: '0.25rem' }}>
                      ✓ Completed: <strong>{stats.completed}/{stats.totalWatches}</strong>
                    </div>
                    <div>
                      ⏱️ Avg Time: <strong>{Math.round(stats.avgWatchTime / 60)} min</strong>
                    </div>
                  </div>

                  <div className="video-actions">
                    <button
                      className="video-action-btn btn-edit"
                      onClick={() => setSelectedVideo(video)}
                    >
                      📊 Details
                    </button>
                    <button
                      className="video-action-btn btn-delete"
                      onClick={() => handleDelete(video.id, video.storage_path)}
                      disabled={deleting === video.id}
                    >
                      {deleting === video.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Details Modal */}
      {selectedVideo && (
        <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Video Details</h2>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Title
                </label>
                <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '500' }}>
                  {selectedVideo.title}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Description
                </label>
                <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {selectedVideo.description}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Subject
                </label>
                <p style={{ color: 'var(--text-primary)' }}>
                  {selectedVideo.subject}
                </p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase' }}>
                  Watch Statistics
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  marginTop: '0.5rem',
                }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                      {videoStats[selectedVideo.id]?.totalWatches || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Total Views
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--success-color)' }}>
                      {videoStats[selectedVideo.id]?.completed || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Completed
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--warning-color)' }}>
                      {videoStats[selectedVideo.id]?.inProgress || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      In Progress
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.375rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8b5cf6' }}>
                      {Math.round((videoStats[selectedVideo.id]?.avgWatchTime || 0) / 60)} m
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      Avg Time
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '0.375rem', borderLeft: '3px solid var(--primary-color)' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  📅 Uploaded: {new Date(selectedVideo.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setSelectedVideo(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--light-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;