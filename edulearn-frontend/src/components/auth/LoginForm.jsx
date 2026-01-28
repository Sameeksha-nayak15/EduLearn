import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../services/validation';
import '../../styles/auth.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error: authError, setError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (authError) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    try {
      // Validate form
      const validation = validateLoginForm(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      setLoading(true);

      // Call login from context
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSuccessMessage('Login successful! Redirecting...');

        // Redirect based on role
        setTimeout(() => {
          if (result.role === 'admin') {
            navigate('/admin');
          } else if (result.role === 'teacher') {
            navigate('/teacher');
          } else if (result.role === 'student') {
            navigate('/student');
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {successMessage && <div className="success-banner">{successMessage}</div>}

      {errors.submit && <div className="error-banner">{errors.submit}</div>}
      {authError && <div className="error-banner">{authError}</div>}

      <div className={`form-group ${errors.email ? 'error' : ''}`}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={loading}
          required
        />
        {errors.email && <div className="form-error">{errors.email}</div>}
      </div>

      <div className={`form-group ${errors.password ? 'error' : ''}`}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Your password"
          disabled={loading}
          required
        />
        {errors.password && <div className="form-error">{errors.password}</div>}
      </div>

      <button
        type="submit"
        className="auth-button primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="loading-spinner"></div> Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={{
              color: 'var(--primary-color)',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Request Access
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;