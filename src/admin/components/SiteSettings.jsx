import React from 'react';

const sectionToggleKeys = [
  { key: 'trending', label: 'Trending Bar' },
  { key: 'latest', label: 'Latest' },
  { key: 'center', label: 'Top Stories' },
  { key: 'breaking', label: 'Breaking' },
  { key: 'city', label: 'City News' },
  { key: 'election', label: 'Election' },
  { key: 'business', label: 'Business' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'trio', label: 'Three Columns' },
];

const SiteSettings = ({ settingsForm, setSettingsForm, saveSettings, savingSettings }) => {
  const updateField = (key, value) => {
    setSettingsForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateListItem = (key, index, field, value) => {
    setSettingsForm((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  };

  const addListItem = (key, item) => {
    setSettingsForm((current) => ({
      ...current,
      [key]: [...current[key], item],
    }));
  };

  const removeListItem = (key, index) => {
    setSettingsForm((current) => ({
      ...current,
      [key]: current[key].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return (
    <div className="admin-settings-view">
      <section className="form-section-card">
        <header className="card-header admin-card-header-plain">
          <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>General & Branding</h4>
        </header>

        <div className="admin-form-grid admin-form-grid-two">
          <div className="form-group">
            <label className="form-label">Primary Site Name</label>
            <input className="input-modern" value={settingsForm.siteNamePrimary} onChange={(event) => updateField('siteNamePrimary', event.target.value)} placeholder="Website name" />
          </div>

          <div className="form-group">
            <label className="form-label">Secondary Brand Text</label>
            <input className="input-modern" value={settingsForm.siteNameSecondary} onChange={(event) => updateField('siteNameSecondary', event.target.value)} placeholder="NEWS / LIVE / TV" />
          </div>

          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input className="input-modern" value={settingsForm.siteTagline} onChange={(event) => updateField('siteTagline', event.target.value)} placeholder="Header tagline" />
          </div>

          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input className="input-modern" value={settingsForm.support_email} onChange={(event) => updateField('support_email', event.target.value)} placeholder="support@yourdomain.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Header Ad Image</label>
            <input className="input-modern" value={settingsForm.headerAdImage} onChange={(event) => updateField('headerAdImage', event.target.value)} placeholder="https://example.com/banner.jpg" />
          </div>

          <div className="form-group">
            <label className="form-label">Header Ad Link</label>
            <input className="input-modern" value={settingsForm.headerAdLink} onChange={(event) => updateField('headerAdLink', event.target.value)} placeholder="https://advertiser.example" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Header Ad Alt Text</label>
            <input className="input-modern" value={settingsForm.headerAdAlt} onChange={(event) => updateField('headerAdAlt', event.target.value)} placeholder="Banner description" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Meta Description</label>
            <textarea className="textarea-modern" style={{ minHeight: 110 }} value={settingsForm.meta_description} onChange={(event) => updateField('meta_description', event.target.value)} placeholder="SEO description" />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Footer Copyright</label>
            <input className="input-modern" value={settingsForm.footerCopyright} onChange={(event) => updateField('footerCopyright', event.target.value)} placeholder="Footer copyright text" />
          </div>
        </div>
      </section>

      <section className="form-section-card">
        <header className="card-header admin-card-header-plain">
          <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Social & Article Controls</h4>
        </header>

        <div className="admin-form-grid admin-form-grid-two">
          <div className="form-group">
            <label className="form-label">Facebook URL</label>
            <input className="input-modern" value={settingsForm.facebook_url} onChange={(event) => updateField('facebook_url', event.target.value)} placeholder="https://facebook.com/yourpage" />
          </div>

          <div className="form-group">
            <label className="form-label">X / Twitter URL</label>
            <input className="input-modern" value={settingsForm.twitter_url} onChange={(event) => updateField('twitter_url', event.target.value)} placeholder="https://x.com/yourpage" />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp Number</label>
            <input className="input-modern" value={settingsForm.whatsapp_number} onChange={(event) => updateField('whatsapp_number', event.target.value)} placeholder="919999999999" />
          </div>

          <div className="admin-toggle-stack">
            <label className="admin-checkbox">
              <input type="checkbox" checked={settingsForm.show_article_suggestions} onChange={(event) => updateField('show_article_suggestions', event.target.checked)} />
              <span>Show related stories on article page</span>
            </label>

            <label className="admin-checkbox">
              <input type="checkbox" checked={settingsForm.show_article_latest_news} onChange={(event) => updateField('show_article_latest_news', event.target.checked)} />
              <span>Show latest stories in article sidebar</span>
            </label>
          </div>
        </div>
      </section>

      <section className="form-section-card">
        <header className="card-header admin-card-header-plain">
          <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Homepage Sections</h4>
        </header>

        <div className="taxonomy-grid">
          {sectionToggleKeys.map((item) => (
            <label key={item.key} className="taxonomy-card" style={{ cursor: 'pointer' }}>
              <span style={{ fontWeight: 700 }}>{item.label}</span>
              <input type="checkbox" checked={settingsForm[item.key]} onChange={(event) => updateField(item.key, event.target.checked)} />
            </label>
          ))}
        </div>
      </section>

      <div className="admin-form-grid admin-form-grid-two" style={{ marginTop: 32 }}>
        <section className="table-card">
          <header className="card-header">
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Trending Topics</h4>
            <button className="btn-secondary" onClick={() => addListItem('trendingTopics', { id: Date.now(), name: '', isActive: true })}>
              <i className="fas fa-plus" />
              Add Topic
            </button>
          </header>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settingsForm.trendingTopics.length > 0 ? (
              settingsForm.trendingTopics.map((topic, index) => (
                <div key={`${topic.id}-${index}`} className="admin-list-editor-row">
                  <input className="input-modern" value={topic.name || ''} onChange={(event) => updateListItem('trendingTopics', index, 'name', event.target.value)} placeholder="Topic name" />
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={topic.isActive !== false} onChange={(event) => updateListItem('trendingTopics', index, 'isActive', event.target.checked)} />
                    <span>Live</span>
                  </label>
                  <button className="btn-ghost danger" onClick={() => removeListItem('trendingTopics', index)}>
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state-pro">
                <i className="fas fa-hashtag" />
                <h3>No trending topics</h3>
                <p>Add topics that should appear in the top trending bar.</p>
              </div>
            )}
          </div>
        </section>

        <section className="table-card">
          <header className="card-header">
            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Election Tabs</h4>
            <button className="btn-secondary" onClick={() => addListItem('electionTabs', { id: Date.now(), name: '', isActive: true })}>
              <i className="fas fa-plus" />
              Add Tab
            </button>
          </header>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {settingsForm.electionTabs.length > 0 ? (
              settingsForm.electionTabs.map((tab, index) => (
                <div key={`${tab.id}-${index}`} className="admin-list-editor-row">
                  <input className="input-modern" value={tab.name || ''} onChange={(event) => updateListItem('electionTabs', index, 'name', event.target.value)} placeholder="Election tab name" />
                  <label className="admin-checkbox">
                    <input type="checkbox" checked={tab.isActive !== false} onChange={(event) => updateListItem('electionTabs', index, 'isActive', event.target.checked)} />
                    <span>Live</span>
                  </label>
                  <button className="btn-ghost danger" onClick={() => removeListItem('electionTabs', index)}>
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state-pro">
                <i className="fas fa-landmark" />
                <h3>No election tabs</h3>
                <p>Add state or region tabs for the election section.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" style={{ padding: '0 40px' }} onClick={saveSettings} disabled={savingSettings}>
          <i className="fas fa-save" style={{ marginRight: 10 }} />
          {savingSettings ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SiteSettings;
