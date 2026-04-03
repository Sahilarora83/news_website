import React from 'react';

const CricketSection = ({ data }) => {
  const badgeClassMap = {
    राजस्थान: 'bg-rr',
    बैंगलुरु: 'bg-blr',
    दिल्ली: 'bg-del',
    मुंबई: 'bg-mum',
    पंजाब: 'bg-pun',
    हैदराबाद: 'bg-hyd',
    गुजरात: 'bg-guj',
    लखनऊ: 'bg-lko',
    कोलकाता: 'bg-kkr',
    चेन्नई: 'bg-csk',
  };

  return (
    <section className="cricket-section container" aria-label="क्रिकेट">
      <div className="cricket-section-header">
        <a href="#">
          <img className="cricket-icon" src={data.icon} alt="" aria-hidden="true" />
          <h2 className="cricket-title">{data.title}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </a>
      </div>

      <div className="cricket-grid">
        <article className="cricket-hero">
          <img className="cricket-hero-image" src={data.hero.image} alt={data.hero.title} />
          <span className="cricket-live-badge">LIVE</span>
          <h3 className="cricket-hero-headline">
            <a href="#">{data.hero.title}</a>
          </h3>
          <div className="story-meta">
            <span className="story-category">{data.hero.category}</span>
          </div>
        </article>

        <div className="cricket-side">
          {data.stories.map((story) => (
            <article key={story.id} className="cricket-side-item">
              <img src={story.image} alt={story.title} />
              <div>
                <h3 className="story-title">
                  <a href="#">{story.title}</a>
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
              {data.pointsTable.map((row) => (
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
