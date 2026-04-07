import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './WeatherWidget.css';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '382a07ba1a2cc8d10ef74e13093670d2';

const conditionIconMap = [
  { match: /thunder/i, icon: 'fa-bolt' },
  { match: /snow/i, icon: 'fa-snowflake' },
  { match: /(rain|drizzle|shower)/i, icon: 'fa-cloud-rain' },
  { match: /cloud/i, icon: 'fa-cloud' },
  { match: /mist|fog|haze|smoke|dust|sand|ash/i, icon: 'fa-smog' },
  { match: /clear/i, icon: 'fa-sun' },
];

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat, lon, city = 'Delhi') => {
    try {
      setLoading(true);
      let url = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
      if (lat && lon) {
        url += `&lat=${lat}&lon=${lon}`;
      } else {
        url += `&q=${city}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetching failed');
      const data = await res.json();
      const description = data.weather?.[0]?.description || 'Clear';
      const iconClass = conditionIconMap.find((item) => item.match.test(description))?.icon || 'fa-cloud-sun';

      const weatherData = {
        temp: Math.round(data.main.temp),
        city: data.name,
        iconClass,
        description,
        humidity: data.main.humidity,
        wind: data.wind.speed,
        timestamp: Date.now(),
      };

      setWeather(weatherData);
      localStorage.setItem('cached_weather', JSON.stringify(weatherData));
    } catch (err) {
      setError(err.message);
      const cached = localStorage.getItem('cached_weather');
      if (cached) {
        setWeather(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('cached_weather');
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < 30 * 60 * 1000) {
        setWeather(data);
        setLoading(false);
        return;
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(null, null, 'New Delhi'),
      );
    } else {
      fetchWeather(null, null, 'New Delhi');
    }
  }, []);

  if (loading && !weather) return null;
  if (error && !weather) return null;
  if (!weather) return null;

  return (
    <Link to="/weather" className="weather-link-wrapper">
      <div className="weather-widget-pro">
        <div className="weather-left">
          <span className="weather-city">{weather.city}</span>
          <span className="weather-desc">{weather.description}</span>
        </div>
        <div className="weather-main">
          <i className={`weather-icon fas ${weather.iconClass || 'fa-cloud-sun'}`} aria-hidden="true" />
          <span className="weather-temp">{weather.temp}°C</span>
        </div>
        <div className="weather-details">
          <div className="weather-detail-item">
            <i className="fas fa-droplet" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="weather-detail-item">
            <i className="fas fa-wind" />
            <span>{weather.wind} km/h</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WeatherWidget;
