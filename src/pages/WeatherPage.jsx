import React, { useEffect, useState } from 'react';
import './WeatherPage.css';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '382a07ba1a2cc8d10ef74e13093670d2';

const WeatherPage = () => {
  const [data, setData] = useState({ current: null, forecast: [], loading: true, error: null });

  const fetchFullWeather = async (lat, lon, city = 'Delhi') => {
    try {
      setData(prev => ({ ...prev, loading: true }));
      
      // 1. Current Weather
      let currentUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
      if (lat && lon) currentUrl += `&lat=${lat}&lon=${lon}`;
      else currentUrl += `&q=${city}`;

      const resCurrent = await fetch(currentUrl);
      if (!resCurrent.ok) throw new Error('Failed to fetch current weather');
      const currentJson = await resCurrent.json();

      // 2. 5 Day Forecast
      let forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric`;
      if (lat && lon) forecastUrl += `&lat=${lat}&lon=${lon}`;
      else forecastUrl += `&q=${city}`;

      const resForecast = await fetch(forecastUrl);
      if (!resForecast.ok) throw new Error('Failed to fetch forecast');
      const forecastJson = await resForecast.json();

      // Process forecast (get mid-day for each day)
      const daily = forecastJson.list.filter(item => item.dt_txt.includes('12:00:00'));

      setData({
        current: {
          temp: Math.round(currentJson.main.temp),
          city: currentJson.name,
          country: currentJson.sys.country,
          icon: currentJson.weather[0].icon,
          desc: currentJson.weather[0].description,
          humidity: currentJson.main.humidity,
          wind: currentJson.wind.speed,
          feels: Math.round(currentJson.main.feels_like),
          pressure: currentJson.main.pressure,
          visibility: (currentJson.visibility / 1000).toFixed(1)
        },
        forecast: daily.map(d => ({
          date: new Date(d.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
          temp: Math.round(d.main.temp),
          icon: d.weather[0].icon,
          desc: d.weather[0].description
        })),
        loading: false,
        error: null
      });
    } catch (err) {
      setData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchFullWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchFullWeather(null, null, 'New Delhi')
      );
    } else {
      fetchFullWeather(null, null, 'New Delhi');
    }
  }, []);

  if (data.loading) {
    return (
      <div className="weather-page-loading">
        <div className="weather-spinner" />
        <p>Loading weather details...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="weather-page-error">
        <h2>Oops! Weather data not available.</h2>
        <p>{data.error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const { current, forecast } = data;

  return (
    <div className="weather-page container">
      <div className="weather-hero-card">
        <div className="weather-hero-main">
          <div className="weather-hero-info">
            <h1 className="weather-hero-city">{current.city}, {current.country}</h1>
            <p className="weather-hero-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <div className="weather-hero-temp-row">
              <span className="weather-hero-temp">{current.temp}°</span>
              <img src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`} alt={current.desc} />
            </div>
            <h2 className="weather-hero-desc">{current.desc}</h2>
          </div>
          
          <div className="weather-hero-stats">
            <div className="weather-stat-box">
              <i className="fas fa-temperature-half" />
              <div className="stat-text">
                <span>Feels Like</span>
                <strong>{current.feels}°C</strong>
              </div>
            </div>
            <div className="weather-stat-box">
              <i className="fas fa-droplet" />
              <div className="stat-text">
                <span>Humidity</span>
                <strong>{current.humidity}%</strong>
              </div>
            </div>
            <div className="weather-stat-box">
              <i className="fas fa-wind" />
              <div className="stat-text">
                <span>Wind Speed</span>
                <strong>{current.wind} km/h</strong>
              </div>
            </div>
            <div className="weather-stat-box">
              <i className="fas fa-eye" />
              <div className="stat-text">
                <span>Visibility</span>
                <strong>{current.visibility} km</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="weather-forecast-section">
        <h3 className="section-title">5-Day Forecast</h3>
        <div className="forecast-grid">
          {forecast.map((f, idx) => (
            <div key={idx} className="forecast-card">
              <span className="forecast-date">{f.date}</span>
              <img src={`https://openweathermap.org/img/wn/${f.icon}@2x.png`} alt={f.desc} />
              <span className="forecast-temp">{f.temp}°C</span>
              <span className="forecast-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="weather-page-footer">
        Data provided by OpenWeatherMap API
      </div>
    </div>
  );
};

export default WeatherPage;
