import React, { useMemo, useState } from 'react';

const shortStatusLabels = {
  published: 'Published',
  draft: 'Draft',
  review: 'Under Review',
  pending: 'Pending Review',
  rejected: 'Rejected',
};

const shortStatusClasses = {
  published: 'published',
  draft: 'draft',
  review: 'pending',
  pending: 'pending',
  rejected: 'rejected',
};

function ShortsFilterButton({ title, value, isOpen, onToggle, count }) {
  return (
    <button type="button" className={`admin-multi-filter-trigger${isOpen ? ' open' : ''}`} onClick={onToggle}>
      <div className="admin-multi-filter-copy">
        <span className="admin-multi-filter-title">{title}</span>
        <strong className="admin-multi-filter-value">{value}</strong>
      </div>
      <span className="admin-multi-filter-meta">{count}</span>
    </button>
  );
}

function ShortsManager({
  dashboard,
  shortsList,
  postForm,
  setPostForm,
  editingId,
  setEditingId,
  saveShort,
  savingPost,
  savingMessage,
  emptyPost,
  formFromPost,
  deleteShort,
  updateShortStatus,
  uploadShortVideo,
  uploadingVideo,
  uploadMessage,
  user,
}) {
  const [view, setView] = useState('list');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [statusOpen, setStatusOpen] = useState(false);

  const cityOptions = useMemo(
    () =>
      [...new Set((shortsList || []).map((item) => item.city).filter(Boolean))]
        .sort((left, right) => String(left).localeCompare(String(right), 'hi')),
    [shortsList],
  );

  const filteredShorts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (shortsList || []).filter((item) => {
      const queryMatch =
        !normalizedQuery ||
        [item.title, item.description, item.city]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const cityMatch = !cityFilter || item.city === cityFilter;
      const statusMatch = statusFilter.length === 0 || statusFilter.includes(item.status || 'draft');
      return queryMatch && cityMatch && statusMatch;
    });
  }, [shortsList, query, cityFilter, statusFilter]);

  const openEditor = (post) => {
    if (post) {
      setPostForm(formFromPost(post));
      setEditingId(post.id);
    } else {
      setPostForm({ ...emptyPost });
      setEditingId('');
    }
    setView('editor');
  };

  const closeEditor = () => {
    setView('list');
    setEditingId('');
  };

  const updateField = (key, value) => {
    setPostForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const toggleStatus = (nextStatus) => {
    setStatusFilter((current) =>
      current.includes(nextStatus) ? current.filter((item) => item !== nextStatus) : [...current, nextStatus],
    );
  };

  if (view === 'editor') {
    return (
      <main className="admin-editor-wrap">
        <form
          onSubmit={async (event) => {
            await saveShort(event, 'published');
            closeEditor();
          }}
        >
          <div className="admin-section-header" style={{ marginBottom: 20 }}>
            <div>
              <h2 className="admin-page-title">{editingId ? 'Edit Short' : 'Add New Short'}</h2>
              <p className="admin-page-note">Create a short with video, cover image, city, and a clean review workflow.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={closeEditor}>
              Back to Shorts
            </button>
          </div>

          <section className="form-section-card">
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Short title</label>
              <input
                className="input-modern"
                style={{ height: 56, fontSize: '24px', fontWeight: 700 }}
                value={postForm.title || ''}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Title of the short"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Video URL or uploaded file link</label>
              <input
                className="input-modern"
                value={postForm.videoUrl || ''}
                onChange={(event) => updateField('videoUrl', event.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or upload below"
                required
              />
            </div>

            <div className="admin-image-upload-row" style={{ marginBottom: 20 }}>
              <label className="btn-secondary admin-upload-button">
                <input type="file" accept="video/*" onChange={(event) => uploadShortVideo(event.target.files?.[0])} hidden />
                {uploadingVideo ? 'Uploading...' : 'Upload Video File'}
              </label>

              {postForm.videoUrl && postForm.videoUrl.startsWith('http') ? (
                <div style={{ marginLeft: 15, fontSize: '0.9rem', color: '#059669' }}>
                  <i className="fas fa-check-circle" /> Video ready
                </div>
              ) : null}
            </div>

            {uploadMessage ? <div className="admin-inline-message" style={{ marginBottom: 20 }}>{uploadMessage}</div> : null}

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Description</label>
              <textarea
                className="textarea-modern"
                style={{ minHeight: 120 }}
                value={postForm.description || ''}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Explain what the short is about"
              />
            </div>

            <div className="admin-form-grid admin-form-grid-two" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Thumbnail URL</label>
                <input
                  className="input-modern"
                  value={postForm.image || ''}
                  onChange={(event) => updateField('image', event.target.value)}
                  placeholder="Leave blank to use auto-generated thumbnail"
                />
              </div>

              {postForm.image ? (
                <div className="admin-image-preview-card" style={{ minHeight: '120px' }}>
                  <img src={postForm.image} alt="Short preview" className="admin-image-preview" />
                </div>
              ) : (
                <div className="admin-short-placeholder">Thumbnail preview will appear here.</div>
              )}
            </div>

            <div className="admin-form-grid admin-form-grid-two">
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="input-modern" value={postForm.city || ''} onChange={(event) => updateField('city', event.target.value)}>
                  <option value="">None</option>
                  {dashboard?.locationOptions?.cities?.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input-modern" value={postForm.status || 'draft'} onChange={(event) => updateField('status', event.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="review">Under Review</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </section>

          {savingMessage ? <div className="admin-inline-message">{savingMessage}</div> : null}

          <footer className="floating-action-bar">
            {!user || (user.role !== 'city_manager' && user.role !== 'reporter') ? (
              <>
                <button className="btn-primary" type="submit" disabled={savingPost}>
                  {savingPost ? 'Saving...' : 'Publish'}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={async (event) => {
                    await saveShort(event, postForm.status === 'review' ? 'draft' : 'review');
                    closeEditor();
                  }}
                  disabled={savingPost}
                >
                  {savingPost ? 'Saving...' : postForm.status === 'review' ? 'Remove From Review' : 'Send to Review'}
                </button>
              </>
            ) : (
              <button
                className="btn-primary"
                type="button"
                onClick={async (event) => {
                  await saveShort(event, 'pending');
                  closeEditor();
                }}
                disabled={savingPost}
              >
                {savingPost ? 'Saving...' : 'Send to Review'}
              </button>
            )}
          </footer>
        </form>
      </main>
    );
  }

  return (
    <div className="table-card">
      <header className="card-header">
        <div className="admin-manager-header">
          <div>
            <h2 className="admin-page-title" style={{ fontSize: '20px', margin: 0 }}>Shorts Manager</h2>
            <p className="admin-page-note">Review, publish, and search shorts quickly without opening each record.</p>
          </div>

          <div className="admin-manager-summary">
            <span>{filteredShorts.length} visible</span>
            <span>{shortsList.length} total</span>
          </div>
        </div>

        <div className="header-filters-modern admin-short-filter-grid">
          <input
            className="input-modern"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, description, or city"
          />

          <select className="input-modern" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <div className="admin-multi-filter">
            <ShortsFilterButton
              title="Status"
              value={statusFilter.length ? statusFilter.map((status) => shortStatusLabels[status] || status).join(', ') : 'All statuses'}
              isOpen={statusOpen}
              onToggle={() => setStatusOpen((current) => !current)}
              count={statusFilter.length || 'All'}
            />

            {statusOpen ? (
              <div className="admin-multi-filter-panel">
                <div className="admin-multi-filter-actions">
                  <button type="button" className="btn-ghost" onClick={() => setStatusFilter(Object.keys(shortStatusLabels))}>
                    Select All
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => setStatusFilter([])}>
                    Clear
                  </button>
                </div>

                <div className="admin-multi-filter-options">
                  {Object.entries(shortStatusLabels).map(([value, label]) => (
                    <label key={value} className={`admin-multi-filter-option${statusFilter.includes(value) ? ' active' : ''}`}>
                      <input type="checkbox" checked={statusFilter.includes(value)} onChange={() => toggleStatus(value)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <button className="btn-primary admin-short-add-btn" onClick={() => openEditor(null)}>
            <i className="fas fa-plus-circle" />
            <span>Add Short</span>
          </button>
        </div>
      </header>

      <div className="admin-filter-summary">
        {query ? (
          <div className="admin-filter-chip-row">
            <span className="admin-filter-chip-label">Search</span>
            <button type="button" className="admin-filter-chip" onClick={() => setQuery('')}>
              <span>{query}</span>
              <i className="fas fa-times" />
            </button>
          </div>
        ) : null}
        {cityFilter ? (
          <div className="admin-filter-chip-row">
            <span className="admin-filter-chip-label">City</span>
            <button type="button" className="admin-filter-chip" onClick={() => setCityFilter('')}>
              <span>{cityFilter}</span>
              <i className="fas fa-times" />
            </button>
          </div>
        ) : null}
        {statusFilter.length ? (
          <div className="admin-filter-chip-row">
            <span className="admin-filter-chip-label">Status</span>
            {statusFilter.map((status) => (
              <button key={status} type="button" className="admin-filter-chip" onClick={() => toggleStatus(status)}>
                <span>{shortStatusLabels[status] || status}</span>
                <i className="fas fa-times" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="table-responsive">
        {filteredShorts.length > 0 ? (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>Thumb</th>
                <th>Short</th>
                <th style={{ width: '150px' }}>City</th>
                <th style={{ width: '150px' }}>Status</th>
                <th style={{ width: '210px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShorts.map((post) => (
                <tr key={post.id} onClick={() => openEditor(post)}>
                  <td>
                    <div className="admin-short-thumb">
                      <img
                        src={post.image || '/fallback.png'}
                        alt={post.title || 'Short thumbnail'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjRTlFOUU5Ii8+PC9zdmc+';
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="admin-story-row-copy admin-short-row-copy">
                      <strong className="admin-story-row-title">{post.title}</strong>
                      <span className="admin-story-row-meta">{post.city || 'No city selected'}</span>
                      <p className="admin-story-row-excerpt">{post.description || 'Open this short to update video, thumbnail, and publishing status.'}</p>
                    </div>
                  </td>
                  <td>{post.city || '-'}</td>
                  <td>
                    <span className={`badge-status ${shortStatusClasses[post.status] || 'draft'}`}>
                      {shortStatusLabels[post.status] || post.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions admin-short-actions" onClick={(event) => event.stopPropagation()}>
                      <button
                        className={`btn-ghost admin-inline-action${post.status === 'review' ? ' active' : ''}`}
                        onClick={() => updateShortStatus?.(post, post.status === 'review' ? 'draft' : 'review')}
                      >
                        <i className={`fas ${post.status === 'review' ? 'fa-rotate-left' : 'fa-list-check'}`} />
                        {post.status === 'review' ? 'Un-review' : 'Review'}
                      </button>
                      <button className="btn-ghost admin-inline-action" onClick={() => updateShortStatus?.(post, 'published')}>
                        <i className="fas fa-upload" />
                        Publish
                      </button>
                      <button className="btn-ghost admin-inline-action" onClick={() => openEditor(post)}>
                        <i className="fas fa-edit" />
                        Edit
                      </button>
                      <button className="btn-ghost danger admin-inline-action" onClick={() => deleteShort(post.id)}>
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
            <i className="fas fa-video" />
            <h3>No shorts found</h3>
            <p>No shorts matched the current filters. Clear the filters or add a new short.</p>
            <button
              className="btn-secondary"
              onClick={() => {
                setQuery('');
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
}

export default ShortsManager;
