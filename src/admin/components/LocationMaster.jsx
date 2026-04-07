import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../../lib/api';

const initialForm = {
  id: '',
  name: '',
  stateId: '',
  districtId: '',
  lat: '',
  lng: '',
};

const typeMap = {
  states: 'state',
  districts: 'district',
  cities: 'city',
};

const LocationMaster = ({ authHeaders }) => {
  const [activeTab, setActiveTab] = useState('cities');
  const [locations, setLocations] = useState({ states: [], districts: [], cities: [] });
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/admin/locations'), { headers: authHeaders });
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      setMessage('Failed to load location data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    setForm((current) => ({
      ...initialForm,
      stateId: current.stateId || String(locations.states[0]?.id || ''),
      districtId: current.districtId || String(locations.districts[0]?.id || ''),
    }));
  }, [activeTab, locations.states, locations.districts]);

  const currentItems = locations[activeTab] || [];
  const stateOptions = locations.states || [];
  const districtOptions = useMemo(() => {
    if (!form.stateId) {
      return locations.districts || [];
    }

    if (activeTab === 'districts') {
      return locations.districts || [];
    }

    return (locations.districts || []).filter((item) => String(item.stateId) === String(form.stateId));
  }, [activeTab, form.stateId, locations.districts]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      stateId: String(stateOptions[0]?.id || ''),
      districtId: String(districtOptions[0]?.id || ''),
    });
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Name is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      };

      if (activeTab === 'districts') {
        payload.stateId = Number(form.stateId || stateOptions[0]?.id || 0);
      }

      if (activeTab === 'cities') {
        payload.districtId = Number(form.districtId || districtOptions[0]?.id || 0);
        payload.lat = form.lat || 0;
        payload.lng = form.lng || 0;
      }

      const isEditing = Boolean(form.id);
      const response = await fetch(
        apiUrl(
          isEditing
            ? `/api/admin/locations/${typeMap[activeTab]}/${form.id}`
            : `/api/admin/locations/${typeMap[activeTab]}`,
        ),
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: authHeaders,
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Save failed');
      }

      await fetchLocations();
      resetForm();
      setMessage(isEditing ? 'Location updated successfully.' : 'Location added successfully.');
    } catch (error) {
      setMessage(error.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  const editLocation = (location) => {
    const stateId =
      activeTab === 'states'
        ? ''
        : activeTab === 'districts'
          ? String(location.stateId || '')
          : String(
              locations.districts.find((item) => Number(item.id) === Number(location.districtId))?.stateId || '',
            );

    setForm({
      id: String(location.id),
      name: location.name || '',
      stateId,
      districtId: String(location.districtId || ''),
      lat: location.lat != null ? String(location.lat) : '',
      lng: location.lng != null ? String(location.lng) : '',
    });
    setMessage('');
  };

  const deleteLocation = async (locationId) => {
    if (!window.confirm('Delete this location?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/locations/${typeMap[activeTab]}/${locationId}`), {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Delete failed');
      }

      await fetchLocations();
      if (String(form.id) === String(locationId)) {
        resetForm();
      }
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="admin-location-master">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-page-title">Locations</h2>
          <p className="admin-page-note">Manage full CRUD for states, districts, and cities here.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={activeTab === 'states' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('states')}>
            States
          </button>
          <button className={activeTab === 'districts' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('districts')}>
            Districts
          </button>
          <button className={activeTab === 'cities' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('cities')}>
            Cities
          </button>
        </div>
      </div>

      <form className="form-section-card admin-form-grid admin-form-grid-four" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            className="input-modern"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder={`New ${activeTab.slice(0, -1)} name`}
          />
        </div>

        {activeTab !== 'states' ? (
          <div className="form-group">
            <label className="form-label">State</label>
            <select
              className="input-modern"
              value={form.stateId}
              onChange={(event) =>
                setForm({
                  ...form,
                  stateId: event.target.value,
                  districtId: String(
                    (locations.districts || []).find((item) => String(item.stateId) === String(event.target.value))?.id || '',
                  ),
                })
              }
            >
              {stateOptions.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div />
        )}

        {activeTab === 'cities' ? (
          <div className="form-group">
            <label className="form-label">District</label>
            <select
              className="input-modern"
              value={form.districtId}
              onChange={(event) => setForm({ ...form, districtId: event.target.value })}
            >
              {districtOptions.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div />
        )}

        {activeTab === 'cities' ? (
          <div className="form-group">
            <label className="form-label">Geo Coords</label>
            <div className="admin-form-grid admin-form-grid-two" style={{ gap: 12 }}>
              <input
                className="input-modern"
                value={form.lat}
                onChange={(event) => setForm({ ...form, lat: event.target.value })}
                placeholder="Lat"
              />
              <input
                className="input-modern"
                value={form.lng}
                onChange={(event) => setForm({ ...form, lng: event.target.value })}
                placeholder="Lng"
              />
            </div>
          </div>
        ) : (
          <div />
        )}

        <div className="form-group admin-form-submit" style={{ gap: 12 }}>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update' : 'Add'}
          </button>
          {form.id ? (
            <button className="btn-secondary" type="button" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {message ? <div className="admin-inline-message">{message}</div> : null}

      {loading ? (
        <div className="admin-loading-screen" style={{ height: '240px' }}>Loading locations...</div>
      ) : (
        <div className="table-card">
          <header className="card-header">
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {activeTab === 'states' ? 'States list' : activeTab === 'districts' ? 'Districts list' : 'Cities list'}
            </h4>
          </header>
          <div className="table-responsive">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Slug</th>
                  {activeTab === 'districts' ? <th>State</th> : null}
                  {activeTab === 'cities' ? <th>District</th> : null}
                  {activeTab === 'cities' ? <th>Geo</th> : null}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((location) => {
                  const stateName = stateOptions.find((item) => Number(item.id) === Number(location.stateId))?.name || '-';
                  const districtName = (locations.districts || []).find((item) => Number(item.id) === Number(location.districtId))?.name || '-';

                  return (
                    <tr key={location.id}>
                      <td>#{location.id}</td>
                      <td style={{ fontWeight: 700, color: '#111827' }}>{location.name}</td>
                      <td>/{location.slug}</td>
                      {activeTab === 'districts' ? <td>{stateName}</td> : null}
                      {activeTab === 'cities' ? <td>{districtName}</td> : null}
                      {activeTab === 'cities' ? <td>{location.lat || 0} / {location.lng || 0}</td> : null}
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-ghost" onClick={() => editLocation(location)}>
                            <i className="fas fa-edit" />
                          </button>
                          <button className="btn-ghost danger" onClick={() => deleteLocation(location.id)}>
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMaster;
