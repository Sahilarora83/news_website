import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../news/NewsCard';

const CityNewsSection = ({ cityNews = [], title, tabs = [] }) => {
  const displayTitle = title || 'खबरें आपके शहर की';

  const tabItems = useMemo(() => {
    if (tabs.length > 0) {
      return tabs;
    }

    return [...new Set(cityNews.map((item) => item.category).filter(Boolean))].slice(0, 10);
  }, [cityNews, tabs]);

  const moreQuery = tabItems[0] || cityNews[0]?.category || displayTitle;

  return (
    <section className="city-news-section container" aria-label={displayTitle}>
      <div className="city-news-header">
        <h2 className="city-news-title">{displayTitle}</h2>
      </div>

      {tabItems.length > 0 ? (
        <div className="city-pills" aria-label="Cities filter">
          {tabItems.map((tab, index) => (
            <Link key={tab} className={`city-pill ${index === 0 ? 'active' : ''}`} to={`/search?q=${encodeURIComponent(tab)}`}>
              {tab}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="city-news-grid">
        {cityNews.map((news) => (
          <NewsCard key={news.id} type="city" data={news} />
        ))}
      </div>

      {moreQuery ? (
        <div className="city-news-more">
          <Link className="city-news-more-btn" to={`/search?q=${encodeURIComponent(moreQuery)}`}>
            <span>और पढ़ें</span>
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </section>
  );
};

export default CityNewsSection;
