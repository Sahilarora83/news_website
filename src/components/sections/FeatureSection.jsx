import React from 'react';

const FeatureSection = ({ title, items }) => {
  const isEditorial = title.includes('संपादकीय');

  return (
    <section className="feature-section container" aria-label={title}>
      <div className="feature-section-header">
        <a href="#">
          <h2 className="feature-section-title">{title}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </a>
      </div>

      <div className="feature-grid">
        {items.map((item) => (
          <article key={item.id} className="feature-card">
            <img className="feature-image" src={item.image} alt={item.title} />
            <h3 className="feature-headline">
              <a href="#">{item.title}</a>
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
