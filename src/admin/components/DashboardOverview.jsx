import React from 'react';

const DashboardOverview = ({ summary = {}, analytics = {}, slots = [], formatNumber }) => {
  const cityStats = analytics.cityStats || [];
  const sectionCounts = analytics.sectionCounts || [];
  const topCategories = analytics.topCategories || [];
  const statCards = [
    {
      label: 'Total Stories',
      value: formatNumber(summary.totalPosts),
      icon: 'fa-copy',
      tone: 'violet',
      note: 'All stories in the system',
    },
    {
      label: 'Published',
      value: formatNumber(summary.published),
      icon: 'fa-check-circle',
      tone: 'emerald',
      note: 'Live on the website',
    },
    {
      label: 'Sections',
      value: slots.length,
      icon: 'fa-border-all',
      tone: 'amber',
      note: 'Homepage + custom slots',
    },
    {
      label: 'Cities',
      value: cityStats.length,
      icon: 'fa-map-pin',
      tone: 'rose',
      note: 'Coverage locations',
    },
  ];

  return (
    <div className="admin-dashboard-view">
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className={`table-card admin-dashboard-stat admin-dashboard-stat-${card.tone}`}>
            <div className="admin-dashboard-stat-icon">
              <i className={`fas ${card.icon}`} />
            </div>
            <div className="admin-dashboard-stat-copy">
              <span className="admin-dashboard-stat-label">{card.label}</span>
              <div className="admin-dashboard-stat-value">{card.value}</div>
              <div className="admin-dashboard-stat-note">{card.note}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-form-grid admin-form-grid-two">
        <div className="table-card admin-dashboard-panel">
          <header className="card-header">
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Section Distribution</h4>
              <p className="admin-dashboard-panel-note">Kaunse homepage slots me kitni stories assigned hain.</p>
            </div>
          </header>
          <div className="admin-dashboard-metric-list">
            {sectionCounts.slice(0, 8).map((section) => (
              <div key={section.label} className="admin-dashboard-metric-item">
                <div className="admin-dashboard-metric-head">
                  <span className="admin-dashboard-metric-label">{section.label}</span>
                  <span className="admin-dashboard-metric-badge admin-dashboard-metric-badge-violet">
                    {section.count}
                  </span>
                </div>
                <div className="admin-dashboard-progress-track">
                  <div className="admin-dashboard-progress-fill admin-dashboard-progress-fill-violet" style={{ width: `${Math.min(100, Math.max(10, (section.count / 10) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="table-card admin-dashboard-panel">
          <header className="card-header">
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Top Categories</h4>
              <p className="admin-dashboard-panel-note">Abhi sabse zyada stories kin categories me hain.</p>
            </div>
          </header>
          <div className="admin-dashboard-metric-list">
            {topCategories.slice(0, 8).map((category) => (
              <div key={category.label} className="admin-dashboard-metric-item">
                <div className="admin-dashboard-metric-head">
                  <span className="admin-dashboard-metric-label">{category.label}</span>
                  <span className="admin-dashboard-metric-badge admin-dashboard-metric-badge-emerald">
                    {category.count}
                  </span>
                </div>
                <div className="admin-dashboard-progress-track">
                  <div className="admin-dashboard-progress-fill admin-dashboard-progress-fill-emerald" style={{ width: `${Math.min(100, Math.max(10, (category.count / 10) * 100))}%` }} />
                </div>
              </div>
            ))}

            {topCategories.length === 0 ? (
              <div className="empty-state-pro">
                <i className="fas fa-folder-open" />
                <h3>No category data</h3>
                <p>Publish stories to see the breakdown here.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
