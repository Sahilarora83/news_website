import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../lib/media';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  
  let videoId = '';
  // Handle shorts URLs: youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) videoId = shortsMatch[1];
  
  // Handle watch URLs: youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && !videoId) videoId = watchMatch[1];
  
  // Handle shortened URLs: youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && !videoId) videoId = shortMatch[1];

  if (!videoId) return url; // Fallback

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`;
};

const ShortsSection = ({ items = [], title }) => {
  const displayTitle = title || 'शॉर्ट वीडियो';

  return (
    <section className="shorts-section container" aria-label={displayTitle}>
      <div className="shorts-header">
        <Link to={`/search?q=${encodeURIComponent(displayTitle)}`}>
          <h2 className="shorts-title">{displayTitle}</h2>
          <i className="far fa-circle-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="shorts-grid">
        {items.map((item) => {
          const videoUrl = getYoutubeEmbedUrl(item.videoUrl);
          
          return (
            <article key={item.id} className="shorts-card">
              <div className="shorts-card-media">
                {item.videoUrl ? (
                  <iframe
                    src={videoUrl}
                    title={item.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <Link to={`/short/${item.id}`}>
                    <img src={resolveImageUrl(item.image)} alt={item.title} />
                    <span className="shorts-play" aria-hidden="true">
                      <i className="fas fa-play" />
                    </span>
                  </Link>
                )}
              </div>
              <div className="shorts-copy">
                <h3>
                  <Link to={`/short/${item.id}`}>{item.title}</Link>
                </h3>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ShortsSection;
