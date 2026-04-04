import React from 'react';

const AdminHeader = ({ query, setQuery, user = { username: 'Admin', role: 'administrator' } }) => {
  return (
    <header
      className="admin-header-v2"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f1f5f9',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
        <i className="fas fa-search" style={{ position: 'absolute', left: 16, top: 12, color: '#94a3b8' }} />
        <input
          className="input-modern"
          style={{ paddingLeft: '44px', width: '100%', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
          placeholder="Search stories, categories, cities..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button className="btn-secondary" style={{ height: 38, fontSize: '13px', fontWeight: 700 }} onClick={() => window.open('/', '_blank')}>
          View Site <i className="fas fa-external-link-alt" style={{ marginLeft: 8 }} />
        </button>

        <div style={{ width: 1, height: 24, background: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>{user.username || 'Admin'}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase' }}>
              {String(user.role || 'administrator').replace('_', ' ')}
            </div>
          </div>
          <div style={{ width: 38, height: 38, borderRadius: '12px', background: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
            {(user.username || 'A').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
