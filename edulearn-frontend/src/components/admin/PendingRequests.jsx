import React, { useState, useEffect } from 'react';
import { getPendingRequests, approvePendingRequest, rejectPendingRequest } from '../../services/auth';
import '../../styles/admin.css';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!tempPassword.trim()) {
      setError('Please enter a temporary password');
      return;
    }

    // Validate password strength
    if (tempPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setApproving(true);
      setError('');
      await approvePendingRequest(requestId, tempPassword);

      // Remove from list and show success
      setRequests(requests.filter((r) => r.id !== requestId));
      setSelectedRequest(null);
      setTempPassword('');

      // Show success message
      alert('Request approved successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    try {
      setRejecting(true);
      setError('');
      await rejectPendingRequest(requestId);

      setRequests(requests.filter((r) => r.id !== requestId));
      setSelectedRequest(null);

      alert('Request rejected successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading pending requests...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <h2>Pending Signup Requests</h2>

      {error && <div className="error-banner">{error}</div>}

      {requests.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">✅</div>
          <h3>No Pending Requests</h3>
          <p>All signup requests have been processed.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>College</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="request-row">
                    <td style={{ fontWeight: '500' }}>{request.name}</td>
                    <td>{request.email}</td>
                    <td>
                      <span className="role-badge">{request.role}</span>
                    </td>
                    <td>{request.college_name}</td>
                    <td>{new Date(request.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn approve"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Approve
                        </button>
                        <button
                          className="action-btn reject"
                          onClick={() => handleReject(request.id)}
                          disabled={rejecting}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Approval Modal */}
          {selectedRequest && (
            <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Approve Request</h2>
                </div>

                <div className="modal-body">
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Approving request for:
                    </p>
                    <div className="card" style={{ backgroundColor: 'var(--light-bg)' }}>
                      <p style={{ marginBottom: '0.5rem' }}>
                        <strong>Name:</strong> {selectedRequest.name}
                      </p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        <strong>Email:</strong> {selectedRequest.email}
                      </p>
                      <p style={{ marginBottom: '0.5rem' }}>
                        <strong>Role:</strong> {selectedRequest.role}
                      </p>
                      <p>
                        <strong>College:</strong> {selectedRequest.college_name}
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tempPassword">Set Temporary Password</label>
                    <input
                      type="password"
                      id="tempPassword"
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      disabled={approving}
                    />
                    <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                      The user will receive this password and can change it after login.
                    </small>
                  </div>

                  {error && <div className="error-banner">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedRequest(null)}
                    disabled={approving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(selectedRequest.id)}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingRequests;