import React from 'react';
import NewsCard from '../news/NewsCard';

const CityNewsSection = ({ cityNews }) => {
  const cityTabs = [
    'उत्तर प्रदेश',
    'बिहार',
    'दिल्ली',
    'पंजाब',
    'हरियाणा',
    'उत्तराखंड',
    'झारखंड',
    'हिमाचल प्रदेश',
    'जम्मू-कश्मीर',
    'पश्चिम बंगाल',
    'ओडिशा',
    'महाराष्ट्र',
    'गुजरात',
    'राजस्थान',
  ];

  return (
    <section className="city-news-section container" aria-label="खबरें आपके शहर की">
      <div className="city-news-header">
        <h2 className="city-news-title">खबरें आपके शहर की</h2>
        <button className="city-pin-btn" type="button">
          अपने शहर को पिन करें
        </button>
      </div>

      <div className="city-pills" aria-label="Cities filter">
        {cityTabs.map((tab, index) => (
          <a key={tab} className={`city-pill ${index === 0 ? 'active' : ''}`} href="#">
            {tab}
          </a>
        ))}
      </div>

      <div className="city-news-grid">
        {cityNews.map((news) => (
          <NewsCard key={news.id} type="city" data={news} />
        ))}
      </div>

      <div className="city-news-more">
        <a className="city-news-more-btn" href="#">
          <span>और पढ़ें</span>
          <i className="fas fa-arrow-right" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
};

export default CityNewsSection;
