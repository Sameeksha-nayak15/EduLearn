import React from 'react';
import SignupRequestForm from '../components/auth/SignupRequestForm';
import '../styles/auth.css';

const SignupPage = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎓 EduLearn</h1>
          <p>Request access to join</p>
        </div>
        <SignupRequestForm />
      </div>
    </div>
  );
};

export default SignupPage;