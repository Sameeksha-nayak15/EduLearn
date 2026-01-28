/**
 * Validation utilities for form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Password must be at least 8 characters with uppercase, lowercase, and number
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, errors: string[]}}
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate name (non-empty, reasonable length)
 * @param {string} name - Name to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateName = (name) => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Name must be less than 100 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate college name
 * @param {string} collegeName - College name to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateCollegeName = (collegeName) => {
  const trimmedName = collegeName.trim();

  if (!trimmedName) {
    return { isValid: false, error: 'College name is required' };
  }

  if (trimmedName.length < 3) {
    return { isValid: false, error: 'College name must be at least 3 characters long' };
  }

  if (trimmedName.length > 150) {
    return { isValid: false, error: 'College name must be less than 150 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate video title
 * @param {string} title - Video title to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateVideoTitle = (title) => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return { isValid: false, error: 'Video title is required' };
  }

  if (trimmedTitle.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters long' };
  }

  if (trimmedTitle.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate video description
 * @param {string} description - Description to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateVideoDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: false, error: 'Description is required' };
  }

  if (description.trim().length < 10) {
    return { isValid: false, error: 'Description must be at least 10 characters long' };
  }

  if (description.length > 2000) {
    return { isValid: false, error: 'Description must be less than 2000 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate subject
 * @param {string} subject - Subject to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateSubject = (subject) => {
  if (!subject || subject.trim() === '') {
    return { isValid: false, error: 'Subject is required' };
  }

  if (subject.trim().length < 2) {
    return { isValid: false, error: 'Subject must be at least 2 characters long' };
  }

  if (subject.length > 100) {
    return { isValid: false, error: 'Subject must be less than 100 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate YouTube URL
 * @param {string} url - URL to validate
 * @returns {{isValid: boolean, videoId: string | null, error: string | null}}
 */
export const validateYouTubeUrl = (url) => {
  if (!url || url.trim() === '') {
    return { isValid: false, videoId: null, error: 'YouTube URL is required' };
  }

  // Extract video ID from various YouTube URL formats
  let videoId = null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([-\w]{11})/,
    /(?:youtu\.be\/)([-\w]{11})/,
    /(?:youtube\.com\/embed\/)([-\w]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) {
    return {
      isValid: false,
      videoId: null,
      error: 'Please provide a valid YouTube URL (youtube.com or youtu.be)',
    };
  }

  return { isValid: true, videoId, error: null };
};

/**
 * Validate video file
 * @param {File} file - File to validate
 * @returns {{isValid: boolean, error: string | null}}
 */
export const validateVideoFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Please select a video file' };
  }

  const maxSizeInMB = 500; // 500MB limit
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  const allowedMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid video file (MP4, WebM, OGG, or MOV)',
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate entire signup form
 * @param {object} formData - Form data object
 * @returns {{isValid: boolean, errors: object}}
 */
export const validateSignupForm = (formData) => {
  const errors = {};

  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }

  const emailValidation = isValidEmail(formData.email);
  if (!emailValidation) {
    errors.email = 'Please provide a valid email address';
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.errors[0];
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!formData.role) {
    errors.role = 'Please select a role';
  }

  const collegeValidation = validateCollegeName(formData.collegeName);
  if (!collegeValidation.isValid) {
    errors.collegeName = collegeValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate entire login form
 * @param {object} formData - Form data object
 * @returns {{isValid: boolean, errors: object}}
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  const emailValidation = isValidEmail(formData.email);
  if (!emailValidation) {
    errors.email = 'Please provide a valid email address';
  }

  if (!formData.password || formData.password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate video upload form
 * @param {object} formData - Form data object
 * @returns {{isValid: boolean, errors: object}}
 */
export const validateVideoUploadForm = (formData) => {
  const errors = {};

  const titleValidation = validateVideoTitle(formData.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }

  const descriptionValidation = validateVideoDescription(formData.description);
  if (!descriptionValidation.isValid) {
    errors.description = descriptionValidation.error;
  }

  const subjectValidation = validateSubject(formData.subject);
  if (!subjectValidation.isValid) {
    errors.subject = subjectValidation.error;
  }

  // Check if either YouTube URL or file is provided
  if (formData.uploadType === 'youtube') {
    const youtubeValidation = validateYouTubeUrl(formData.youtubeUrl);
    if (!youtubeValidation.isValid) {
      errors.youtubeUrl = youtubeValidation.error;
    }
  } else if (formData.uploadType === 'file') {
    const fileValidation = validateVideoFile(formData.videoFile);
    if (!fileValidation.isValid) {
      errors.videoFile = fileValidation.error;
    }
  } else {
    errors.uploadType = 'Please select an upload type';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};