import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllVideos, getAllSubjects, searchVideos } from '../../services/videos';
import { getVideoProgress, getCompletedVideos } from '../../services/videoProgress';
import { getTeacherName } from '../../services/users';
import VideoPlayer from './VideoPlayer';
import '../../styles/student.css';

const AvailableVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [completedVideos, setCompletedVideos] = useState([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all videos
      const videosData = await getAllVideos();
      setVideos(videosData);

      // Fetch all subjects
      const subjectsData = await getAllSubjects();
      setSubjects(subjectsData);

      // Fetch progress for all videos
      const progressMap = {};
      for (const video of videosData) {
        try {
          const progress = await getVideoProgress(user.id, video.id);
          if (progress) {
            progressMap[video.id] = progress;
          }
        } catch (err) {
          // Progress doesn't exist yet
        }
      }
      setVideoProgress(progressMap);

      // Fetch completed videos
      const completed = await getCompletedVideos(user.id);
      setCompletedVideos(completed);

      // Apply initial filters
      filterVideos(videosData, progressMap, 'all', '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = (videosData, progressMap, subject, search) => {
    let filtered = videosData;

    // Filter by subject
    if (subject !== 'all') {
      filtered = filtered.filter((v) => v.subject === subject);
    }

    // Filter by search term
    if (search.trim()) {
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterVideos(videos, videoProgress, selectedSubject, value);
  };

  const handleSubjectFilter = (value) => {
    setSelectedSubject(value);
    filterVideos(videos, videoProgress, value, searchTerm);
  };

  const getProgressPercent = (videoId) => {
    const progress = videoProgress[videoId];
    if (!progress) return 0;

    // Assume average video length of 1 hour
    const estimatedDuration = 3600;
    return Math.min((progress.last_watched_time / estimatedDuration) * 100, 100);
  };

  const getVideoStatus = (videoId) => {
    if (completedVideos.includes(videoId)) {
      return 'completed';
    }
    if (videoProgress[videoId]) {
      return 'in-progress';
    }
    return 'not-started';
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
    <>
      {error && <div className="error-banner">{error}</div>}

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search videos by title or topic..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedSubject}
          onChange={(e) => handleSubjectFilter(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Videos Grid */}
      <div className="videos-section">
        <h2>
          Available Videos ({filteredVideos.length})
        </h2>

        {filteredVideos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📹</div>
            <h3>No Videos Found</h3>
            <p>
              {videos.length === 0
                ? 'No videos have been uploaded yet. Check back soon!'
                : 'No videos match your search criteria. Try different keywords.'}
            </p>
          </div>
        ) : (
          <div className="videos-grid">
            {filteredVideos.map((video) => {
              const status = getVideoStatus(video.id);
              const progressPercent = getProgressPercent(video.id);

              return (
                <div
                  key={video.id}
                  className="video-card"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="video-thumbnail">
                    📹
                    <div className="video-overlay">▶️</div>
                    {progressPercent > 0 && (
                      <div
                        className="progress-bar-small"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    )}
                  </div>

                  <div className="video-body">
                    <div className="video-title">{video.title}</div>

                    <div className="video-teacher">
                      by <TeacherNameDisplay teacherId={video.uploaded_by} />
                    </div>

                    <div className="video-meta">
                      <div className="video-subject">{video.subject}</div>
                      <div className="video-status">
                        <span
                          className={`status-badge status-${status}`}
                        >
                          {status === 'completed'
                            ? '✓ Done'
                            : status === 'in-progress'
                            ? '⏱️ In Progress'
                            : '○ Start'}
                        </span>
                      </div>
                    </div>

                    {status === 'in-progress' && (
                      <div className="progress-info">
                        <div className="progress-label">Progress</div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button className="watch-button">
                      {status === 'completed'
                        ? '👁️ Review'
                        : status === 'in-progress'
                        ? '▶️ Resume'
                        : '▶️ Watch'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
};

// Helper component to fetch and display teacher name
const TeacherNameDisplay = ({ teacherId }) => {
  const [teacherName, setTeacherName] = useState('Teacher');

  useEffect(() => {
    const fetchName = async () => {
      try {
        const name = await getTeacherName(teacherId);
        setTeacherName(name);
      } catch (err) {
        setTeacherName('Teacher');
      }
    };

    fetchName();
  }, [teacherId]);

  return <span>{teacherName}</span>;
};

export default AvailableVideos;