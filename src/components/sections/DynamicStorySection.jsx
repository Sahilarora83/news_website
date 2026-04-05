import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from '../news/NewsCard';

const DynamicStorySection = ({ section }) => {
  if (!section || !Array.isArray(section.items) || section.items.length === 0) {
    return null;
  }

  const query = section.section || section.title;
  const items = section.single ? section.items.slice(0, 1) : section.items;

  return (
    <section className="city-news-section container" aria-label={section.title}>
      <div className="city-news-header">
        <Link className="election-title-link" to={`/search?q=${encodeURIComponent(query)}`}>
          <h2 className="city-news-title">{section.title}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="city-news-grid">
        {items.map((news) => (
          <NewsCard key={news.id} type="city" data={news} />
        ))}
      </div>
    </section>
  );
};

export default DynamicStorySection;
