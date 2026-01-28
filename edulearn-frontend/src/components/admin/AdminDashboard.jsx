import React, { useState, useEffect } from 'react';
import { LogOut, Users, BookOpen, Search, Menu, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nwitcdidqaclokxikrp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53aXRjZGlkcWFjbG9reGlrcnAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMzE3NzY3MCwiZXhwIjoxNzM0NzEzNjcwfQ.7jHcgYnJSp8_UvR7FqnUzGXJNuGrB5m5G5m5G5m5G5m';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AdminDashboard() {
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({ students: 0, teachers: 0, videos: 0, pending: 0 });
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = localStorage.getItem('adminUser');
    if (!user) {
      window.location.href = '/admin/login';
      return;
    }
    setAdminUser(JSON.parse(user));
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel (faster)
      const [usersData, statsResult, pendingData] = await Promise.all([
        supabase.from('users').select('id, email, name, role, college_name, created_at').order('created_at', { ascending: false }),
        fetchStats(),
        supabase.from('pending_requests').select('id, email, name, role, college_name, status, created_at').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      if (usersData.data) setUsers(usersData.data);
      if (pendingData.data) setPendingRequests(pendingData.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { count: studentCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'student');

      const { count: teacherCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'teacher');

      const { count: videoCount } = await supabase
        .from('videos')
        .select('id', { count: 'exact', head: true });

      const { count: pendingCount } = await supabase
        .from('pending_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        students: studentCount || 0,
        teachers: teacherCount || 0,
        videos: videoCount || 0,
        pending: pendingCount || 0,
      });
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleApprovePending = async (requestId, email, name, role, collegeName) => {
    try {
      // Create user account
      const { data: createdUser } = await supabase
        .from('users')
        .insert([{ email, name, role, college_name: collegeName, password: 'TempPassword@123' }])
        .select();

      if (createdUser) {
        // Mark as approved
        await supabase
          .from('pending_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);

        // Refresh data
        await fetchAllData();
        alert(`User ${name} approved and added!`);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    }
  };

  const handleRejectPending = async (requestId) => {
    try {
      await supabase
        .from('pending_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      await fetchAllData();
      alert('Request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!adminUser) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-2xl font-bold text-blue-600">EduLearn Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{adminUser?.name}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
          <div className="p-6 space-y-8">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                  activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${
                  activeTab === 'users' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <Users className="w-5 h-5" />
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition relative ${
                  activeTab === 'pending' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <Users className="w-5 h-5" />
                Pending Requests
                {stats.pending > 0 && (
                  <span className="absolute right-4 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Total Students</p>
                        <p className="text-3xl font-bold mt-2">{stats.students}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Total Teachers</p>
                        <p className="text-3xl font-bold mt-2">{stats.teachers}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Total Videos</p>
                        <p className="text-3xl font-bold mt-2">{stats.videos}</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-red-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-500 text-sm">Pending Requests</p>
                        <p className="text-3xl font-bold mt-2 text-red-600">{stats.pending}</p>
                      </div>
                      <Users className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Users Management</h2>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-12 pr-4 py-2 border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold">Name</th>
                            <th className="text-left py-3 px-4 font-semibold">Email</th>
                            <th className="text-left py-3 px-4 font-semibold">Role</th>
                            <th className="text-left py-3 px-4 font-semibold">College</th>
                            <th className="text-left py-3 px-4 font-semibold">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">{user.name}</td>
                                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                    user.role === 'teacher' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {user.role}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600">{user.college_name || '-'}</td>
                                <td className="py-3 px-4 text-gray-500">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="py-8 text-center text-gray-500">
                                No users found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Pending Signup Requests</h2>

              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="p-6">
                    {pendingRequests.length > 0 ? (
                      <div className="space-y-4">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold text-gray-800">{request.name}</p>
                                <p className="text-sm text-gray-600">{request.email}</p>
                                <p className="text-sm text-gray-600">{request.college_name}</p>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-2 inline-block">
                                  {request.role}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApprovePending(request.id, request.email, request.name, request.role, request.college_name)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPending(request.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No pending requests
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}