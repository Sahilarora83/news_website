import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../news/NewsCard';
import { resolveImageUrl } from '../../lib/media';

const TopNewsLayout = ({ latestNews = [], centerHero = null, centerNews = [], breakingNews = [], labels = {} }) => {
  return (
    <div className="homepage-layout">
      {latestNews.length > 0 ? (
        <aside className="news-panel latest-panel" aria-label={labels.latest || 'ताज़ा खबरें'}>
          <h2 className="panel-heading">{labels.latest || 'ताज़ा खबरें'}</h2>
          <div className="latest-list">
            {latestNews.map((news) => (
              <NewsCard key={news.id} type="latest" data={news} />
            ))}
          </div>
        </aside>
      ) : null}

      {centerHero || centerNews.length > 0 ? (
        <section className="news-panel center-panel" aria-label={labels.center || 'मुख्य समाचार'}>
          {centerHero ? (
            <article className="center-hero">
              <div className="center-hero-media">
                <span className="hero-tag">{labels.center || 'Hindi News'}</span>
                <Link to={`/article/${centerHero.id}`}>
                  <img src={resolveImageUrl(centerHero.image)} alt={centerHero.title} />
                </Link>
              </div>
              <div className="center-hero-copy">
                <h1 className="center-hero-title">
                  <Link to={`/article/${centerHero.id}`}>{centerHero.title}</Link>
                </h1>
                <div className="story-meta">
                  <span className="story-category">{centerHero.category}</span>
                  <span className="story-time">{centerHero.time}</span>
                </div>
              </div>
            </article>
          ) : null}

          <div className="center-feed">
            {centerNews.map((news) => (
              <NewsCard key={news.id} type="center" data={news} />
            ))}
          </div>
        </section>
      ) : null}

      {breakingNews.length > 0 ? (
        <aside className="news-panel breaking-panel" aria-label={labels.breaking || 'ब्रेकिंग न्यूज़'}>
          <h2 className="panel-heading breaking">{labels.breaking || 'ब्रेकिंग न्यूज़'}</h2>
          <div className="breaking-list">
            {breakingNews.map((news) => (
              <NewsCard key={news.id} type="breaking" data={news} />
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
};

export default TopNewsLayout;
