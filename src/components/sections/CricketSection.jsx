import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const CricketSection = ({ data }) => {
  if (!data?.hero) {
    return null;
  }

  const badgeClassMap = {
    राजस्थान: 'bg-rr',
    बेंगलुरु: 'bg-blr',
    दिल्ली: 'bg-del',
    मुंबई: 'bg-mum',
    पंजाब: 'bg-pun',
    हैदराबाद: 'bg-hyd',
    गुजरात: 'bg-guj',
    लखनऊ: 'bg-lko',
    कोलकाता: 'bg-kkr',
    चेन्नई: 'bg-csk',
  };

  const heroBanner = String(data.hero.banner || '').trim();
  const isLive = heroBanner.toLowerCase() === 'live';

  return (
    <section className="cricket-section container" aria-label="क्रिकेट">
      <div className="cricket-section-header">
        <Link to={`/search?q=${encodeURIComponent(data.title)}`}>
          {data.icon ? <img className="cricket-icon" src={data.icon} alt="" aria-hidden="true" /> : null}
          <h2 className="cricket-title">{data.title}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="cricket-grid">
        <article className="cricket-hero">
          <Link to={`/article/${data.hero.id}`}>
            <img className="cricket-hero-image" src={resolveImageUrl(data.hero.image)} alt={data.hero.title} />
          </Link>
          {isLive ? <span className="cricket-live-badge">LIVE</span> : null}
          <h3 className="cricket-hero-headline">
            <Link to={`/article/${data.hero.id}`}>{data.hero.title}</Link>
          </h3>
          <div className="story-meta">
            <span className="story-category">{data.hero.category}</span>
          </div>
        </article>

        <div className="cricket-side">
          {(data.stories || []).map((story) => (
            <article key={story.id} className="cricket-side-item">
              <Link to={`/article/${story.id}`}>
                <img src={resolveImageUrl(story.image)} alt={story.title} />
              </Link>
              <div>
                <h3 className="story-title">
                  <Link to={`/article/${story.id}`}>{story.title}</Link>
                </h3>
                <div className="story-meta">
                  <span className="story-category">{story.category}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="cricket-table-panel" aria-label="पॉइंट्स टेबल">
          <h3 className="cricket-table-title">पॉइंट्स टेबल</h3>
          <div className="cricket-table">
            <div className="cricket-table-head">
              <span>TEAM</span>
              <span>P</span>
              <span>W</span>
              <span>L</span>
              <span>T</span>
              <span>PTS</span>
              <span>R/R</span>
            </div>
            <div className="cricket-table-body">
              {(data.pointsTable || []).map((row) => (
                <div key={row.team} className="cricket-table-row">
                  <span className="cricket-team">
                    <span className={`cricket-badge ${badgeClassMap[row.team] ?? ''}`}>{row.badge}</span>
                    {row.team}
                  </span>
                  <span>{row.played}</span>
                  <span>{row.won}</span>
                  <span>{row.lost}</span>
                  <span>{row.tied}</span>
                  <span>{row.pts}</span>
                  <span>{row.rr}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default CricketSection;
