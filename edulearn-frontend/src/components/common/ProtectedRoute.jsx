import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';
import Error from './Error';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userRole, loading, isApproved } = useAuth();

  if (loading) {
    return <Loading message="Loading..." />;
  }

  if (!user) {
    return (
      <Error
        title="Authentication Required"
        message="Please log in to access this page."
        redirectTo="/login"
      />
    );
  }

  if (!isApproved) {
    return (
      <Error
        title="Access Denied"
        message="Your account has not been approved yet. Please contact the admin."
        redirectTo="/login"
      />
    );
  }

  if (requiredRole && userRole !== requiredRole) {
    return (
      <Error
        title="Access Denied"
        message={`This page is only accessible to ${requiredRole}s.`}
        redirectTo="/login"
      />
    );
  }

  return children;
};

export default ProtectedRoute;