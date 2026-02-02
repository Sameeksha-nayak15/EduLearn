import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwitcdidqaclokkxikrp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_WVtWxgVLrYRiCyinoNLe6A_8jlGrrpn';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminUserData = localStorage.getItem('adminUser');

    if (!adminToken || !adminUserData) {
      window.location.href = '/admin/login';
      return;
    }

    setAdminUser(JSON.parse(adminUserData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch pending requests
      const { data: requests } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      setPendingRequests(requests || []);

      // Fetch stats
      const { count: studentCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: teacherCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'teacher');

      setStats({
        students: studentCount || 0,
        teachers: teacherCount || 0,
        pending: requests?.length || 0
      });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (requestId, email, name, role, collegeName) => {
    try {
      const tempPassword = 'TempPassword@123';

      // Create user
      await supabase.from('users').insert([{
        email: email.toLowerCase(),
        name,
        role,
        college_name: collegeName,
        password: tempPassword
      }]);

      // Update request status
      await supabase
        .from('pending_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      alert(`User ${name} approved!`);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error approving request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await supabase
        .from('pending_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      alert('Request rejected');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error rejecting request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  if (!adminUser) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, <span className="font-semibold">{adminUser.name}</span></span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Students</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.students}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Teachers</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.teachers}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Pending Requests</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pending}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Signup Requests</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{request.name}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        {request.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">{request.email}</p>
                    <p className="text-gray-600 text-sm">{request.college_name}</p>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button
                      onClick={() => handleApprove(request.id, request.email, request.name, request.role, request.college_name)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No pending requests</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}