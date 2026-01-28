import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import '../styles/auth.css';

const LoginPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎓 EduLearn</h1>
          <p>Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;