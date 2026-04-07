import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';
import StoryActionButton from '../common/StoryActionButton';

const ElectionSection = ({ tabs = [], cards = [], title }) => {
  const displayTitle = title || 'विधानसभा चुनाव 2026';
  const storyPath = (item) => `/article/${encodeURIComponent(item?.slug || item?.id || '')}`;

  return (
    <section className="election-section container" aria-label={displayTitle}>
      <div className="election-header">
        <Link className="election-title-link" to={`/search?q=${encodeURIComponent(displayTitle)}`}>
          <h2 className="election-title">{displayTitle}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>

        {tabs.length > 0 ? (
          <div className="election-tabs" role="tablist" aria-label="चुनाव श्रेणियां">
            {tabs.map((tab, index) => (
              <Link key={tab} to={`/search?q=${encodeURIComponent(tab)}`} className={`election-tab ${index === 0 ? 'active' : ''}`}>
                {tab}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="election-grid">
        {cards.map((card) => (
          <article key={card.id} className="election-card">
            <div className="election-card-media">
              <Link to={storyPath(card)}>
                <img className="election-card-image" src={resolveImageUrl(card.image)} alt={card.title} />
              </Link>
              {card.banner ? <span className="election-card-banner">{card.banner}</span> : null}
            </div>
            <h3 className="election-card-headline">
              <Link to={storyPath(card)}>{card.title}</Link>
            </h3>
            <div className="election-card-footer">
              <span className="story-category">{card.category}</span>
              <StoryActionButton storyId={card.id} />
            </div>
          </article>
        ))}
      </div>

      <div className="election-divider" aria-hidden="true" />
    </section>
  );
};

export default ElectionSection;
