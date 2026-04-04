import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';

const WorkflowBoard = ({ authHeaders, formatDateTime, openEditor }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/posts/queue'), { headers: authHeaders });
      const data = await response.json();
      setQueue(data.items || []);
    } catch (error) {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await fetch(apiUrl(`/api/admin/posts/${postId}/status`), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus, comments: '' }),
      });

      if (response.ok) {
        fetchQueue();
      }
    } catch (error) {
      window.alert('Status update failed');
    }
  };

  const pendingItems = queue.filter((item) => item.status === 'pending');
  const rejectedItems = queue.filter((item) => item.status === 'rejected');

  return (
    <div className="admin-workflow-board">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-page-title">Workflow</h2>
          <p className="admin-page-note">Pending aur rejected stories yahan milengi.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-screen" style={{ height: '240px' }}>Stories load ho rahi hain...</div>
      ) : (
        <div className="admin-form-grid admin-form-grid-two">
          <section className="form-section-card" style={{ minHeight: '320px' }}>
            <header className="card-header admin-card-header-plain">
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Pending Review</h4>
              <span className="badge-status draft">{pendingItems.length}</span>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingItems.length > 0 ? pendingItems.map((post) => (
                <div
                  key={post.id}
                  className="table-card admin-compact-card"
                  onClick={openEditor ? () => openEditor(post.id) : undefined}
                  style={{ cursor: openEditor ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1' }}>
                      {post.city || 'General'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {formatDateTime(post.updated_at)}
                    </span>
                  </div>
                  <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px', lineHeight: 1.5, color: '#111827' }}>
                    {post.headline}
                  </h5>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(post.id, 'published');
                      }}
                    >
                      Publish
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(post.id, 'rejected');
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )) : (
                <div className="empty-state-pro">
                  <i className="fas fa-check-circle" />
                  <h3>No pending story</h3>
                  <p>Review ke liye abhi koi नई story नहीं है.</p>
                </div>
              )}
            </div>
          </section>

          <section className="form-section-card" style={{ minHeight: '320px' }}>
            <header className="card-header admin-card-header-plain">
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Rejected</h4>
              <span className="badge-status draft">{rejectedItems.length}</span>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {rejectedItems.length > 0 ? rejectedItems.map((post) => (
                <div key={post.id} className="table-card admin-compact-card" style={{ opacity: 0.95 }}>
                  <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px', color: '#111827' }}>
                    {post.headline}
                  </h5>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                    {post.internal_comments || 'Koi comment nahi diya gaya.'}
                  </p>
                </div>
              )) : (
                <div className="empty-state-pro">
                  <i className="fas fa-folder-open" />
                  <h3>No rejected story</h3>
                  <p>Rejected list abhi khali hai.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default WorkflowBoard;
