import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar, toggleCityDrawer, config, categories = [] }) => {
  const siteName1 = (config?.siteNamePrimary || '').replace('प्रथम गेंडा', 'प्रथम एजेंडा');
  const siteName2 = config?.siteNameSecondary || '';
  const tagline = config?.siteTagline || '';

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const mainCategories = categories.filter((category) => category !== 'होम').slice(0, 6);
  const overflowCategories = categories.filter((category) => category !== 'होम').slice(6);

  const closeMoreMenu = () => setIsMoreOpen(false);

  const closeSearchPanels = () => {
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const openSearchPanel = () => {
    closeMoreMenu();

    if (window.innerWidth <= 768) {
      setMobileSearchOpen(true);
      requestAnimationFrame(() => mobileSearchInputRef.current?.focus());
      return;
    }

    setDesktopSearchOpen(true);
    requestAnimationFrame(() => desktopSearchInputRef.current?.focus());
  };

  const toggleMoreMenu = () => {
    closeSearchPanels();
    setIsMoreOpen((value) => !value);
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        closeMoreMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMoreMenu();
        closeSearchPanels();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className={`mobile-topbar ${mobileSearchOpen ? 'search-open' : ''}`}>
        <div className="mobile-topbar-inner">
          <button className="mobile-icon-btn js-open-sidebar" type="button" aria-label="Open menu" onClick={toggleSidebar}>
            <i className="fas fa-bars" />
          </button>
          <Link to="/" className="mobile-logo" aria-label={`${siteName1} ${siteName2}`.trim() || 'Home'}>
            <span className="mobile-logo-top">
              <span className="mobile-logo-text">{siteName1}</span>
              <span className="mobile-logo-news">{siteName2}</span>
            </span>
            <span className="mobile-logo-line" />
            <span className="mobile-logo-tagline">{tagline}</span>
          </Link>
          <button className="mobile-city-btn js-open-city" type="button" aria-label="Open city drawer" onClick={toggleCityDrawer}>
            <span>मेरा शहर</span>
            <i className="fas fa-location-dot" />
          </button>
          <button className="mobile-icon-btn js-open-search" type="button" aria-label="Open search" onClick={openSearchPanel}>
            <i className="fas fa-search" />
          </button>
        </div>

        <div className="mobile-searchbar" id="mobileSearchbar">
          <button className="mobile-icon-btn js-open-sidebar" type="button" aria-label="Open menu" onClick={toggleSidebar}>
            <i className="fas fa-bars" />
          </button>
          <input
            ref={mobileSearchInputRef}
            id="mobileSearchInput"
            type="text"
            placeholder="खोजें"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                window.location.href = `/search?q=${encodeURIComponent(event.target.value)}`;
              }
            }}
          />
          <button className="mobile-icon-btn" id="mobileSearchClose" type="button" aria-label="Close search" onClick={closeSearchPanels}>
            <i className="fas fa-xmark" />
          </button>
        </div>
      </div>

      <header className="header-branding">
        <div className="top-inner">
          <Link to="/" className="logo-text-wrapper" aria-label={`${siteName1} ${siteName2}`.trim() || 'Home'}>
            <div className="logo-mainline">
              <div className="logo-primary">{siteName1}</div>
              <div className="logo-news-box">{siteName2}</div>
            </div>
            <div className="logo-divider" />
            <div className="logo-tagline">{tagline}</div>
          </Link>

          <div className="header-ad-banner">
            <Link to="/">
              <img src="/970x90.jpg.jpeg" alt={`${siteName1} ${siteName2}`.trim() || 'News Banner'} />
            </Link>
          </div>
        </div>
      </header>

      <nav className={`au-navbar ${desktopSearchOpen ? 'search-open' : ''}`} id="mainNav">
        <div className="nav-inner">
          <div className="nav-main">
            <button className="nav-control js-open-sidebar" id="hamburgerBtn" type="button" aria-label="Open menu" onClick={toggleSidebar}>
              <i className="fas fa-bars" />
            </button>
            <Link to="/" className="nav-btn btn-home">
              होम
            </Link>
            <Link to="/search?q=%E0%A4%B5%E0%A4%BF%E0%A4%B6%E0%A5%87%E0%A4%B7" className="nav-brand-badge" aria-label="विशेष">
              <i className="fas fa-crown badge-crown" />
              <span className="badge-text">PA</span>
            </Link>

            {mainCategories.map((category) => (
              <Link key={category} to={`/search?q=${encodeURIComponent(category)}`} className="nav-btn">
                {category}
              </Link>
            ))}

            {overflowCategories.length > 0 ? (
              <div className={`more-wrapper ${isMoreOpen ? 'active' : ''}`} id="moreMenuWrapper" ref={moreMenuRef}>
                <button
                  className="nav-btn more-btn"
                  id="moreBtn"
                  type="button"
                  aria-expanded={isMoreOpen ? 'true' : 'false'}
                  onClick={toggleMoreMenu}
                >
                  More<span className="more-dots">•••</span>
                </button>
                <div className="more-menu" id="moreMenu">
                  {overflowCategories.map((label) => (
                    <Link
                      key={label}
                      to={`/search?q=${encodeURIComponent(label)}`}
                      onClick={() => closeMoreMenu()}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="nav-right">
            <button className="location-btn js-open-city" id="locationBtn" type="button" onClick={toggleCityDrawer}>
              <i className="fas fa-location-dot" />
              <span>मेरा शहर</span>
            </button>
            <button className="search-btn-trigger js-open-search" id="searchBtn" type="button" aria-label="Open search" onClick={openSearchPanel}>
              <i className="fas fa-search" />
            </button>
          </div>

          <div className="nav-search-panel" id="navSearchPanel">
            <button className="search-panel-menu js-open-sidebar" type="button" aria-label="Open menu" onClick={toggleSidebar}>
              <i className="fas fa-bars" />
            </button>
            <input
              ref={desktopSearchInputRef}
              id="navSearchInput"
              type="text"
              placeholder="खोजें"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  window.location.href = `/search?q=${encodeURIComponent(event.target.value)}`;
                }
              }}
            />
            <button className="search-close-btn" id="closeSearch" type="button" aria-label="Close search" onClick={closeSearchPanels}>
              <i className="fas fa-xmark" />
            </button>
          </div>
        </div>
      </nav>

      <nav className="mobile-bottom-nav" aria-label="Mobile quick links">
        <Link className="mobile-bottom-link active" to="/" aria-current="page">
          <i className="fas fa-house" />
          <span>होम</span>
        </Link>
        <Link className="mobile-bottom-link" to="/search?q=%E0%A4%B6%E0%A5%89%E0%A4%B0%E0%A5%8D%E0%A4%9F%20%E0%A4%B5%E0%A5%80%E0%A4%A1%E0%A4%BF%E0%A4%AF%E0%A5%8B">
          <i className="fas fa-circle-play" />
          <span>वीडियो</span>
        </Link>
        <Link className="mobile-bottom-link mobile-bottom-premium" to="/search?q=%E0%A4%B5%E0%A4%BF%E0%A4%B6%E0%A5%87%E0%A4%B7" aria-label="विशेष">
          <svg className="mobile-premium-badge" viewBox="0 0 64 64" role="img" aria-hidden="true">
            <defs>
              <linearGradient id="pgRing" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#2fe0ff" />
                <stop offset="1" stopColor="#0d7df1" />
              </linearGradient>
              <radialGradient id="pgCore" cx="0.35" cy="0.28" r="0.9">
                <stop offset="0" stopColor="#372213" />
                <stop offset="0.62" stopColor="#16120d" />
                <stop offset="1" stopColor="#050505" />
              </radialGradient>
              <linearGradient id="pgGold" x1="22" y1="18" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffd768" />
                <stop offset="1" stopColor="#ff9f1f" />
              </linearGradient>
            </defs>
            <circle cx="32" cy="32" r="30" fill="url(#pgRing)" />
            <circle cx="32" cy="32" r="26" fill="url(#pgCore)" />
            <path d="M24 14l4 5 4-7 4 7 4-5 1 10H23z" fill="url(#pgGold)" />
            <text
              x="32"
              y="41"
              textAnchor="middle"
              fill="url(#pgGold)"
              fontSize="24"
              fontWeight="800"
              fontFamily="Poppins, Arial, sans-serif"
            >
              PA
            </text>
          </svg>
        </Link>
        <Link className="mobile-bottom-link" to="/search?q=%E0%A4%AB%E0%A5%8B%E0%A4%9F%E0%A5%8B%20%E0%A4%97%E0%A5%88%E0%A4%B2%E0%A4%B0%E0%A5%80">
          <i className="fas fa-camera" />
          <span>फोटो</span>
        </Link>
        <Link className="mobile-bottom-link" to="/search?q=%E0%A4%88-%E0%A4%AA%E0%A5%87%E0%A4%AA%E0%A4%B0">
          <i className="fas fa-newspaper" />
          <span>ई-पेपर</span>
        </Link>
      </nav>
    </>
  );
};

export default Header;
