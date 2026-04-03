import React from 'react';

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
          <div className="sb-user-name">नमस्ते, अतिथि</div>
        </div>
      </div>

      <div className="sb-menu">
        <a href="#" className="sb-item">
          <span className="sb-item-text">मेरी खबरें</span>
          <div className="sb-icon-box">
            <i className="fa-solid fa-chevron-right" />
          </div>
        </a>
        <a href="#" className="sb-item">
          <span className="sb-item-text sb-item-feature">प्रीमियम</span>
          <div className="sb-icon-box gold-crown">
            <i className="fa-solid fa-crown" />
          </div>
        </a>
        <a href="#" className="sb-item">
          <span className="sb-item-text">शहर चुनें</span>
          <div className="sb-icon-box">
            <i className="fa-solid fa-location-dot" />
          </div>
        </a>

        <div style={{ padding: '20px 22px 10px', fontSize: '0.82rem', color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>
          श्रेणियाँ
        </div>

        <a href="#" className="sb-item"><span className="sb-item-text">देश</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">प्रदेश</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">राजनीति</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">दुनिया</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">मनोरंजन</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">खेल</span></a>
        <a href="#" className="sb-item"><span className="sb-item-text">बिजनेस</span></a>
      </div>
    </aside>
  );
};

export default Sidebar;
