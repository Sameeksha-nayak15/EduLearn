import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveVideoProgress, markVideoAsCompleted, getVideoProgress } from '../../services/videoProgress';
import { saveVideoMetadata } from '../../services/indexedDB';
import '../../styles/student.css';

const VideoPlayer = ({ video, onClose }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState(0);

  // Fetch initial progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const progressData = await getVideoProgress(user.id, video.id);
        if (progressData) {
          setProgress(progressData);
          setIsCompleted(progressData.completed);
          // Resume from last watched position
          if (videoRef.current && progressData.last_watched_time > 0) {
            videoRef.current.currentTime = progressData.last_watched_time;
          }
        }

        // Save video metadata to IndexedDB
        await saveVideoMetadata(video);
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [video, user.id]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && user && video) {
        const currentTime = videoRef.current.currentTime;
        if (currentTime > lastSavedTime) {
          saveProgress(currentTime, false);
          setLastSavedTime(currentTime);
        }
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(interval);
  }, [video, user, lastSavedTime]);

  // Save progress on video end
  const handleVideoEnd = async () => {
    try {
      await markVideoAsCompleted(user.id, video.id);
      setIsCompleted(true);
      alert('🎉 Great job! You have completed this video.');
    } catch (err) {
      console.error('Error marking as completed:', err);
      setError(err.message);
    }
  };

  const saveProgress = async (currentTime, completed = false) => {
    try {
      await saveVideoProgress(user.id, video.id, currentTime, completed);
      setProgress({ ...progress, last_watched_time: currentTime, completed });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await markVideoAsCompleted(user.id, video.id);
      setIsCompleted(true);
      alert('✓ Video marked as completed!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed')) {
      videoId = url.split('embed/')[1];
    }
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
  };

  const progressPercent = progress
    ? Math.min((progress.last_watched_time / (videoRef.current?.duration || 1)) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="player-modal-overlay" onClick={onClose}>
        <div className="player-modal" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
            <div className="spinner"></div>
            <p style={{ marginLeft: '1rem' }}>Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <button className="player-close-btn" onClick={onClose}>
        ✕
      </button>

      <div className="player-modal" onClick={(e) => e.stopPropagation()}>
        {/* Video Player */}
        <div className="video-player-container">
          {video.video_type === 'youtube' ? (
            <iframe
              src={getYouTubeEmbedUrl(video.video_url)}
              className="youtube-embed"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={video.title}
            />
          ) : (
            <video
              ref={videoRef}
              className="video-player"
              controls
              onEnded={handleVideoEnd}
              onTimeUpdate={() => {
                // Optional: save progress on time update for smoother tracking
              }}
            >
              <source src={video.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Information */}
        <div className="player-info">
          <h2 className="player-title">{video.title}</h2>

          <div className="player-meta">
            <div className="meta-item">
              📚 <strong>{video.subject}</strong>
            </div>
            <div className="meta-item">
              📅 <strong>{new Date(video.created_at).toLocaleDateString()}</strong>
            </div>
            <div className="meta-item">
              {isCompleted ? (
                <>✅ <strong>Completed</strong></>
              ) : progress && progress.last_watched_time > 0 ? (
                <>
                  ⏱️ <strong>{Math.round(progress.last_watched_time / 60)}m watched</strong>
                </>
              ) : (
                <>▶️ <strong>Not started</strong></>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress && !isCompleted && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="progress-label">
                Progress: {Math.round(progressPercent)}%
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Completion Status */}
          {isCompleted && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: '#dcfce7',
                border: '2px solid var(--success-color)',
                borderRadius: '0.5rem',
                color: '#166534',
                marginBottom: '1rem',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              ✓ You have completed this video!
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          <div className="player-description">{video.description}</div>

          {/* Actions */}
          <div className="player-actions">
            {!isCompleted && (
              <button
                className="action-button btn-mark-complete"
                onClick={handleMarkComplete}
              >
                Mark as Completed
              </button>
            )}
            <button
              className="action-button"
              style={{
                backgroundColor: 'var(--text-secondary)',
                color: 'var(--white)',
              }}
              onClick={onClose}
            >
              Close Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;