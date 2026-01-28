import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loading from './components/common/Loading';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';
import StudentPage from './pages/StudentPage';

// Styles
import './styles/global.css';

const AppContent = () => {
  const { loading } = useAuth();

  

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;