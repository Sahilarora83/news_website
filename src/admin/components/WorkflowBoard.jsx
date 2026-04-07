import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../../lib/api';

const itemCardMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
  alignItems: 'center',
};

function WorkflowCard({ item, formatDateTime, onPublish, onReject, onRestoreDraft, openEditor }) {
  const canOpen = item.itemType === 'story' && openEditor;

  return (
    <div
      className="table-card admin-compact-card"
      onClick={canOpen ? () => openEditor(item.id) : undefined}
      style={{ cursor: canOpen ? 'pointer' : 'default' }}
    >
      <div style={itemCardMetaStyle}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>
            {item.itemType === 'short' ? 'Short' : 'Story'}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            {item.city || 'General'}
          </span>
          {item.category ? (
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{item.category}</span>
          ) : null}
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {formatDateTime(item.updated_at || item.updatedAt || item.created_at || item.createdAt)}
        </span>
      </div>

      <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.5, color: '#111827' }}>
        {item.title || item.headlineShort || 'Untitled'}
      </h5>

      {item.description || item.excerpt ? (
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#6b7280', lineHeight: 1.55 }}>
          {item.description || item.excerpt}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} onClick={(event) => event.stopPropagation()}>
        <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onPublish(item)}>
          Publish
        </button>
        {item.status !== 'rejected' ? (
          <button className="btn-secondary" onClick={() => onReject(item)}>
            Reject
          </button>
        ) : null}
        {item.status === 'review' || item.status === 'pending' ? (
          <button className="btn-ghost" onClick={() => onRestoreDraft(item)}>
            Un-review
          </button>
        ) : null}
      </div>
    </div>
  );
}

const WorkflowBoard = ({ authHeaders, formatDateTime, openEditor, onStoryStatusChange, onShortStatusChange, items = [] }) => {
  const [queue, setQueue] = useState(items);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const [storyResponse, shortsResponse] = await Promise.all([
        fetch(apiUrl('/api/admin/posts/queue'), { headers: authHeaders }),
        fetch(apiUrl('/api/admin/shorts'), { headers: authHeaders }),
      ]);

      const storyData = await storyResponse.json().catch(() => ({ items: [] }));
      const shortsData = await shortsResponse.json().catch(() => ({ items: [] }));

      const storyItems = (storyData.items || []).map((item) => ({
        ...item,
        itemType: 'story',
      }));

      const shortItems = (shortsData.items || [])
        .filter((item) => ['review', 'pending', 'rejected'].includes(item.status))
        .map((item) => ({
          ...item,
          itemType: 'short',
        }));

      setQueue([...storyItems, ...shortItems]);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQueue(items);
    setLoading(false);
  }, [items]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchQueue();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleItemStatusChange = async (item, newStatus) => {
    try {
      if (item.itemType === 'short') {
        await onShortStatusChange?.(item, newStatus);
      } else {
        await onStoryStatusChange?.(item.id, newStatus);
      }
      setQueue((current) =>
        current
          .map((entry) =>
            `${entry.itemType}-${entry.id}` === `${item.itemType}-${item.id}`
              ? { ...entry, status: newStatus, updatedAt: new Date().toISOString(), updated_at: new Date().toISOString() }
              : entry,
          )
          .filter((entry) => ['review', 'pending', 'rejected'].includes(entry.status)),
      );
    } catch {
      window.alert('Status update failed');
    }
  };

  const pendingItems = useMemo(
    () => queue.filter((item) => item.status === 'pending' || item.status === 'review'),
    [queue],
  );
  const rejectedItems = useMemo(() => queue.filter((item) => item.status === 'rejected'), [queue]);

  return (
    <div className="admin-workflow-board">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-page-title">Workflow</h2>
          <p className="admin-page-note">Yahan review aur rejected stories plus shorts milenge. Publish, reject, ya un-review yahin se manage karo.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-screen" style={{ height: '240px' }}>Workflow items load ho rahe hain...</div>
      ) : (
        <div className="admin-form-grid admin-form-grid-two">
          <section className="form-section-card" style={{ minHeight: '320px' }}>
            <header className="card-header admin-card-header-plain">
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Under Review</h4>
              <span className="badge-status draft">{pendingItems.length}</span>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingItems.length > 0 ? (
                pendingItems.map((item) => (
                  <WorkflowCard
                    key={`${item.itemType}-${item.id}`}
                    item={item}
                    formatDateTime={formatDateTime}
                    openEditor={openEditor}
                    onPublish={(current) => handleItemStatusChange(current, 'published')}
                    onReject={(current) => handleItemStatusChange(current, 'rejected')}
                    onRestoreDraft={(current) => handleItemStatusChange(current, 'draft')}
                  />
                ))
              ) : (
                <div className="empty-state-pro">
                  <i className="fas fa-check-circle" />
                  <h3>No story under review</h3>
                  <p>Review ke liye abhi koi naya story ya short nahi hai.</p>
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
              {rejectedItems.length > 0 ? (
                rejectedItems.map((item) => (
                  <WorkflowCard
                    key={`${item.itemType}-${item.id}`}
                    item={item}
                    formatDateTime={formatDateTime}
                    openEditor={openEditor}
                    onPublish={(current) => handleItemStatusChange(current, 'published')}
                    onReject={(current) => handleItemStatusChange(current, 'rejected')}
                    onRestoreDraft={(current) => handleItemStatusChange(current, 'draft')}
                  />
                ))
              ) : (
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
