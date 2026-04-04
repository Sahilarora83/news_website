import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const NewsCard = ({ type, data }) => {
  const { id, title, category, time, image, isVideo } = data;
  const imageSrc = resolveImageUrl(image);

  if (type === 'list') {
    return (
      <article className="related-story-card">
        <Link className="related-story-media" to={`/article/${id}`}>
          <img className="related-story-image" src={imageSrc} alt={title} />
        </Link>
        <div className="related-story-body">
          <div className="related-story-meta">
            {category ? <span className="story-category">{category}</span> : null}
            {time ? <span className="story-time">{time}</span> : null}
          </div>
          <h3 className="related-story-title">
            <Link to={`/article/${id}`}>{title}</Link>
          </h3>
        </div>
      </article>
    );
  }

  if (type === 'latest') {
    return (
      <article className="latest-item">
        <h3 className="story-title"><Link to={`/article/${id}`}>{title}</Link></h3>
        <div className="story-meta">
          <span className="story-category">{category}</span>
          <span className="story-time">{time}</span>
        </div>
        <button className="bookmark-btn" aria-label="Save story"><i className="far fa-bookmark"></i></button>
      </article>
    );
  }

  if (type === 'center') {
    return (
      <article className="center-list-item">
        <img className="center-thumb" src={imageSrc} alt={title} />
        <div>
          <h3 className="story-title"><Link to={`/article/${id}`}>{title}</Link></h3>
          <div className="story-meta">
            <span className="story-category">{category}</span>
            <span className="story-time">{time}</span>
          </div>
        </div>
        <button className="bookmark-btn" aria-label="Save story"><i className="far fa-bookmark"></i></button>
      </article>
    );
  }

  if (type === 'breaking') {
    return (
      <article className="breaking-item">
        <div className={`breaking-thumb-wrap ${isVideo ? 'video' : ''}`}>
          <img className="breaking-thumb" src={imageSrc} alt={title} />
        </div>
        <div>
          <h3 className="story-title"><Link to={`/article/${id}`}>{title}</Link></h3>
          <div className="story-meta">
            <span className="story-category">{category}</span>
          </div>
        </div>
        <button className="bookmark-btn" aria-label="Save story"><i className="far fa-bookmark"></i></button>
      </article>
    );
  }

  return (
    <article className="city-news-card">
      <img className="city-news-image" src={imageSrc} alt={title} />
      <div>
        <h3 className="story-title"><Link to={`/article/${id}`}>{title}</Link></h3>
        <div className="story-meta">
          <span className="story-category">{category}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
