import React from 'react';
import { useNavigate } from 'react-router-dom';

const Error = ({ title = 'Error', message = 'Something went wrong.', redirectTo = '/' }) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ marginBottom: '0.5rem' }}>{title}</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{message}</p>
        <button className="btn-primary" onClick={() => navigate(redirectTo)}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Error;
