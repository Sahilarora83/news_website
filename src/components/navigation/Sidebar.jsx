import React from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ width: 20, height: 20, flex: '0 0 20px' }}>
    {children}
  </svg>
);

const icons = {
  crown: (
    <Icon>
      <path d="M4 18h16l-1.4-8-4.1 3-2.5-5-2.5 5-4.1-3L4 18z" fill="currentColor" />
    </Icon>
  ),
  epaper: (
    <Icon>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="8" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="7" y="12" width="7" height="2" rx="1" fill="currentColor" opacity="0.75" />
    </Icon>
  ),
  location: (
    <Icon>
      <path d="M12 20s5-5.6 5-10a5 5 0 1 0-10 0c0 4.4 5 10 5 10z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="1.8" fill="currentColor" />
    </Icon>
  ),
  brief: (
    <Icon>
      <rect x="4" y="5" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="8" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="7" y="12" width="10" height="2" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="7" y="16" width="6" height="2" rx="1" fill="currentColor" opacity="0.65" />
    </Icon>
  ),
  shorts: (
    <Icon>
      <rect x="3.5" y="6" width="17" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" />
      <path d="M7 4.5l2 1.5M12 4.5l2 1.5M17 4.5l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </Icon>
  ),
  team: (
    <Icon>
      <rect x="4" y="6" width="16" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="11" r="1.7" fill="currentColor" />
      <circle cx="15" cy="11" r="1.7" fill="currentColor" opacity="0.82" />
      <path d="M6.8 16c.5-1.5 1.7-2.4 3.2-2.4S12.7 14.5 13.2 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.8 16c.35-1.2 1.25-1.95 2.45-1.95 1.1 0 1.95.67 2.3 1.95" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </Icon>
  ),
};

const topItems = [
  { label: 'अमर उजाला विशेष', icon: icons.crown, to: '/search?q=अमर उजाला विशेष', feature: true },
  { label: 'ई-पेपर', icon: icons.epaper, to: '/epaper' },
  { label: 'अपना शहर चुनें', icon: icons.location, to: '/search?q=अपना शहर' },
  { label: 'न्यूज ब्रीफ', icon: icons.brief, to: '/search?q=न्यूज ब्रीफ' },
  { label: 'शॉर्ट वीडियोज', icon: icons.shorts, to: '/shorts' },
  { label: 'हमारी टीम', icon: icons.team, to: '/our-team' },
];

const followItems = [
  'देश',
  'दुनिया',
  'मनोरंजन',
  'क्रिकेट',
  'कारोबार',
  'नौकरी',
  'शिक्षा',
  'टेक्नोलॉजी',
  'ऑटो',
  'ज्योतिष',
  'खेल',
  'हेल्थ एंड फिटनेस',
  'फैशन',
  'शक्ति',
  'आस्था',
  'बॉलीवुड',
];

const Sidebar = ({ isOpen, close }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sb-header">
        <div className="sb-topbar">
          <button className="sb-back-btn" onClick={close} type="button">
            <i className="fa-solid fa-arrow-left" />
          </button>
        </div>
        <div className="sb-user-row">
          <div className="sb-user-avatar">
            <i className="fa-solid fa-circle-user" />
          </div>
          <div className="sb-user-name">Login or Signup</div>
        </div>
      </div>

      <div className="sb-menu">
        {topItems.map((item) => (
          <Link key={item.label} to={item.to} className={`sb-item${item.feature ? ' sb-item-feature' : ''}`} onClick={close}>
            <span className="sb-item-text">{item.label}</span>
            <span className={`sb-icon-box${item.feature ? ' gold-crown' : ''}`}>{item.icon}</span>
          </Link>
        ))}

        {followItems.map((item) => (
          <Link key={item} to={`/search?q=${encodeURIComponent(item)}`} className="sb-item" onClick={close}>
            <span className="sb-item-text">{item}</span>
            <span className="follow-pill">Follow</span>
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
