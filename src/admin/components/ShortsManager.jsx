import React, { useMemo, useState } from 'react';

const ShortsManager = ({
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
  user,
}) => {
  const [view, setView] = useState('list'); // 'list' | 'editor'

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
              <p className="admin-page-note">Provide a YouTube embed or short video URL.</p>
            </div>
            <button type="button" className="btn-secondary" onClick={closeEditor}>
              Cancel / Back to List
            </button>
          </div>

          <section className="form-section-card">
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Short Title / Headline</label>
              <input
                className="input-modern"
                style={{ height: 56, fontSize: '24px', fontWeight: 700 }}
                value={postForm.title || ''}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Title of the Short"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">YouTube URL (Video Link)</label>
              <input
                className="input-modern"
                value={postForm.videoUrl || ''}
                onChange={(event) => updateField('videoUrl', event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
            </div>

             <div className="form-group">
              <label className="form-label">City (Optional)</label>
              <select className="input-modern" value={postForm.city || ''} onChange={(event) => updateField('city', event.target.value)}>
                <option value="">None</option>
                {dashboard?.locationOptions?.cities?.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

          </section>

          {savingMessage ? <div className="admin-inline-message">{savingMessage}</div> : null}

          <footer className="floating-action-bar">
            {!user || (user.role !== 'city_manager' && user.role !== 'reporter') ? (
              <button className="btn-primary" type="submit" disabled={savingPost}>
                {savingPost ? 'Saving...' : 'Publish'}
              </button>
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
        <div>
          <h2 className="admin-page-title" style={{ fontSize: '20px', margin: 0 }}>Shorts Manager</h2>
        </div>
        <button className="btn-primary" onClick={() => openEditor(null)}>
          <i className="fas fa-plus-circle" />
          Add Short
        </button>
      </header>

      <div className="table-responsive">
        {shortsList.length > 0 ? (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th style={{ width: '150px' }}>City</th>
                <th style={{ width: '150px' }}>Status</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortsList.map((post) => (
                <tr key={post.id} onClick={() => openEditor(post)}>
                  <td>
                    <strong style={{ fontSize: '15px', color: '#111827' }}>{post.title}</strong>
                  </td>
                  <td>{post.city || '-'}</td>
                  <td>
                    <span className={`badge-status ${post.status === 'published' ? 'published' : 'draft'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 10 }} onClick={(event) => event.stopPropagation()}>
                      <button className="btn-ghost" onClick={() => openEditor(post)}>
                        <i className="fas fa-edit" />
                      </button>
                      <button className="btn-ghost danger" onClick={() => deleteShort(post.id)}>
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
            <i className="fas fa-video" />
            <h3>No shorts found</h3>
            <p>You haven't uploaded any shorts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortsManager;
