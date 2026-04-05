import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Sidebar from '../navigation/Sidebar';
import CityDrawer from '../navigation/CityDrawer';
import TrendingBar from '../home/TrendingBar';
import { apiUrl } from '../../lib/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCityDrawerOpen, setIsCityDrawerOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [locationStates, setLocationStates] = useState([]);
  const [locationCities, setLocationCities] = useState([]);
  const [pinnedCity, setPinnedCity] = useState(() => localStorage.getItem('pinnedCity') || '');

  useEffect(() => {
    if (isAdminRoute) return;

    fetch(apiUrl('/api/home'))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setConfig(data.config);
        setCategories(data.categories || []);
        setTags(data.tags || []);
        setTrendingTopics(data.trendingTopics || []);
        setLocationStates(data.locationStates || []);
        setLocationCities(data.locationCities || []);
      })
      .catch((err) => {
        console.error('Failed to load home config:', err);
      });
  }, [isAdminRoute]);

  useEffect(() => {
    const handleStorage = () => {
      setPinnedCity(localStorage.getItem('pinnedCity') || '');
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const displayTags = useMemo(() => {
    if (!pinnedCity) return tags;
    // Prepend pinned city as a tag if it's not already there
    const cityTag = pinnedCity;
    const exists = tags.some((t) => String(t).toLowerCase() === cityTag.toLowerCase());
    return exists ? tags : [cityTag, ...tags];
  }, [tags, pinnedCity]);

  const displayTrending = useMemo(() => {
    if (!pinnedCity) return trendingTopics;
    // Prepend pinned city as a trending topic if it's not already there
    const cityTopic = pinnedCity;
    const exists = trendingTopics.some((t) => String(t).toLowerCase() === cityTopic.toLowerCase());
    return exists ? trendingTopics : [cityTopic, ...trendingTopics];
  }, [trendingTopics, pinnedCity]);

  useEffect(() => {
    if (isAdminRoute || !config) {
      return;
    }

    const titleParts = [config.siteNamePrimary, config.siteNameSecondary].filter(Boolean);
    if (titleParts.length > 0) {
      document.title = titleParts.join(' ');
    }

    if (config.meta_description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', config.meta_description);
    }
  }, [config, isAdminRoute]);

  const toggleSidebar = () => setIsSidebarOpen((value) => !value);
  const toggleCityDrawer = () => setIsCityDrawerOpen((value) => !value);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <Header
        toggleSidebar={toggleSidebar}
        toggleCityDrawer={toggleCityDrawer}
        config={config}
        categories={categories}
        locationStates={locationStates}
        locationCities={locationCities}
      />

      {displayTrending.length > 0 && <TrendingBar topics={displayTrending} />}

      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} categories={categories} tags={displayTags} />
      <CityDrawer isOpen={isCityDrawerOpen} close={() => setIsCityDrawerOpen(false)} locations={locationCities} />

      <div
        className={`overlay ${isSidebarOpen || isCityDrawerOpen ? 'active' : ''}`}
        onClick={() => {
          setIsSidebarOpen(false);
          setIsCityDrawerOpen(false);
        }}
      />

      <main className="main-content">{children}</main>

      <Footer config={config} categories={categories} tags={displayTags} />
    </div>
  );
};

export default Layout;
