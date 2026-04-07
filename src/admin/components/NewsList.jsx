import React, { useMemo, useState } from 'react';

const statusLabels = {
  published: 'Published',
  draft: 'Draft',
  review: 'Under Review',
  pending: 'Pending Review',
  rejected: 'Rejected',
};

const statusClassNames = {
  published: 'published',
  draft: 'draft',
  review: 'pending',
  pending: 'pending',
  rejected: 'rejected',
};

function FilterSummaryChips({ label, items = [], onRemove }) {
  if (!items.length) return null;

  return (
    <div className="admin-filter-chip-row">
      <span className="admin-filter-chip-label">{label}</span>
      {items.map((item) => (
        <button key={item.value} type="button" className="admin-filter-chip" onClick={() => onRemove(item.value)}>
          <span>{item.label}</span>
          <i className="fas fa-times" />
        </button>
      ))}
    </div>
  );
}

function MultiSelectFilter({ title, placeholder, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabels = useMemo(
    () =>
      options
        .filter((option) => value.includes(option.value))
        .map((option) => option.label),
    [options, value],
  );

  const toggleValue = (nextValue) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((item) => item !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  return (
    <div className={`admin-multi-filter${isOpen ? ' open' : ''}`}>
      <button type="button" className="admin-multi-filter-trigger" onClick={() => setIsOpen((current) => !current)}>
        <div className="admin-multi-filter-copy">
          <span className="admin-multi-filter-title">{title}</span>
          <strong className="admin-multi-filter-value">{selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}</strong>
        </div>
        <span className="admin-multi-filter-meta">{selectedLabels.length > 0 ? selectedLabels.length : 'All'}</span>
      </button>

      {isOpen ? (
        <div className="admin-multi-filter-panel">
          <div className="admin-multi-filter-actions">
            <button type="button" className="btn-ghost" onClick={() => onChange(options.map((option) => option.value))}>
              Select All
            </button>
            <button type="button" className="btn-ghost" onClick={() => onChange([])}>
              Clear
            </button>
          </div>

          <div className="admin-multi-filter-options">
            {options.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label key={option.value} className={`admin-multi-filter-option${checked ? ' active' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleValue(option.value)} />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const NewsList = ({
  filteredPosts,
  slots,
  categories,
  slotFilter,
  setSlotFilter,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  cityFilter,
  setCityFilter,
  setActiveTab,
  setPostForm,
  setEditingId,
  emptyPost,
  formFromPost,
  labels = {},
  formatDateTime,
  deletePost,
  updateStoryStatus,
}) => {
  const slotLabelMap = Object.fromEntries((slots || []).map((slot) => [slot.slot, slot.label]));
  const normalizedCategories = [...new Set([...(categories || []), 'रिव्यूज़'])].sort((left, right) =>
    String(left).localeCompare(String(right), 'hi'),
  );

  const slotOptions = (slots || []).map((slot) => ({
    value: slot.slot,
    label: slot.label,
  }));

  const categoryOptions = normalizedCategories.map((category) => ({
    value: category,
    label: category,
  }));

  const statusOptions = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Under Review' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const openEditor = (post) => {
    setPostForm(formFromPost(post));
    setEditingId(post.id);
    setActiveTab('editor');
  };

  const selectedSlots = slotOptions.filter((option) => slotFilter.includes(option.value));
  const selectedCategories = categoryOptions.filter((option) => categoryFilter.includes(option.value));
  const selectedStatuses = statusOptions.filter((option) => statusFilter.includes(option.value));

  return (
    <div className="table-card">
      <header className="card-header">
        <div
          className="header-filters-modern"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, width: '100%' }}
        >
          <MultiSelectFilter
            title="Sections"
            placeholder="All sections"
            options={slotOptions}
            value={slotFilter}
            onChange={setSlotFilter}
          />

          <MultiSelectFilter
            title="Categories"
            placeholder="All categories"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />

          <MultiSelectFilter
            title="Status"
            placeholder="All statuses"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <div style={{ display: 'grid', gap: 8 }}>
            <input
              className="input-modern"
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
            />
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Use the dropdown filters to narrow results by section, category, status, or city.</span>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            setPostForm({ ...emptyPost });
            setEditingId('');
            setActiveTab('editor');
          }}
        >
          <i className="fas fa-plus-circle" />
          New Story
        </button>
      </header>

      <div className="admin-filter-summary">
        <FilterSummaryChips
          label="Sections"
          items={selectedSlots}
          onRemove={(value) => setSlotFilter(slotFilter.filter((item) => item !== value))}
        />
        <FilterSummaryChips
          label="Categories"
          items={selectedCategories}
          onRemove={(value) => setCategoryFilter(categoryFilter.filter((item) => item !== value))}
        />
        <FilterSummaryChips
          label="Status"
          items={selectedStatuses}
          onRemove={(value) => setStatusFilter(statusFilter.filter((item) => item !== value))}
        />
        {cityFilter ? (
          <div className="admin-filter-chip-row">
            <span className="admin-filter-chip-label">City</span>
            <button type="button" className="admin-filter-chip" onClick={() => setCityFilter('')}>
              <span>{cityFilter}</span>
              <i className="fas fa-times" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="table-responsive">
        {filteredPosts.length > 0 ? (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Story ID</th>
                <th>Story</th>
                <th style={{ width: '170px' }}>Byline</th>
                <th style={{ width: '180px' }}>Updated</th>
                <th style={{ width: '150px' }}>Section</th>
                <th style={{ width: '130px' }}>Status</th>
                <th style={{ width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id} onClick={() => openEditor(post)}>
                  <td style={{ color: '#94a3b8', fontSize: '13px' }}>{post.id}</td>
                  <td>
                    <div className="admin-story-row-copy">
                      <strong className="admin-story-row-title">{post.title}</strong>
                      <span className="admin-story-row-meta">
                        {post.category || 'Uncategorized'}
                        {post.city ? ` | ${post.city}` : ''}
                      </span>
                      <p className="admin-story-row-excerpt">
                        {post.headlineShort || post.excerpt || post.description || 'Open this story to edit headline, body, and publication settings.'}
                      </p>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {post.authorName || '-'}
                    {post.editorName ? ` / ${post.editorName}` : ''}
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>{formatDateTime(post.updated_at || post.created_at)}</td>
                  <td>
                    <span
                      style={{
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {slotLabelMap[post.slot] || labels[post.slot] || post.slot}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${statusClassNames[post.status] || 'draft'}`}>{statusLabels[post.status] || post.status}</span>
                  </td>
                  <td>
                    <div className="admin-row-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        className={`btn-ghost admin-inline-action${post.status === 'review' ? ' active' : ''}`}
                        onClick={() => updateStoryStatus?.(post.id, post.status === 'review' ? 'draft' : 'review')}
                      >
                        <i className={`fas ${post.status === 'review' ? 'fa-rotate-left' : 'fa-list-check'}`} />
                        {post.status === 'review' ? 'Un-review' : 'Review'}
                      </button>
                      <button className="btn-ghost admin-inline-action" onClick={() => openEditor(post)}>
                        <i className="fas fa-edit" />
                        Edit
                      </button>
                      <button className="btn-ghost danger admin-inline-action" onClick={() => deletePost(post.id)}>
                        <i className="fas fa-trash-alt" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state-pro">
            <i className="fas fa-file-invoice" />
            <h3>No stories found</h3>
            <p>No stories found matching the current filters.</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setSlotFilter([]);
                setCategoryFilter([]);
                setCityFilter('');
                setStatusFilter([]);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsList;
