import React from 'react';
import { Link } from 'react-router-dom';

const topics = ['आईपीएल 2026', 'रसोई गैस', 'ईरान युद्ध', 'विधानसभा चुनाव 2026', 'सक्षम यूपी', 'जनगणना'];

const TrendingBar = () => {
  return (
    <div className="trending-bar">
      <div className="trending-inner">
        <div className="trending-tag">
          <i className="fas fa-hashtag" aria-hidden="true" />
        </div>
        {topics.map((topic) => (
          <Link key={topic} to="#" className="trending-link">
            {topic}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingBar;
