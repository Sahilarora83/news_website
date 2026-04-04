import React from 'react';
import { Link } from 'react-router-dom';

const TrendingBar = ({ topics = [] }) => {
  if (!topics.length) {
    return null;
  }

  return (
    <div className="trending-bar">
      <div className="trending-inner">
        <div className="trending-tag">
          <i className="fas fa-hashtag" aria-hidden="true" />
        </div>
        {topics.map((topic) => (
          <Link key={topic} to={`/search?q=${encodeURIComponent(topic)}`} className="trending-link">
            {topic}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingBar;
