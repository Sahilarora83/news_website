import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const CityDrawer = ({ isOpen, close, locations = [] }) => {
  const [query, setQuery] = useState('');

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return locations.filter((location) => location.toLowerCase().includes(normalized));
  }, [locations, query]);

  return (
    <aside className={`city-drawer ${isOpen ? 'active' : ''}`}>
      <div className="city-header">
        <span className="city-title">अपना इलाका चुनें</span>
        <button className="city-close" onClick={close} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className="city-search">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="text"
          placeholder="राज्य खोजें..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="city-section-title">उपलब्ध राज्य</div>
      <div className="city-list">
        {filteredLocations.map((location) => (
          <div key={location} className="city-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <Link to={`/search?q=${encodeURIComponent(location)}`} onClick={close} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
              <span>{location}</span>
            </Link>
            <button
              className="city-follow"
              type="button"
              onClick={() => {
                localStorage.setItem('pinnedCity', location);
                window.dispatchEvent(new Event('storage'));
                close();
              }}
              style={{ padding: '4px 10px', fontSize: '0.8rem', border: '1px solid #de1f27', color: '#de1f27', borderRadius: '4px' }}
            >
              फ़ॉलो करें
            </button>
          </div>
        ))}
        {!filteredLocations.length ? (
          <div style={{ padding: '16px 0', color: '#666', fontSize: '0.9rem' }}>कोई मिलान नहीं मिला.</div>
        ) : null}
      </div>
    </aside>
  );
};

export default CityDrawer;
