import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/users';
import '../../styles/admin.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [onlineFilter, setOnlineFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, onlineFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {};
      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }
      if (onlineFilter !== 'all') {
        filters.onlineStatus = onlineFilter === 'online';
      }

      const data = await getAllUsers(filters);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2>User Management</h2>

      {error && <div className="error-banner">{error}</div>}

      <div className="filter-bar">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="teacher">Teachers Only</option>
          <option value="student">Students Only</option>
        </select>

        <select value={onlineFilter} onChange={(e) => setOnlineFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </select>
      </div>

      {users.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No Users Found</h3>
          <p>No users match the selected filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="requests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>College</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="request-row">
                  <td style={{ fontWeight: '500' }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="role-badge">{user.role}</span>
                  </td>
                  <td>{user.college_name}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: user.online_status ? '#10b981' : '#d1d5db',
                        marginRight: '0.5rem',
                      }}
                    ></span>
                    {user.online_status ? 'Online' : 'Offline'}
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--light-bg)', borderRadius: '0.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          <strong>Total Users:</strong> {users.length}
        </p>
      </div>
    </div>
  );
};

export default UsersManagement;