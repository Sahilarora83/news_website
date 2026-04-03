import React from 'react';

const NewsTrioSection = ({ columns }) => {
  return (
    <section className="news-trio-section container" aria-label="मुख्य वर्ग">
      <div className="news-trio-wrap">
        {columns.map((column) => (
          <article key={column.title} className="news-trio-column">
            <div className="news-trio-header">
              <a href="#">
                <h2 className="news-trio-title">{column.title}</h2>
                <i className="far fa-circle-right" aria-hidden="true" />
              </a>
            </div>

            <div className="news-trio-list">
              {column.items.map((item) => (
                <article key={item.id} className="news-trio-item">
                  <img className="news-trio-thumb" src={item.image} alt={item.title} />
                  <div className="news-trio-copy">
                    <h3 className="story-title">
                      <a href="#">{item.title}</a>
                    </h3>
                    <div className="story-meta">
                      <span className="story-category">{column.label ?? column.title}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewsTrioSection;
