import React from 'react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading" style={{ minHeight: '100vh' }}>
      <div className="flex-col" style={{ alignItems: 'center', gap: '1rem' }}>
        <div className="spinner"></div>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Loading;