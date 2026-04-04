import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const FeatureSection = ({ title, items = [] }) => {
  const isEditorial = title.includes('संपादकीय');

  return (
    <section className="feature-section container" aria-label={title}>
      <div className="feature-section-header">
        <Link to={`/search?q=${encodeURIComponent(title)}`}>
          <h2 className="feature-section-title">{title}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="feature-grid">
        {items.map((item) => (
          <article key={item.id} className="feature-card">
            <Link to={`/article/${item.id}`}>
              <img className="feature-image" src={resolveImageUrl(item.image)} alt={item.title} />
            </Link>
            <h3 className="feature-headline">
              <Link to={`/article/${item.id}`}>{item.title}</Link>
            </h3>
            <div className="feature-footer">
              {isEditorial ? (
                <span className="feature-tagline">
                  <span className="story-category">{item.category}</span>
                  <i className="fas fa-gem" aria-hidden="true" />
                </span>
              ) : (
                <span className="story-category">{item.category}</span>
              )}
              <button className="bookmark-btn" type="button" aria-label="सहेजें">
                <i className="far fa-bookmark" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
