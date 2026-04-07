import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const getImmersiveYoutubeUrl = (url) => {
  if (!url) return '';
  
  let videoId = '';
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) videoId = shortsMatch[1];
  
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && !videoId) videoId = watchMatch[1];
  
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && !videoId) videoId = shortMatch[1];

  if (!videoId) return url;

  // mute=0 for sound, autoplay=1 for immediate start
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
};

const ShortVideoPage = () => {
  const { id } = useParams();
  const [short, setShort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/api/shorts/${id}`))
      .then((res) => {
        if (!res.ok) throw new Error('Short Video Not Found');
        return res.json();
      })
      .then((data) => {
        setShort(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><h2>Loading Video...</h2></div>;
  }

  if (error || !short) {
    return (
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Video not found</h2>
        <Link to="/shorts" style={{ color: '#de1f27', marginTop: '10px' }}>Back to Shorts</Link>
      </div>
    );
  }

  const embedUrl = getImmersiveYoutubeUrl(short.videoUrl);
  const isYoutube = (url) => /youtube\.com|youtu\.be/.test(url || '');
  const youtube = isYoutube(short.videoUrl);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: short.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('Sharing is not supported on this browser');
    }
  };

  return (
    <div className="short-video-immersive" style={{ 
      background: '#0a0a0a', 
      height: '100vh', 
      width: '100vw',
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div className="immersive-player-container">
        {/* Top Overlay */}
        <div className="player-top-overlay">
          <h4>{short.title}</h4>
        </div>

        {/* Video Player */}
        <div style={{ width: '100%', height: '100%' }}>
          {youtube ? (
            <iframe
              src={embedUrl}
              title={short.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <video
              src={short.videoUrl}
              controls
              autoPlay
              loop
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Side Actions */}
        <div className="player-side-actions">
          <Link to="/" className="action-btn-circle" title="Home">
            <i className="fas fa-home" />
          </Link>
          <button className="action-btn-circle" onClick={handleShare} title="Share">
            <i className="fas fa-share" />
          </button>
        </div>

        {/* Bottom Red Strip */}
        <div className="player-bottom-red-strip">
          <h2>{short.title}</h2>
          <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.8 }}>
            {short.city || 'Shorts'} • {short.time}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoPage;
