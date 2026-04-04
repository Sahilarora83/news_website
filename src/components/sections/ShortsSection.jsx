import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const ShortsSection = ({ items = [], title }) => {
  const displayTitle = title || 'शॉर्ट वीडियो';

  return (
    <section className="shorts-section container" aria-label={displayTitle}>
      <div className="shorts-header">
        <Link to={`/search?q=${encodeURIComponent(displayTitle)}`}>
          <h2 className="shorts-title">{displayTitle}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="shorts-grid">
        {items.map((item) => (
          <article key={item.id} className="shorts-card">
            <Link to={`/article/${item.id}`} className="shorts-card-media">
              <img src={resolveImageUrl(item.image)} alt={item.title} />
              <span className="shorts-play" aria-hidden="true">
                <i className="fas fa-play" />
              </span>
            </Link>
            <div className="shorts-copy">
              <h3>
                <Link to={`/article/${item.id}`}>{item.title}</Link>
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ShortsSection;
