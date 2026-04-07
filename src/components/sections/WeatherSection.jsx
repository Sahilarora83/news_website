import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './WeatherSection.css';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '382a07ba1a2cc8d10ef74e13093670d2';

const CITIES = [
  { name: 'New Delhi', hindi: 'नई दिल्ली' },
  { name: 'Lucknow', hindi: 'लखनऊ' },
  { name: 'Patna', hindi: 'पटना' },
  { name: 'Bhopal', hindi: 'भोपाल' },
  { name: 'Ranchi', hindi: 'रांची' },
  { name: 'Jaipur', hindi: 'जयपुर' }
];

const WeatherSection = () => {
  const [weatherData, setWeatherData] = useState({});
  const [activeCity, setActiveCity] = useState('New Delhi');

  const fetchCityWeather = async (city) => {
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
      if (!res.ok) return null;
      const data = await res.json();
      return {
        temp: Math.round(data.main.temp),
        status: data.weather[0].main,
        icon: data.weather[0].icon
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      const results = {};
      await Promise.all(CITIES.map(async (city) => {
        const data = await fetchCityWeather(city.name);
        if (data) results[city.name] = data;
      }));
      setWeatherData(results);
    };
    loadAll();
  }, []);

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('clear')) return 'status-clear';
    if (s.includes('cloud')) return 'status-clouds';
    if (s.includes('rain') || s.includes('drizzle')) return 'status-rain';
    return 'status-other';
  };

  return (
    <div className="weather-sidebar-widget">
      <div className="sidebar-widget-header">
        <Link to="/weather" className="sidebar-widget-title">
          मौसम अपडेट <i className="fas fa-chevron-right" />
        </Link>
      </div>

      <div className="weather-sidebar-grid">
        {CITIES.map((city) => {
          const info = weatherData[city.name] || { temp: '--', status: 'Loading', icon: '01d' };
          const statusClass = getStatusClass(info.status);

          return (
            <div 
              key={city.name} 
              className={`weather-sidebar-card ${activeCity === city.name ? 'active' : ''}`}
              onClick={() => setActiveCity(city.name)}
            >
              <div className="sidebar-card-top">
                <span className="sidebar-city-name">{city.hindi}</span>
              </div>
              <div className="sidebar-card-body">
                <img 
                  src={`https://openweathermap.org/img/wn/${info.icon}@2x.png`} 
                  alt={info.status} 
                  className="sidebar-weather-icon"
                />
                <span className="sidebar-temp">{info.temp}°C</span>
              </div>
              <div className={`sidebar-status-badge ${statusClass}`}>
                <span className="status-dot" />
                {info.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherSection;
