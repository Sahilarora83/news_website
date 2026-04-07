import React, { useEffect, useState } from 'react';
import { apiUrl } from '../../lib/api';

const emptyUserForm = {
  id: '',
  username: '',
  email: '',
  password: '',
  role: 'reporter',
  assignedCityId: '',
};

const UserManage = ({ authHeaders, locationOptions }) => {
  const [team, setTeam] = useState([]);
  const [cityOptions, setCityOptions] = useState(() => locationOptions?.cities || []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [userForm, setUserForm] = useState(emptyUserForm);

  const fetchLocations = async () => {
    try {
      const response = await fetch(apiUrl('/api/admin/locations'), { headers: authHeaders });
      const data = await response.json();
      setCityOptions(data.cities || []);
    } catch {
      setCityOptions(locationOptions?.cities || []);
    }
  };

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/users'), { headers: authHeaders });
      const data = await response.json();
      setTeam(data.users || []);
    } catch (error) {
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    fetchLocations();
  }, []);

  const resetForm = () => {
    setUserForm(emptyUserForm);
    setMessage('');
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const isEditing = Boolean(userForm.id);
      const response = await fetch(
        apiUrl(isEditing ? `/api/admin/users/${userForm.id}` : '/api/admin/users'),
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            username: userForm.username,
            email: userForm.email,
            password: userForm.password,
            role: userForm.role,
            assignedCityId: userForm.assignedCityId,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'User save failed');
      }

      await fetchTeam();
      setMessage(isEditing ? 'User updated successfully.' : 'User created successfully.');
      resetForm();
    } catch (error) {
      setMessage(error.message || 'User save failed');
    } finally {
      setSaving(false);
    }
  };

  const editUser = (staff) => {
    setUserForm({
      id: staff.id,
      username: staff.username || '',
      email: staff.email || '',
      password: '',
      role: staff.role || 'reporter',
      assignedCityId: staff.assigned_city_id ? String(staff.assigned_city_id) : '',
    });
    setMessage('');
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/users/${userId}`), {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Delete failed');
      }

      await fetchTeam();
      if (String(userForm.id) === String(userId)) {
        resetForm();
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="admin-user-master">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-page-title">Users</h2>
          <p className="admin-page-note">User banana, edit karna, delete karna, role change karna aur city assign karna yahan se hoga.</p>
        </div>
      </div>

      <form className="form-section-card admin-form-grid admin-form-grid-four" onSubmit={saveUser}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            className="input-modern"
            value={userForm.username}
            onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="Username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="input-modern"
            value={userForm.email}
            onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{userForm.id ? 'New Password (optional)' : 'Password'}</label>
          <input
            className="input-modern"
            value={userForm.password}
            onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
            placeholder={userForm.id ? 'Leave blank to keep current' : 'Password'}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role</label>
          <select
            className="input-modern"
            value={userForm.role}
            onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="reporter">Reporter</option>
            <option value="city_manager">City Manager</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Assigned City</label>
          <select
            className="input-modern"
            value={userForm.assignedCityId}
            onChange={(event) => setUserForm((current) => ({ ...current, assignedCityId: event.target.value }))}
          >
            <option value="">No city</option>
            {cityOptions.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group admin-form-submit" style={{ gap: 12 }}>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : userForm.id ? 'Update User' : 'Create User'}
          </button>
          {userForm.id ? (
            <button className="btn-secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {message ? <div className="admin-inline-message">{message}</div> : null}

      {loading ? (
        <div className="admin-loading-screen" style={{ height: '240px' }}>Loading users...</div>
      ) : (
        <div className="table-card">
          <header className="card-header">
          <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Registered users</h4>
          </header>
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {team.map((staff) => (
                  <tr key={staff.id}>
                    <td>#{staff.id}</td>
                    <td style={{ fontWeight: 700, color: '#111827' }}>{staff.username}</td>
                    <td>{staff.email}</td>
                    <td>
                      <code
                        style={{
                          background: '#f1f5f9',
                          padding: '4px 10px',
                          borderRadius: 4,
                          fontWeight: 700,
                          fontSize: '11px',
                          color: '#6366f1',
                        }}
                      >
                        {staff.role.toUpperCase()}
                      </code>
                    </td>
                    <td>{staff.assigned_city || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ghost" onClick={() => editUser(staff)}>
                          <i className="fas fa-edit" />
                        </button>
                        <button className="btn-ghost danger" onClick={() => deleteUser(staff.id)}>
                          <i className="fas fa-trash-alt" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManage;
