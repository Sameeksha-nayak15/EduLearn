import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call your backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        // Check if user is admin
        if (result.user.role === 'admin') {
          setSuccess('Login successful! Redirecting to dashboard...');
          localStorage.setItem('adminToken', 'admin_' + result.user.id);
          localStorage.setItem('adminUser', JSON.stringify(result.user));
          
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1000);
        } else {
          setError('Admin access only');
          setLoading(false);
        }
      } else {
        setError(result.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
            <p className="text-gray-500 mt-2 text-sm">EduLearn Management Portal</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edulearn.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-gray-200"></div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>For security purposes, this portal is for administrators only.</p>
          </div>
        </div>

        {/* Support Box */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur border border-white border-opacity-20 rounded-xl p-4 text-white text-sm">
          <p className="font-semibold mb-1">Need Access?</p>
          <p className="opacity-90">Contact your system administrator for login credentials.</p>
        </div>
      </div>
    </div>
  );
}