import React from 'react';

const statusLabels = {
  published: 'Published',
  draft: 'Draft',
  pending: 'Pending Review',
  rejected: 'Rejected',
};

const statusClassNames = {
  published: 'published',
  draft: 'draft',
  pending: 'pending',
  rejected: 'rejected',
};

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
}) => {
  const openEditor = (post) => {
    setPostForm(formFromPost(post));
    setEditingId(post.id);
    setActiveTab('editor');
  };

  return (
    <div className="table-card">
      <header className="card-header">
        <div
          className="header-filters-modern"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, width: '100%' }}
        >
          <select
            className="input-modern"
            value={slotFilter}
            onChange={(event) => setSlotFilter(event.target.value)}
          >
            <option value="">All sections</option>
            {slots.map((slot) => (
              <option key={slot.slot} value={slot.slot}>
                {slot.label}
              </option>
            ))}
          </select>

          <select
            className="input-modern"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            className="input-modern"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            className="input-modern"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={(event) => setCityFilter(event.target.value)}
          />
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <strong style={{ fontSize: '15px', color: '#111827' }}>{post.title}</strong>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
                        {post.category || 'Uncategorized'}
                        {post.city ? ` | ${post.city}` : ''}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {post.authorName || '-'}
                    {post.editorName ? ` / ${post.editorName}` : ''}
                  </td>
                  <td style={{ fontSize: '13px', color: '#6b7280' }}>
                    {formatDateTime(post.updated_at || post.created_at)}
                  </td>
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
                      {labels[post.slot] || post.slot}
                    </span>
                  </td>
                  <td>
                    <span className={`badge-status ${statusClassNames[post.status] || 'draft'}`}>
                      {statusLabels[post.status] || post.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 10 }} onClick={(event) => event.stopPropagation()}>
                      <button className="btn-ghost" onClick={() => openEditor(post)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn-ghost danger" onClick={() => deletePost(post.id)}>
                        <i className="fas fa-trash-alt" />
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
            <p>Current filters ke saath koi story match nahi ho rahi.</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setSlotFilter('');
                setCategoryFilter('');
                setCityFilter('');
                setStatusFilter('');
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
