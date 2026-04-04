import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const NewsTrioSection = ({ columns = [] }) => {
  return (
    <section className="news-trio-section container" aria-label="मुख्य वर्ग">
      <div className="news-trio-wrap">
        {columns.map((column) => (
          <article key={column.title} className="news-trio-column">
            <div className="news-trio-header">
              <Link to={`/search?q=${encodeURIComponent(column.title)}`}>
                <h2 className="news-trio-title">{column.title}</h2>
                <i className="far fa-circle-right" aria-hidden="true" />
              </Link>
            </div>

            <div className="news-trio-list">
              {(column.items || []).map((item) => (
                <article key={item.id} className="news-trio-item">
                  <Link to={`/article/${item.id}`}>
                    <img className="news-trio-thumb" src={resolveImageUrl(item.image)} alt={item.title} />
                  </Link>
                  <div className="news-trio-copy">
                    <h3 className="story-title">
                      <Link to={`/article/${item.id}`}>{item.title}</Link>
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
