import React from 'react';
import { Link } from 'react-router-dom';

const TrendingBar = ({ topics = [] }) => {
  if (!topics.length) {
    return null;
  }

  return (
    <div className="trending-bar">
      <div className="trending-inner">
        <div className="trending-tag" aria-hidden="true">
          <i className="fas fa-hashtag" />
        </div>
        {topics.map((topic, index) => (
          <Link key={`${topic}-${index}`} to={`/search?q=${encodeURIComponent(topic)}`} className="trending-link">
              {topic}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingBar;
