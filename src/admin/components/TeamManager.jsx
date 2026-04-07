import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../../lib/api';

const createEmptyMember = () => ({
  id: `team-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: '',
  role: '',
  photo: '',
  sortOrder: 0,
  isActive: true,
});

function TeamManager({ authHeaders }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const sortedMembers = useMemo(
    () => [...members].sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0)),
    [members],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        setLoading(true);
        const response = await fetch(apiUrl('/api/admin/team'), {
          headers: authHeaders,
        });
        if (!response.ok) {
          throw new Error('Failed to load team members.');
        }

        const data = await response.json();
        if (!cancelled) {
          const nextMembers = (Array.isArray(data) ? data : data.members || []).map((member, index) => ({
            ...createEmptyMember(),
            ...member,
            sortOrder: Number(member.sortOrder ?? index),
          }));
          setMembers(nextMembers);
          setMessage('');
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMembers();
    return () => {
      cancelled = true;
    };
  }, [authHeaders]);

  const updateMember = (targetId, patch) => {
    setMembers((current) =>
      current.map((member) => (String(member.id) === String(targetId) ? { ...member, ...patch } : member)),
    );
  };

  const handleImageUpload = async (targetId, file) => {
    if (!file) return;
    setMessage('');

    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Image read failed.'));
      reader.readAsDataURL(file);
    });

    const response = await fetch(apiUrl('/api/admin/uploads/images'), {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        fileName: file.name,
        dataUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Image upload failed.');
    }

    const data = await response.json();
    updateMember(targetId, { photo: data.url });
    setMessage('Photo uploaded successfully.');
  };

  const saveMembers = async () => {
    try {
      setSaving(true);
      setMessage('');
      const response = await fetch(apiUrl('/api/admin/team'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          members: sortedMembers.map((member, index) => ({
            ...member,
            sortOrder: Number(member.sortOrder ?? index),
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to save team members.');
      }

      const data = await response.json();
      setMembers((Array.isArray(data) ? data : data.members || []).map((member, index) => ({
        ...createEmptyMember(),
        ...member,
        sortOrder: Number(member.sortOrder ?? index),
      })));
      setMessage('Our Team updated successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card card-padding">
      <div className="admin-team-header">
        <div>
          <h2 className="card-title">Our Team</h2>
          <p className="card-subtitle">
            Add newsroom members with square photos, role labels, and display order. Images uploaded
            here use local storage for faster frontend loading.
          </p>
        </div>
        <div className="admin-team-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => setMembers((current) => [...current, { ...createEmptyMember(), sortOrder: current.length }])}
          >
            <i className="fas fa-plus" /> Add Member
          </button>
          <button type="button" className="admin-button" onClick={saveMembers} disabled={saving}>
            {saving ? 'Saving...' : 'Save Team'}
          </button>
        </div>
      </div>

      {message ? <div className="admin-inline-notice">{message}</div> : null}

      {loading ? (
        <div className="admin-team-empty">Loading team manager...</div>
      ) : (
        <div className="admin-team-grid">
          {sortedMembers.map((member, index) => (
            <article key={member.id} className="admin-team-card">
              <div className="admin-team-photo-wrap">
                {member.photo ? (
                  <img src={member.photo} alt={member.name || `Team member ${index + 1}`} className="admin-team-photo" />
                ) : (
                  <div className="admin-team-photo admin-team-photo-placeholder">
                    <i className="fas fa-user" />
                  </div>
                )}
                <label className="admin-button admin-button-secondary admin-upload-btn">
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      handleImageUpload(member.id, file).catch((error) => setMessage(error.message));
                    }}
                  />
                </label>
              </div>

              <div className="admin-team-fields">
                <label className="admin-field">
                  <span>Name</span>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) => updateMember(member.id, { name: event.target.value })}
                    placeholder="Reporter name"
                  />
                </label>

                <label className="admin-field">
                  <span>Role</span>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(event) => updateMember(member.id, { role: event.target.value })}
                    placeholder="Senior Reporter"
                  />
                </label>

                <label className="admin-field">
                  <span>Photo URL</span>
                  <input
                    type="text"
                    value={member.photo}
                    onChange={(event) => updateMember(member.id, { photo: event.target.value })}
                    placeholder="/uploads/team-member.jpg"
                  />
                </label>

                <div className="admin-team-meta-row">
                  <label className="admin-field">
                    <span>Sort Order</span>
                    <input
                      type="number"
                      value={member.sortOrder}
                      onChange={(event) => updateMember(member.id, { sortOrder: Number(event.target.value || 0) })}
                    />
                  </label>

                  <label className="admin-field admin-checkbox-field">
                    <span>Active</span>
                    <input
                      type="checkbox"
                      checked={member.isActive}
                      onChange={(event) => updateMember(member.id, { isActive: event.target.checked })}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                className="admin-team-delete"
                onClick={() => setMembers((current) => current.filter((item) => item.id !== member.id))}
              >
                <i className="fas fa-trash" /> Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TeamManager;
