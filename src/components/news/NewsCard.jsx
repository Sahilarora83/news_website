import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';
import StoryActionButton from '../common/StoryActionButton';

const storyPath = (data) => `/article/${encodeURIComponent(data?.slug || data?.id || '')}`;

const NewsCard = ({ type, data, hideActions = false }) => {
  const { id, title, category, time, image, isVideo } = data;
  const imageSrc = resolveImageUrl(image);

  if (type === 'list') {
    return (
      <article className="related-story-card">
        <Link className="related-story-media" to={storyPath(data)}>
          <img className="related-story-image" src={imageSrc} alt={title} />
        </Link>
        <div className="related-story-body">
          <div className="related-story-meta">
            {category ? <span className="story-category">{category}</span> : null}
            {time ? <span className="story-time">{time}</span> : null}
          </div>
          <h3 className="related-story-title">
            <Link to={storyPath(data)}>{title}</Link>
          </h3>
          {!hideActions && (
            <div className="related-story-footer">
              <StoryActionButton storyId={id} action="bookmark" className="bookmark-btn" />
            </div>
          )}
        </div>
      </article>
    );
  }

  if (type === 'latest') {
    return (
      <article className="latest-item">
        <h3 className="story-title"><Link to={storyPath(data)}>{title}</Link></h3>
        <div className="story-card-footer latest-item-footer">
          <div className="story-meta">
            <span className="story-category">{category}</span>
            <span className="story-time">{time}</span>
          </div>
          <StoryActionButton storyId={id} action="bookmark" className="bookmark-btn" />
        </div>
      </article>
    );
  }

  if (type === 'center') {
    return (
      <article className="center-list-item">
        <Link to={storyPath(data)} className="center-thumb-link" aria-label={title}>
          <img className="center-thumb" src={imageSrc} alt={title} />
        </Link>
        <div className="center-list-copy">
          <h3 className="story-title"><Link to={storyPath(data)}>{title}</Link></h3>
          <div className="story-card-footer">
            <div className="story-meta">
              <span className="story-category">{category}</span>
              <span className="story-time">{time}</span>
            </div>
            <StoryActionButton storyId={id} action="bookmark" className="bookmark-btn" />
          </div>
        </div>
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
          <h3 className="story-title"><Link to={storyPath(data)}>{title}</Link></h3>
          <div className="story-card-footer">
            <div className="story-meta">
              <span className="story-category">{category}</span>
            </div>
            <StoryActionButton storyId={id} action="bookmark" className="bookmark-btn" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="city-news-card">
      <Link to={storyPath(data)} className="city-news-media-link" aria-label={title}>
        <img className="city-news-image" src={imageSrc} alt={title} />
      </Link>
      <div className="city-news-copy">
        <h3 className="story-title"><Link to={storyPath(data)}>{title}</Link></h3>
        <div className="city-news-footer">
          <div className="story-meta">
            <span className="story-category">{category}</span>
          </div>
          <StoryActionButton storyId={id} action="bookmark" className="bookmark-btn" />
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
