import React, { useEffect, useState } from 'react';
import ShortsSection from '../components/sections/ShortsSection';
import { apiUrl } from '../lib/api';

const ShortsPage = () => {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/api/shorts'))
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch shorts');
        return res.json();
      })
      .then((data) => {
        setShorts(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Loading Short Stories...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#de1f27' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="shorts-page-container" style={{ paddingBottom: '60px' }}>
      <div className="container" style={{ marginTop: '30px' }}>
        <header style={{ 
          borderBottom: '4px solid #de1f27', 
          marginBottom: '30px', 
          paddingBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900', 
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-1px'
          }}>
            शॉर्ट <span style={{ color: '#de1f27' }}>न्यूज़</span>
          </h1>
          <div style={{ 
            background: '#de1f27', 
            color: '#fff', 
            padding: '4px 12px', 
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '700'
          }}>
            LIVE
          </div>
        </header>

        {shorts.length > 0 ? (
          <ShortsSection items={shorts} title="सभी शॉर्ट वीडियो" />
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f9f9f9', borderRadius: '12px' }}>
            <i className="fas fa-video-slash" style={{ fontSize: '3rem', color: '#ccc', marginBottom: '20px' }}></i>
            <h3>No short videos available right now.</h3>
            <p style={{ color: '#666' }}>Please check back later for more updates.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortsPage;
