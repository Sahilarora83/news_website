import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, close, categories = [], tags = [] }) => {
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
        <div style={{ padding: '20px 22px 5px', fontSize: '0.82rem', color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>
          श्रेणियां
        </div>
        <div className="sb-category-grid" style={{ padding: '0 10px' }}>
          {categories.map((category) => (
            <Link key={category} to={`/search?q=${encodeURIComponent(category)}`} className="sb-item" onClick={close}>
              <span className="sb-item-text">{category}</span>
            </Link>
          ))}
        </div>

        {tags.length > 0 ? (
          <>
            <div style={{ padding: '20px 22px 5px', fontSize: '0.82rem', color: '#888', fontWeight: '700', textTransform: 'uppercase' }}>
              प्रमुख टैग्स
            </div>
            <div className="sb-tag-cloud" style={{ padding: '0 22px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  style={{ fontSize: '0.75rem', color: '#555', background: '#f1f5f9', padding: '4px 10px', borderRadius: 4, textDecoration: 'none' }}
                  onClick={close}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
};

export default Sidebar;
