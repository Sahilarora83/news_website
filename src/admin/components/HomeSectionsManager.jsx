import React, { useMemo, useState } from 'react';

const quickPresets = [
  { slot: 'featured-grid', label: 'Featured Grid', section: 'Featured', single: false },
  { slot: 'city-focus', label: 'City Focus', section: 'City', single: false },
  { slot: 'analysis-picks', label: 'Analysis Picks', section: 'Explainer', single: false },
  { slot: 'editor-choice', label: 'Editor Choice', section: 'Editorial', single: true },
];

function HomeSectionsManager({ settingsForm, setSettingsForm, saveSettings, savingSettings }) {
  const [query, setQuery] = useState('');

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

  const filteredSlots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (settingsForm.slots || []).filter((slot) => {
      if (!normalizedQuery) return true;
      return [slot.slot, slot.label, slot.section].filter(Boolean).join(' ').toLowerCase().includes(normalizedQuery);
    });
  }, [settingsForm.slots, query]);

  return (
    <section className="table-card">
      <header className="card-header">
        <div className="admin-manager-header">
          <div>
            <h4 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Homepage Sections</h4>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px', maxWidth: 720 }}>
              Create simple homepage slots that admins and reporters can understand quickly. Each section gets a slot ID, a reader-facing label, and a group name for story assignment.
            </p>
          </div>
          <div className="admin-manager-summary">
            <span>{filteredSlots.length} visible</span>
            <span>{settingsForm.slots?.length || 0} total</span>
          </div>
        </div>

        <div className="header-filters-modern admin-home-sections-header">
          <input
            className="input-modern"
            placeholder="Search by slot ID, label, or section group"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <button
            className="btn-primary"
            onClick={() =>
              addListItem('slots', {
                slot: `custom-${(settingsForm.slots || []).length + 1}`,
                label: `Custom Section ${(settingsForm.slots || []).length + 1}`,
                section: 'Custom',
                single: false,
              })
            }
          >
            <i className="fas fa-plus" />
            Add Section
          </button>
        </div>
      </header>

      <div className="admin-home-sections-quickbar">
        <span className="admin-filter-chip-label">Quick add</span>
        {quickPresets.map((preset) => (
          <button
            key={preset.slot}
            type="button"
            className="admin-filter-chip"
            onClick={() =>
              addListItem('slots', {
                ...preset,
                slot: `${preset.slot}-${Date.now()}`,
              })
            }
          >
            <span>{preset.label}</span>
            <i className="fas fa-plus" />
          </button>
        ))}
      </div>

      <div className="admin-home-sections-grid">
        {filteredSlots.map((slot, index) => (
          <article key={`${slot.slot}-${index}`} className="admin-home-slot-card">
            <div className="admin-home-slot-card-header">
              <div>
                <h5>{slot.label || 'Untitled Section'}</h5>
                <p>{slot.section || 'No section group'}</p>
              </div>
              <label className="admin-checkbox compact">
                <input
                  type="checkbox"
                  checked={Boolean(slot.single)}
                  onChange={(event) => updateListItem('slots', index, 'single', event.target.checked)}
                />
                <span>Single story</span>
              </label>
            </div>

            <div className="admin-home-slot-fields">
              <div className="form-group">
                <label className="form-label">Slot ID</label>
                <input className="input-modern" value={slot.slot} onChange={(event) => updateListItem('slots', index, 'slot', event.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Label</label>
                <input className="input-modern" value={slot.label} onChange={(event) => updateListItem('slots', index, 'label', event.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">Section Group</label>
                <input className="input-modern" value={slot.section} onChange={(event) => updateListItem('slots', index, 'section', event.target.value)} />
              </div>
            </div>

            <div className="admin-home-slot-help">
              <span className="admin-filter-chip-label">Assignment key</span>
              <code>{slot.slot}</code>
            </div>

            <div className="admin-row-actions">
              <button
                type="button"
                className="btn-ghost admin-inline-action"
                onClick={() =>
                  addListItem('slots', {
                    slot: `${slot.slot}-copy`,
                    label: `${slot.label} Copy`,
                    section: slot.section,
                    single: slot.single,
                  })
                }
              >
                <i className="fas fa-copy" />
                Duplicate
              </button>
              <button type="button" className="btn-ghost danger admin-inline-action" onClick={() => removeListItem('slots', index)}>
                <i className="fas fa-trash-alt" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      {!filteredSlots.length ? (
        <div className="empty-state-pro">
          <i className="fas fa-layer-group" />
          <h3>No sections found</h3>
          <p>Try a different search or add a new homepage section.</p>
        </div>
      ) : null}

      <footer className="card-footer admin-home-sections-footer">
        <button className="btn-primary" onClick={saveSettings} disabled={savingSettings}>
          {savingSettings ? 'Saving...' : 'Save Homepage Sections'}
        </button>
      </footer>
    </section>
  );
}

export default HomeSectionsManager;
