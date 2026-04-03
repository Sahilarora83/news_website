import React from 'react';

const ShortsSection = ({ items }) => {
  return (
    <section className="shorts-section container" aria-label="शॉर्ट वीडियो">
      <div className="shorts-header">
        <a href="#">
          <h2 className="shorts-title">शॉर्ट वीडियो</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </a>
      </div>

      <div className="shorts-grid">
        {items.map((item) => (
          <article key={item.id} className="shorts-card">
            <div className="shorts-card-media">
              <img src={item.image} alt={item.title} />
              <span className="shorts-play" aria-hidden="true">
                <i className="fas fa-play" />
              </span>
            </div>
            <div className="shorts-copy">
              <h3>
                <a href="#">{item.title}</a>
              </h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ShortsSection;
