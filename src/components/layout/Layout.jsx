import React, { useEffect, useState } from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Sidebar from '../navigation/Sidebar';
import CityDrawer from '../navigation/CityDrawer';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCityDrawerOpen, setIsCityDrawerOpen] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showAdPopup, setShowAdPopup] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((value) => !value);
  const toggleCityDrawer = () => setIsCityDrawerOpen((value) => !value);

  useEffect(() => {
    const cookieDismissed = localStorage.getItem('pratham_genda_cookie_banner_dismissed');
    if (!cookieDismissed) {
      const timer = window.setTimeout(() => setShowCookieBanner(true), 2000);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowAdPopup(true), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleCookieDismiss = () => {
    setShowCookieBanner(false);
    localStorage.setItem('pratham_genda_cookie_banner_dismissed', '1');
  };

  return (
    <div className="app-container">
      <Header toggleSidebar={toggleSidebar} toggleCityDrawer={toggleCityDrawer} />

      <Sidebar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
      <CityDrawer isOpen={isCityDrawerOpen} close={() => setIsCityDrawerOpen(false)} />

      <div
        className={`overlay ${(isSidebarOpen || isCityDrawerOpen) ? 'active' : ''}`}
        onClick={() => {
          setIsSidebarOpen(false);
          setIsCityDrawerOpen(false);
        }}
      />

      <main className="main-content">{children}</main>

      {showCookieBanner ? (
        <div className="cookie-banner active">
          <div className="cookie-banner-inner">
            <span className="cookie-banner-text">
              हम आपके ब्राउज़िंग अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं।{' '}
              <a href="#">अधिक जानें</a>
            </span>
            <button className="cookie-banner-btn" onClick={handleCookieDismiss} type="button">
              ठीक है
            </button>
          </div>
        </div>
      ) : null}

      {showAdPopup ? (
        <div className="ad-popup-overlay" style={{ display: 'flex' }}>
          <div className="ad-popup-container">
            <button className="ad-popup-close" onClick={() => setShowAdPopup(false)} type="button">
              <i className="fa-solid fa-xmark" />
            </button>
            <img
              src="https://tpc.googlesyndication.com/pagead/imgad?id=CICAgJCGme3czAEQARgBMgiGSvI3O5ZFKw"
              alt="Ad"
            />
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
};

export default Layout;
