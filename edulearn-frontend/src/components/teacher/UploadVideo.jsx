import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadYouTubeVideo, uploadVideoFile } from '../../services/videos';
import { validateVideoUploadForm, validateYouTubeUrl } from '../../services/validation';
import '../../styles/teacher.css';

const UploadVideo = ({ onVideoUploaded }) => {
  const { user } = useAuth();
  const [uploadType, setUploadType] = useState('youtube');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    youtubeUrl: '',
    videoFile: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        videoFile: file,
      }));
      setFileName(file.name);
      if (errors.videoFile) {
        setErrors((prev) => ({
          ...prev,
          videoFile: '',
        }));
      }
    }
  };

  const handleYouTubeChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      youtubeUrl: value,
    }));
    if (errors.youtubeUrl) {
      setErrors((prev) => ({
        ...prev,
        youtubeUrl: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      // Validate form
      const validationData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        uploadType,
        youtubeUrl: uploadType === 'youtube' ? formData.youtubeUrl : '',
        videoFile: uploadType === 'file' ? formData.videoFile : null,
      };

      const validation = validateVideoUploadForm(validationData);

      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setLoading(true);

      let uploadedVideo;

      if (uploadType === 'youtube') {
        // Validate YouTube URL and extract video ID
        const youtubeValidation = validateYouTubeUrl(formData.youtubeUrl);
        if (!youtubeValidation.isValid) {
          setErrors({ youtubeUrl: youtubeValidation.error });
          setLoading(false);
          return;
        }

        uploadedVideo = await uploadYouTubeVideo({
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          videoUrl: formData.youtubeUrl,
          uploadedBy: user.id,
        });
      } else {
        // Upload file
        uploadedVideo = await uploadVideoFile(formData.videoFile, {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          uploadedBy: user.id,
        });
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        youtubeUrl: '',
        videoFile: null,
      });
      setFileName('');
      setSuccessMessage('Video uploaded successfully!');

      // Callback
      if (onVideoUploaded) {
        onVideoUploaded(uploadedVideo);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-card">
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Upload Video</h2>

      {successMessage && <div className="success-banner">{successMessage}</div>}
      {errors.submit && <div className="error-banner">{errors.submit}</div>}

      <div className="upload-tabs">
        <button
          className={`upload-tab ${uploadType === 'youtube' ? 'active' : ''}`}
          onClick={() => {
            setUploadType('youtube');
            setErrors({});
          }}
        >
          📺 YouTube Link
        </button>
        <button
          className={`upload-tab ${uploadType === 'file' ? 'active' : ''}`}
          onClick={() => {
            setUploadType('file');
            setErrors({});
          }}
        >
          📁 Upload File
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
        <div className={`form-group ${errors.title ? 'error' : ''}`}>
          <label htmlFor="title">Video Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleTextChange}
            placeholder="Enter video title"
            disabled={loading}
            required
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className={`form-group ${errors.description ? 'error' : ''}`}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleTextChange}
            placeholder="Enter video description"
            disabled={loading}
            required
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <div className={`form-group ${errors.subject ? 'error' : ''}`}>
          <label htmlFor="subject">Subject/Topic</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleTextChange}
            placeholder="e.g., Mathematics, Science, History"
            disabled={loading}
            required
          />
          {errors.subject && <div className="form-error">{errors.subject}</div>}
        </div>

        {/* YouTube URL Field */}
        {uploadType === 'youtube' && (
          <div className={`form-group ${errors.youtubeUrl ? 'error' : ''}`}>
            <label htmlFor="youtubeUrl">YouTube URL</label>
            <input
              type="text"
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleYouTubeChange}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={loading}
              required
            />
            {errors.youtubeUrl && <div className="form-error">{errors.youtubeUrl}</div>}
            <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Paste the YouTube video URL (supports youtube.com and youtu.be links)
            </small>
          </div>
        )}

        {/* File Upload Field */}
        {uploadType === 'file' && (
          <div className={`form-group ${errors.videoFile ? 'error' : ''}`}>
            <label htmlFor="videoFile">Video File</label>
            <div className="file-input-wrapper">
              <input
                type="file"
                id="videoFile"
                name="videoFile"
                onChange={handleFileChange}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                disabled={loading}
                required
              />
              <label htmlFor="videoFile" className="file-input-label">
                <span>
                  <div className="file-input-icon">📁</div>
                  <strong>Click to upload or drag and drop</strong>
                  <span style={{ fontSize: '0.875rem' }}>MP4, WebM, OGG, or MOV (Max 500MB)</span>
                </span>
              </label>
            </div>
            {fileName && <div className="file-name">Selected: {fileName}</div>}
            {errors.videoFile && <div className="form-error">{errors.videoFile}</div>}
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? '⏳ Uploading...' : '✓ Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default UploadVideo;