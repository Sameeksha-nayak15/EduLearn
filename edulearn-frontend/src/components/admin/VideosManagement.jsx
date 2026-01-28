import React, { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo, getVideoWatchStats } from '../../services/videos';
import { getTeacherName } from '../../services/users';
import '../../styles/admin.css';

const VideosManagement = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoStats, setVideoStats] = useState({});
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAllVideos();
      setVideos(data);

      // Fetch stats for each video
      const stats = {};
      for (const video of data) {
        try {
          const videoStats = await getVideoWatchStats(video.id);
          stats[video.id] = videoStats;
        } catch (err) {
          console.error(`Error fetching stats for video ${video.id}:`, err);
          stats[video.id] = { totalWatches: 0, completed: 0, inProgress: 0 };
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
      alert('Video deleted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2>Video Management</h2>

      {error && <div className="error-banner">{error}</div>}

      {videos.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📹</div>
          <h3>No Videos</h3>
          <p>No videos have been uploaded yet.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="videos-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Uploaded By</th>
                  <th>Views</th>
                  <th>Completed</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => {
                  const stats = videoStats[video.id] || { totalWatches: 0, completed: 0 };
                  return (
                    <tr key={video.id}>
                      <td style={{ fontWeight: '500', maxWidth: '250px' }}>
                        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {video.title}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`video-type-badge ${
                            video.video_type === 'youtube' ? 'type-youtube' : 'type-uploaded'
                          }`}
                        >
                          {video.video_type}
                        </span>
                      </td>
                      <td>
                        <TeacherNameDisplay teacherId={video.uploaded_by} />
                      </td>
                      <td>
                        <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                          {stats.totalWatches}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.95rem' }}>
                          {stats.completed}/{stats.totalWatches}
                        </div>
                      </td>
                      <td>{new Date(video.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(video.id, video.storage_path)}
                          disabled={deleting === video.id}
                        >
                          {deleting === video.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              <strong>Total Videos:</strong> {videos.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// Helper component to fetch and display teacher name
const TeacherNameDisplay = ({ teacherId }) => {
  const [teacherName, setTeacherName] = useState('Loading...');

  useEffect(() => {
    const fetchName = async () => {
      try {
        const name = await getTeacherName(teacherId);
        setTeacherName(name);
      } catch (err) {
        setTeacherName('Unknown');
      }
    };

    fetchName();
  }, [teacherId]);

  return <span>{teacherName}</span>;
};

export default VideosManagement;