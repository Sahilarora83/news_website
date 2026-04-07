import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../news/NewsCard';
import StoryActionButton from '../common/StoryActionButton';
import { resolveImageUrl } from '../../lib/media';
import WeatherSection from '../sections/WeatherSection';
import SectionDivider from '../sections/SectionDivider';

const TopNewsLayout = ({ latestNews = [], centerHero = null, centerNews = [], breakingNews = [], labels = {} }) => {
  const storyPath = (item) => `/article/${encodeURIComponent(item?.slug || item?.id || '')}`;

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
                <span className="hero-tag">Hindi News</span>
                <Link to={storyPath(centerHero)}>
                  <img src={resolveImageUrl(centerHero.image)} alt={centerHero.title} />
                </Link>
              </div>
              <div className="center-hero-copy">
                <h1 className="center-hero-title">
                  <Link to={storyPath(centerHero)}>{centerHero.title}</Link>
                </h1>
                <div className="center-hero-footer">
                  <div className="story-meta">
                    <span className="story-category">{centerHero.category}</span>
                    <span className="story-time">{centerHero.time}</span>
                  </div>
                  <StoryActionButton storyId={centerHero.id} className="bookmark-btn center-hero-bookmark" />
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

      <aside className="news-panel side-panel breaking-panel" aria-label={labels.breaking || 'ब्रेकिंग न्यूज़'}>
        {breakingNews.length > 0 ? (
          <div className="breaking-sidebar-widget">
            <div className="sidebar-widget-header">
              <span className="sidebar-widget-title">
                {labels.breaking || 'ब्रेकिंग न्यूज़'} <i className="fas fa-chevron-right" />
              </span>
            </div>
            <div className="sidebar-widget-content">
              {breakingNews.map((news) => (
                <div key={news.id} className="sidebar-story-card">
                  <div className="sidebar-story-image">
                    <img src={resolveImageUrl(news.image)} alt={news.title} />
                  </div>
                  <div className="sidebar-story-info">
                    <h4 className="sidebar-story-title">
                      <Link to={storyPath(news)}>{news.title}</Link>
                    </h4>
                    <div className="sidebar-story-footer">
                      <span className="sidebar-story-location">
                        {news.city || news.category || 'NEWS'}
                      </span>
                      <StoryActionButton
                        storyId={news.id}
                        action="bookmark"
                        className="sidebar-action-icon bookmark-icon"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="side-panel-weather">
          <WeatherSection />
          <SectionDivider />
        </div>
      </aside>
    </div>
  );
};

export default TopNewsLayout;
