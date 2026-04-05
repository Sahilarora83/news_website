import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFollowedCities, followCityRequest, unfollowCityRequest } from '../../lib/cityFollows';

const CityDrawer = ({ isOpen, close, locations = [] }) => {
  const [query, setQuery] = useState('');
  const [followedCities, setFollowedCities] = useState([]);
  const [pendingCity, setPendingCity] = useState('');

  useEffect(() => {
    fetchFollowedCities()
      .then((items) => setFollowedCities(items))
      .catch(() => setFollowedCities([]));
  }, []);

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return locations.filter((location) => location.toLowerCase().includes(normalized));
  }, [locations, query]);

  const followedSet = useMemo(
    () => new Set(followedCities.map((city) => String(city).toLowerCase())),
    [followedCities],
  );

  const followedMatches = useMemo(
    () => filteredLocations.filter((location) => followedSet.has(String(location).toLowerCase())),
    [filteredLocations, followedSet],
  );

  const availableMatches = useMemo(
    () => filteredLocations.filter((location) => !followedSet.has(String(location).toLowerCase())),
    [filteredLocations, followedSet],
  );

  const toggleFollow = async (city) => {
    setPendingCity(city);

    try {
      if (followedSet.has(String(city).toLowerCase())) {
        await unfollowCityRequest(city);
        setFollowedCities((current) => current.filter((item) => item.toLowerCase() !== city.toLowerCase()));

        if (localStorage.getItem('pinnedCity') === city) {
          localStorage.removeItem('pinnedCity');
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        await followCityRequest(city);
        setFollowedCities((current) => (current.includes(city) ? current : [...current, city]));
        localStorage.setItem('pinnedCity', city);
        window.dispatchEvent(new Event('storage'));
      }
    } finally {
      setPendingCity('');
    }
  };

  const renderCityRow = (location, isFollowed) => {
    const isPending = pendingCity === location;

    return (
      <div key={location} className="city-item">
        <Link to={`/search?q=${encodeURIComponent(location)}`} onClick={close} className="city-link">
          <span>{location}</span>
        </Link>
        <button
          className={`city-follow ${isFollowed ? 'active' : ''}`}
          type="button"
          disabled={isPending}
          onClick={() => toggleFollow(location)}
        >
          {isPending ? '...' : isFollowed ? 'फॉलो किया' : 'फॉलो करें'}
        </button>
      </div>
    );
  };

  return (
    <aside className={`city-drawer ${isOpen ? 'active' : ''}`}>
      <div className="city-header">
        <span className="city-title">अपना शहर चुनें</span>
        <button className="city-close" onClick={close} type="button" aria-label="Close city drawer">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="city-search">
        <i className="fa-solid fa-magnifying-glass" />
        <input
          type="text"
          placeholder="शहर खोजें..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {followedMatches.length > 0 ? (
        <>
          <div className="city-section-title">फॉलो किए शहर</div>
          <div className="city-list city-list-followed">{followedMatches.map((location) => renderCityRow(location, true))}</div>
        </>
      ) : null}

      <div className="city-section-title">{followedMatches.length > 0 ? 'अन्य उपलब्ध शहर' : 'उपलब्ध शहर'}</div>

      <div className="city-list">
        {availableMatches.map((location) => renderCityRow(location, false))}
        {!filteredLocations.length ? <div className="city-empty-state">कोई मिलान नहीं मिला.</div> : null}
      </div>
    </aside>
  );
};

export default CityDrawer;
