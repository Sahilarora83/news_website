import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Sidebar from '../navigation/Sidebar';
import CityDrawer from '../navigation/CityDrawer';
import { apiUrl } from '../../lib/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCityDrawerOpen, setIsCityDrawerOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [locationStates, setLocationStates] = useState([]);

  useEffect(() => {
    if (isAdminRoute) return;
    
    fetch(apiUrl('/api/home'))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setConfig(data.config);
        setCategories(data.categories || []);
        setTags(data.tags || []);
        setLocationStates(data.locationStates || []);
      })
      .catch(err => {
        console.error('Failed to load home config:', err);
      });
  }, [isAdminRoute]);

  useEffect(() => {
    if (isAdminRoute || !config) {
      return;
    }

    const titleParts = [config.siteNamePrimary, config.siteNameSecondary].filter(Boolean);
    if (titleParts.length > 0) {
      document.title = titleParts.join(' ').replace('प्रथम गेंडा', 'प्रथम एजेंडा');
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
      <Header toggleSidebar={toggleSidebar} toggleCityDrawer={toggleCityDrawer} config={config} categories={categories} />

      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} categories={categories} tags={tags} />
      <CityDrawer isOpen={isCityDrawerOpen} close={() => setIsCityDrawerOpen(false)} locations={locationStates} />

      <div
        className={`overlay ${(isSidebarOpen || isCityDrawerOpen) ? 'active' : ''}`}
        onClick={() => {
          setIsSidebarOpen(false);
          setIsCityDrawerOpen(false);
        }}
      />

      <main className="main-content">{children}</main>

      <Footer config={config} categories={categories} tags={tags} />
    </div>
  );
};

export default Layout;
