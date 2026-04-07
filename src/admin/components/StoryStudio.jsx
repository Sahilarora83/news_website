import React from 'react';

const StoryStudio = ({
  editingId,
  postForm,
  setPostForm,
  slots = [],
  categories = [],
  tags = [],
  locationOptions = {},
  savePost,
  savingPost,
  savingMessage,
  resetEditor,
  uploadingImage,
  uploadMessage,
  uploadStoryImage,
  user,
}) => {
  const updateField = (key, value) => {
    setPostForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const cityOptions = [...new Set([postForm.city, ...(locationOptions.cities || []).map((city) => city.name)].filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));

  const availableTags = [...new Set([...tags, ...(postForm.tags || [])].filter(Boolean))].sort((left, right) =>
    String(left).localeCompare(String(right)),
  );

  return (
    <main className="admin-editor-wrap">
      <form onSubmit={(event) => savePost(event, 'published')}>
        <div className="admin-section-header">
          <div>
            <h2 className="admin-page-title">{editingId ? 'Edit Story' : 'Create Story'}</h2>
            <p className="admin-page-note">
              Headline, byline, publish time, location, homepage placement, and full article content are all controlled here.
            </p>
          </div>
          {editingId ? (
            <button type="button" className="btn-secondary" onClick={resetEditor}>
              New Story
            </button>
          ) : null}
        </div>

        <section className="form-section-card admin-form-grid admin-form-grid-four">
          <div className="form-group">
            <label className="form-label">Section</label>
            <select className="input-modern" value={postForm.slot} onChange={(event) => updateField('slot', event.target.value)}>
              {slots.map((slot) => (
                <option key={slot.slot} value={slot.slot}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="input-modern" value={postForm.category} onChange={(event) => updateField('category', event.target.value)}>
              <option value="">Choose category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <select className="input-modern" value={postForm.city || ''} onChange={(event) => updateField('city', event.target.value)}>
              <option value="">Choose city</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Publish Date & Time</label>
            <input
              className="input-modern"
              type="datetime-local"
              value={postForm.publishedAt || ''}
              onChange={(event) => updateField('publishedAt', event.target.value)}
            />
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
        </section>

        <section className="form-section-card">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Headline</label>
            <input
              className="input-modern"
              style={{ height: 56, fontSize: '24px', fontWeight: 700 }}
              value={postForm.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Main headline"
              required
            />
          </div>

          <div className="admin-form-grid admin-form-grid-two" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Short Headline</label>
              <input
                className="input-modern"
                value={postForm.headlineShort || ''}
                onChange={(event) => updateField('headlineShort', event.target.value)}
                placeholder="Card headline"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Banner Label</label>
              <input
                className="input-modern"
                value={postForm.banner || ''}
                onChange={(event) => updateField('banner', event.target.value)}
                placeholder="Optional ribbon or LIVE label"
              />
            </div>
          </div>

          <div className="admin-form-grid admin-form-grid-two">
            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input
                className="input-modern"
                value={postForm.authorName || ''}
                onChange={(event) => updateField('authorName', event.target.value)}
                placeholder="Byline author"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Editor Name</label>
              <input
                className="input-modern"
                value={postForm.editorName || ''}
                onChange={(event) => updateField('editorName', event.target.value)}
                placeholder="Edited by"
              />
            </div>
          </div>
        </section>

        <section className="form-section-card">
          <div className="admin-form-grid admin-form-grid-two" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                className="input-modern"
                value={postForm.image || ''}
                onChange={(event) => updateField('image', event.target.value)}
                placeholder="Paste image URL or upload below"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Video URL</label>
              <input
                className="input-modern"
                value={postForm.videoUrl || ''}
                onChange={(event) => updateField('videoUrl', event.target.value)}
                placeholder="YouTube / Shorts link"
              />
            </div>
          </div>

          <div className="admin-image-upload-row">
            <label className="btn-secondary admin-upload-button">
              <input type="file" accept="image/*" onChange={(event) => uploadStoryImage(event.target.files?.[0])} hidden />
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </label>

            {postForm.image ? (
              <button type="button" className="btn-ghost" onClick={() => updateField('image', '')}>
                Remove Image
              </button>
            ) : null}
          </div>

          {uploadMessage ? <div className="admin-inline-message">{uploadMessage}</div> : null}

          {postForm.image ? (
            <div className="admin-image-preview-card">
              <img src={postForm.image} alt={postForm.title || 'Story preview'} className="admin-image-preview" />
            </div>
          ) : null}
        </section>

        <section className="form-section-card">
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Short Summary</label>
            <textarea
              className="textarea-modern"
              style={{ minHeight: 120 }}
              value={postForm.excerpt || ''}
              onChange={(event) => updateField('excerpt', event.target.value)}
              placeholder="2-3 line summary"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Story Body</label>
            <textarea
              className="textarea-modern"
              style={{ minHeight: 360, lineHeight: 1.8, fontSize: '16px' }}
              value={postForm.body}
              onChange={(event) => updateField('body', event.target.value)}
              placeholder="Full story content"
            />
          </div>

          <div className="admin-form-grid admin-form-grid-two">
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input
                className="input-modern"
                value={(postForm.tags || []).join(', ')}
                onChange={(event) =>
                  updateField(
                    'tags',
                    event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="politics, local, featured"
              />
              {availableTags.length > 0 ? (
                <div className="admin-tag-picker" style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableTags.map((tag) => {
                    const selected = (postForm.tags || []).some((item) => String(item).toLowerCase() === String(tag).toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`admin-tag-chip ${selected ? 'active' : ''}`}
                        onClick={() =>
                          updateField(
                            'tags',
                            selected
                              ? (postForm.tags || []).filter((item) => String(item).toLowerCase() !== String(tag).toLowerCase())
                              : [...(postForm.tags || []), tag],
                          )
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input
                className="input-modern"
                type="number"
                min="1"
                value={postForm.order || ''}
                onChange={(event) => updateField('order', event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        <section className="form-section-card admin-form-grid admin-form-grid-two">
          <div className="form-group admin-toggle-stack">
            <label className="admin-checkbox">
              <input type="checkbox" checked={postForm.featured} onChange={(event) => updateField('featured', event.target.checked)} />
              <span>Featured Story</span>
            </label>

            <label className="admin-checkbox">
              <input type="checkbox" checked={postForm.sticky} onChange={(event) => updateField('sticky', event.target.checked)} />
              <span>Pin At Top</span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={postForm.showOnHomepage !== false}
                onChange={(event) => updateField('showOnHomepage', event.target.checked)}
              />
              <span>Show On Homepage</span>
            </label>
          </div>

          <div className="form-group admin-toggle-stack">
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={postForm.isSuggestion !== false}
                onChange={(event) => updateField('isSuggestion', event.target.checked)}
              />
              <span>Use In Suggestions</span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={postForm.slot === 'breaking'}
                onChange={(event) => updateField('slot', event.target.checked ? 'breaking' : 'latest')}
              />
              <span>Breaking Slot</span>
            </label>

            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={Boolean(postForm.videoUrl)}
                onChange={(event) => {
                  if (!event.target.checked) {
                    updateField('videoUrl', '');
                  }
                }}
              />
              <span>Video Story</span>
            </label>
          </div>
        </section>

          {savingMessage ? <div className="admin-inline-message">{savingMessage}</div> : null}

          <footer className="floating-action-bar">
          {!user || (user.role !== 'city_manager' && user.role !== 'reporter') ? (
            <>
              <button className="btn-primary" type="button" onClick={(event) => savePost(event, 'published')} disabled={savingPost || uploadingImage}>
                {savingPost ? 'Saving...' : 'Publish'}
              </button>
              <button
                className="btn-secondary"
                type="button"
                onClick={(event) => savePost(event, postForm.status === 'review' ? 'draft' : 'review')}
                disabled={savingPost || uploadingImage}
              >
                {savingPost ? 'Saving...' : postForm.status === 'review' ? 'Un-review' : 'Review'}
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              type="button"
              onClick={(event) => savePost(event, 'review')}
              disabled={savingPost || uploadingImage}
            >
              {savingPost ? 'Saving...' : 'Send to Review'}
            </button>
          )}
          <button className="btn-secondary" type="button" onClick={() => savePost(null, 'draft')} disabled={savingPost || uploadingImage}>
            {savingPost ? 'Saving...' : 'Save Draft'}
          </button>
        </footer>
      </form>
    </main>
  );
};

export default StoryStudio;
