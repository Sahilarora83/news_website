import React from 'react';

const DashboardOverview = ({ summary = {}, analytics = {}, slots = [], formatNumber }) => {
  const cityStats = analytics.cityStats || [];
  const sectionCounts = analytics.sectionCounts || [];
  const topCategories = analytics.topCategories || [];

  return (
    <div className="admin-dashboard-view">
      <div className="admin-stats-grid">
        <div className="table-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f5f7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-copy" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Stories</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{formatNumber(summary.totalPosts)}</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-check-circle" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Published</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{formatNumber(summary.published)}</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-border-all" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sections</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{slots.length}</div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            <i className="fas fa-map-pin" />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cities</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>{cityStats.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-form-grid admin-form-grid-two">
        <div className="table-card">
          <header className="card-header">
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Section Distribution</h4>
          </header>
          <div style={{ padding: '24px' }}>
            {sectionCounts.slice(0, 8).map((section) => (
              <div key={section.label} style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{section.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#6366f1', background: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
                    {section.count}
                  </span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 10 }}>
                  <div style={{ width: `${Math.min(100, Math.max(10, (section.count / 10) * 100))}%`, height: '100%', background: '#6366f1', borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card">
          <header className="card-header">
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Top Categories</h4>
          </header>
          <div style={{ padding: '24px' }}>
            {topCategories.slice(0, 8).map((category) => (
              <div key={category.label} style={{ marginBottom: 20 }}>
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{category.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6 }}>
                    {category.count}
                  </span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 10 }}>
                  <div style={{ width: `${Math.min(100, Math.max(10, (category.count / 10) * 100))}%`, height: '100%', background: '#10b981', borderRadius: 10 }} />
                </div>
              </div>
            ))}

            {topCategories.length === 0 ? (
              <div className="empty-state-pro">
                <i className="fas fa-folder-open" />
                <h3>No category data</h3>
                <p>Stories publish karoge to yahan breakdown dikh jayega.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
