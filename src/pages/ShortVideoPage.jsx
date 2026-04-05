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

  return (
    <div className="short-video-immersive" style={{ 
      background: '#0a0a0a', 
      height: 'calc(100vh - 140px)', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5px 10px',
      overflow: 'hidden'
    }}>
      <div className="immersive-inner" style={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '500px'
      }}>
        <div style={{ 
          height: '68vh', 
          maxHeight: 'calc(100% - 100px)',
          aspectRatio: '9/16', 
          background: '#000', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0,0,0,0.6)',
          position: 'relative'
        }}>
          <iframe
            src={embedUrl}
            title={short.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div style={{ marginTop: '10px', color: '#fff', textAlign: 'center', width: '100%', padding: '0 10px' }}>
          <h1 style={{ 
            fontSize: '1.1rem', 
            fontWeight: '700', 
            marginBottom: '2px', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {short.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: '#777' }}>
            <span>{short.city || 'Shorts'}</span>
            <span>•</span>
            <span>{short.time}</span>
          </div>
          
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <Link to="/shorts" style={{ 
              background: '#de1f27', 
              color: '#fff', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '0.8rem'
            }}>
              <i className="fas fa-grid-2" style={{ marginRight: '5px' }}></i>
              Feed
            </Link>
            <button 
              onClick={() => window.history.back()}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                color: '#ddd', 
                border: 'none',
                padding: '6px 14px', 
                borderRadius: '20px', 
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.8rem'
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoPage;
