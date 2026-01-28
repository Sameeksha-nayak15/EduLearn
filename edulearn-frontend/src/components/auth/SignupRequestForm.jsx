import React, { useState } from 'react';
import { createSignupRequest } from '../../services/auth';
import { validateSignupForm } from '../../services/validation';
import '../../styles/auth.css';

const SignupRequestForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    collegeName: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      role: e.target.value,
    }));
    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');
    setApiError('');

    try {
      // Validate form first
      const customErrors = {};
      if (!formData.name.trim()) {
        customErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        customErrors.name = 'Name must be at least 2 characters';
      }

      if (!formData.email) {
        customErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        customErrors.email = 'Please provide a valid email';
      }

      if (!formData.role) {
        customErrors.role = 'Please select a role';
      }

      if (!formData.collegeName.trim()) {
        customErrors.collegeName = 'College name is required';
      } else if (formData.collegeName.trim().length < 3) {
        customErrors.collegeName = 'College name must be at least 3 characters';
      }

      if (Object.keys(customErrors).length > 0) {
        setErrors(customErrors);
        return;
      }

      setLoading(true);

      // Submit signup request
      const result = await createSignupRequest(
        formData.email,
        formData.name,
        formData.role,
        formData.collegeName
      );

      if (result.success) {
        setSuccessMessage(result.message);
        setFormData({
          name: '',
          email: '',
          role: '',
          collegeName: '',
        });

        // Show success for a few seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setApiError(err.message || 'Failed to submit signup request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {apiError && <div className="error-banner">{apiError}</div>}

      <div className={`form-group ${errors.name ? 'error' : ''}`}>
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          disabled={loading || !!successMessage}
          required
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className={`form-group ${errors.email ? 'error' : ''}`}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={loading || !!successMessage}
          required
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className={`form-group ${errors.role ? 'error' : ''}`}>
        <label htmlFor="role">Select Your Role</label>
        <div className="role-selector">
          <div className="role-option">
            <input
              type="radio"
              id="role-teacher"
              name="role"
              value="teacher"
              checked={formData.role === 'teacher'}
              onChange={handleRoleChange}
              disabled={loading || !!successMessage}
            />
            <label htmlFor="role-teacher">Teacher</label>
          </div>
          <div className="role-option">
            <input
              type="radio"
              id="role-student"
              name="role"
              value="student"
              checked={formData.role === 'student'}
              onChange={handleRoleChange}
              disabled={loading || !!successMessage}
            />
            <label htmlFor="role-student">Student</label>
          </div>
        </div>
        {errors.role && <div className="form-error">{errors.role}</div>}
      </div>

      <div className={`form-group ${errors.collegeName ? 'error' : ''}`}>
        <label htmlFor="collegeName">College/Institution Name</label>
        <input
          type="text"
          id="collegeName"
          name="collegeName"
          value={formData.collegeName}
          onChange={handleChange}
          placeholder="Your college name"
          disabled={loading || !!successMessage}
          required
        />
        {errors.collegeName && <div className="form-error">{errors.collegeName}</div>}
      </div>

      <button
        type="submit"
        className="auth-button primary"
        disabled={loading || !!successMessage}
      >
        {loading ? (
          <>
            <div className="loading-spinner"></div> Submitting...
          </>
        ) : (
          'Request Access'
        )}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Already approved?{' '}
          <a
            href="/login"
            style={{
              color: 'var(--primary-color)',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Sign In
          </a>
        </p>
      </div>
    </form>
  );
};

export default SignupRequestForm;