import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const moreLinks = [
  'क्रिकेट',
  'ज्योतिष',
  'क्विज़',
  'टेक',
  'ऑटो',
  'विशेष',
  'शॉर्ट वीडियोज',
  'आवाज',
  'फोटो गैलरी',
  'हेल्थ',
  'फैशन',
  'धर्म',
  'दुनिया',
  'शब्द खोज',
  'नौकरी',
  'शिक्षा',
  'राशिफल',
  'ई-पेपर',
];

const Header = ({ toggleSidebar, toggleCityDrawer }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

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
          <Link to="/" className="mobile-logo" aria-label="प्रथम गेंडा NEWS">
            <span className="mobile-logo-top">
              <span className="mobile-logo-text">प्रथम गेंडा</span>
              <span className="mobile-logo-news">NEWS</span>
            </span>
            <span className="mobile-logo-line" />
            <span className="mobile-logo-tagline">सच आईने की तरह...</span>
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
          <input ref={mobileSearchInputRef} id="mobileSearchInput" type="text" placeholder="search" />
          <button className="mobile-icon-btn" id="mobileSearchClose" type="button" aria-label="Close search" onClick={closeSearchPanels}>
            <i className="fas fa-xmark" />
          </button>
        </div>
      </div>

      <header className="header-branding">
        <div className="top-inner">
          <Link to="/" className="logo-text-wrapper" aria-label="प्रथम गेंडा NEWS">
            <div className="logo-mainline">
              <div className="logo-primary">प्रथम गेंडा</div>
              <div className="logo-news-box">NEWS</div>
            </div>
            <div className="logo-divider" />
            <div className="logo-tagline">सच आईने की तरह...</div>
          </Link>
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
            <button className="nav-brand-badge" type="button" aria-label="प्रथम गेंडा विशेष">
              <i className="fas fa-crown badge-crown" />
              <span className="badge-text">PG</span>
            </button>
            <button className="nav-btn" type="button">
              देश
            </button>
            <button className="nav-btn" type="button">
              शहर और राज्य
            </button>
            <button className="nav-btn" type="button">
              चुनाव
            </button>
            <button className="nav-btn" type="button">
              कारोबार
            </button>
            <button className="nav-btn" type="button">
              मनोरंजन
            </button>
            <div className={`more-wrapper ${isMoreOpen ? 'open' : ''}`} id="moreMenuWrapper" ref={moreMenuRef}>
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
                {moreLinks.map((label) => (
                  <a
                    key={label}
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      closeMoreMenu();
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
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
            <input ref={desktopSearchInputRef} id="navSearchInput" type="text" placeholder="Search" />
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
        <button className="mobile-bottom-link" type="button">
          <i className="fas fa-circle-play" />
          <span>वीडियो</span>
        </button>
        <button className="mobile-bottom-link mobile-bottom-premium" type="button" aria-label="Premium">
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
              PG
            </text>
          </svg>
        </button>
        <button className="mobile-bottom-link" type="button">
          <i className="fas fa-camera" />
          <span>फोटो</span>
        </button>
        <button className="mobile-bottom-link" type="button">
          <i className="fas fa-newspaper" />
          <span>ई-पेपर</span>
        </button>
      </nav>
    </>
  );
};

export default Header;
