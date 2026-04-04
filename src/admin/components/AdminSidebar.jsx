import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout, user = { role: 'reporter' } }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'fa-chart-line', roles: ['super_admin', 'editor', 'reporter', 'city_manager', 'admin'] },
    { id: 'workflow', label: 'Workflow', icon: 'fa-tasks', roles: ['super_admin', 'editor', 'admin'] },
    { id: 'editor', label: 'Story Editor', icon: 'fa-pen-nib', roles: ['super_admin', 'editor', 'reporter', 'city_manager', 'admin'] },
    { id: 'posts', label: 'Stories', icon: 'fa-file-alt', roles: ['super_admin', 'editor', 'admin'] },
    { id: 'locations', label: 'Locations', icon: 'fa-map-marked-alt', roles: ['super_admin', 'city_manager', 'admin'] },
    { id: 'taxonomy', label: 'Taxonomy', icon: 'fa-folder-open', roles: ['super_admin', 'editor', 'admin'] },
    { id: 'users', label: 'Users', icon: 'fa-users-cog', roles: ['super_admin', 'admin'] },
    { id: 'settings', label: 'Settings', icon: 'fa-cog', roles: ['super_admin', 'admin'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(String(user.role || '').toLowerCase()));

  return (
    <aside className="admin-nav-sidebar">
      <div className="admin-nav-header">
        <div
          className="admin-logo-icon"
          style={{ background: 'var(--admin-primary)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}
        >
          <i className="fas fa-newspaper" />
        </div>
        <div className="admin-logo-text" style={{ fontSize: '16px', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', marginLeft: 12 }}>
          Genda News
        </div>
      </div>

      <nav className="admin-nav-list" style={{ padding: '24px 12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 12px 12px' }}>
          Menu
        </div>

        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            style={{ marginBottom: 4, width: '100%', border: 'none', background: 'transparent', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s' }}
          >
            <i className={`fas ${item.icon}`} style={{ width: '18px', textAlign: 'center', fontSize: '14px' }} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</span>
          </button>
        ))}

        <div className="sidebar-divider" style={{ margin: '20px 12px', height: '1px', background: '#f1f5f9' }} />

        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 12px 12px' }}>
          Account
        </div>

        <button
          className="admin-nav-item"
          onClick={handleLogout}
          style={{ color: '#ef4444', width: '100%', border: 'none', background: 'transparent', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', cursor: 'pointer', borderRadius: '8px' }}
        >
          <i className="fas fa-sign-out-alt" style={{ width: '18px', textAlign: 'center' }} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Logout</span>
        </button>
      </nav>

      <div className="admin-nav-footer" style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
            {user.username?.[0].toUpperCase() || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6366f1', textTransform: 'capitalize' }}>{user.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
