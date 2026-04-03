import React from 'react';
import NewsCard from '../news/NewsCard';

const TopNewsLayout = ({ latestNews, centerHero, centerNews, breakingNews }) => {
  return (
    <div className="homepage-layout">
      <aside className="news-panel latest-panel" aria-label="ताज़ा खबरें">
        <h2 className="panel-heading">ताज़ा खबरें</h2>
        <div className="latest-list">
          {latestNews.map((news) => (
            <NewsCard key={news.id} type="latest" data={news} />
          ))}
        </div>
      </aside>

      <section className="news-panel center-panel" aria-label="मुख्य समाचार">
        <article className="center-hero">
          <div className="center-hero-media">
            <span className="hero-tag">Hindi News</span>
            <img src={centerHero.image} alt={centerHero.title} />
          </div>
          <div className="center-hero-copy">
            <h1 className="center-hero-title">{centerHero.title}</h1>
            <div className="story-meta">
              <span className="story-category">{centerHero.category}</span>
              <span className="story-time">{centerHero.time}</span>
            </div>
          </div>
        </article>

        <div className="center-feed">
          {centerNews.map((news) => (
            <NewsCard key={news.id} type="center" data={news} />
          ))}
        </div>
      </section>

      <aside className="news-panel breaking-panel" aria-label="ब्रेकिंग न्यूज़">
        <h2 className="panel-heading breaking">ब्रेकिंग न्यूज़</h2>
        <div className="breaking-list">
          {breakingNews.map((news) => (
            <NewsCard key={news.id} type="breaking" data={news} />
          ))}
        </div>
      </aside>
    </div>
  );
};

export default TopNewsLayout;
