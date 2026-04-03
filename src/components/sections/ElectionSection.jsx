import React from 'react';

const ElectionSection = ({ tabs, cards }) => {
  return (
    <section className="election-section container" aria-label="विधानसभा चुनाव 2026">
      <div className="election-header">
        <a className="election-title-link" href="#">
          <h2 className="election-title">विधानसभा चुनाव 2026</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </a>

        <div className="election-tabs" role="tablist" aria-label="चुनाव श्रेणियां">
          {tabs.map((tab, index) => (
            <a key={tab} href="#" className={`election-tab ${index === 0 ? 'active' : ''}`}>
              {tab}
            </a>
          ))}
        </div>
      </div>

      <div className="election-grid">
        {cards.map((card) => (
          <article key={card.id} className="election-card">
            <div className="election-card-media">
              <img className="election-card-image" src={card.image} alt={card.title} />
              {card.banner ? <span className="election-card-banner">{card.banner}</span> : null}
            </div>
            <h3 className="election-card-headline">
              <a href="#">{card.title}</a>
            </h3>
            <div className="election-card-footer">
              <span className="story-category">{card.category}</span>
              <button className="bookmark-btn" type="button" aria-label="सहेजें">
                <i className="far fa-bookmark" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="election-divider" aria-hidden="true" />
    </section>
  );
};

export default ElectionSection;
