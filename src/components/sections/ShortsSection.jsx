import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const getShortThumbnail = (item) => {
  if (item.image && !item.image.includes('fallback-svg')) return item.image;
  
  if (item.videoUrl) {
    const ytIdMatch = item.videoUrl.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytIdMatch) {
      return `https://img.youtube.com/vi/${ytIdMatch[1]}/hqdefault.jpg`;
    }
  }
  
  return resolveImageUrl(item.image);
};

const ShortsSection = ({ items = [], title }) => {
  const displayTitle = title || 'शॉर्ट वीडियो';

  return (
    <section className="shorts-section container" aria-label={displayTitle}>
      <div className="shorts-header">
        <Link to="/shorts">
          <h2 className="shorts-title">{displayTitle}</h2>
          <i className="fas fa-arrow-right" style={{ fontSize: '1.2rem', marginLeft: '5px', color: '#de1f27' }} />
        </Link>
      </div>

      <div className="shorts-grid">
        {items.slice(0, 10).map((item) => {
          const thumbUrl = getShortThumbnail(item);
          
          return (
            <article key={item.id} className="shorts-card">
              <Link to={`/short/${item.slug || item.id}`} style={{ textDecoration: 'none' }}>
                <div className="shorts-card-media">
                  <img src={thumbUrl} alt={item.title} loading="lazy" />
                  <div className="shorts-play-overlay" aria-hidden="true">
                    <i className="fas fa-play" />
                  </div>
                </div>
                <div className="shorts-card-caption">
                  <h3>{item.title}</h3>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ShortsSection;
