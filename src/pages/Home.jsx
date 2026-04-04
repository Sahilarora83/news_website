import React, { useEffect, useState } from 'react';
import TrendingBar from '../components/home/TrendingBar';
import TopNewsLayout from '../components/home/TopNewsLayout';
import CityNewsSection from '../components/sections/CityNewsSection';
import SectionDivider from '../components/sections/SectionDivider';
import ElectionSection from '../components/sections/ElectionSection';
import FeatureSection from '../components/sections/FeatureSection';
import CricketSection from '../components/sections/CricketSection';
import ShortsSection from '../components/sections/ShortsSection';
import NewsTrioSection from '../components/sections/NewsTrioSection';
import NewsCard from '../components/news/NewsCard';
import { apiUrl } from '../lib/api';

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [pinnedCityNews, setPinnedCityNews] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadHome = async () => {
      try {
        const response = await fetch(apiUrl('/api/home'), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load live home content (${response.status})`);
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setHomeData(data);
          setStatus('ready');
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load live home content');
        setStatus('error');
      }
    };

    const handleStorageChange = () => {
      const city = localStorage.getItem('pinnedCity');
      if (!city) {
        setPinnedCityNews(null);
        return;
      }

      fetch(apiUrl(`/api/news-by-city?city=${encodeURIComponent(city)}`))
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to fetch city news: ${response.status}`);
          return response.json();
        })
        .then((data) => setPinnedCityNews({ city, items: data.items || [] }))
        .catch(err => {
          console.error(`Error loading news for city ${city}:`, err);
          setPinnedCityNews(null);
        });
    };

    loadHome();
    handleStorageChange();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      controller.abort();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const labels = homeData?.config?.labels || {};
  const show = (key) => homeData?.config?.[key] !== false;

  const latestNews = show('latest') ? homeData?.latestNews || [] : [];
  const centerHero = show('center') ? homeData?.centerHero || null : null;
  const centerNews = show('center') ? homeData?.centerNews || [] : [];
  const breakingNews = show('breaking') ? homeData?.breakingNews || [] : [];
  const cityNews = show('city') ? homeData?.cityNews || [] : [];
  const electionCards = show('election') ? homeData?.electionCards || [] : [];
  const businessItems = show('business') ? homeData?.featureSections?.business || [] : [];
  const editorialItems = show('editorial') ? homeData?.featureSections?.editorial || [] : [];
  const shortsItems = show('shorts') ? homeData?.shortsVideos || [] : [];
  const trioColumns = show('trio') ? homeData?.trioSections || [] : [];
  const cricketData =
    show('cricket') && homeData?.cricketSection
      ? {
          ...homeData.cricketSection,
          title: labels.cricket || homeData.cricketSection.title,
        }
      : null;

  const hasTopStories = latestNews.length > 0 || Boolean(centerHero) || centerNews.length > 0 || breakingNews.length > 0;
  const hasHomepageContent = (homeData?.items || []).length > 0;

  if (status === 'loading') {
    return (
      <div className="home-page" style={{ padding: '48px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Live content loading</h2>
          <p style={{ color: '#666' }}>Fetching the homepage from the backend...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || !homeData) {
    return (
      <div className="home-page">
        <div className="container" style={{ padding: '48px 0', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '8px' }}>Live content unavailable</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            {error || 'The backend did not return homepage data.'}
          </p>
          <p style={{ color: '#999' }}>Start the backend and refresh the page to load real stories.</p>
        </div>
      </div>
    );
  }

  if (!hasHomepageContent) {
    return (
      <div className="home-page">
        <div className="container" style={{ padding: '56px 0', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '12px' }}>Homepage is ready for real stories</h2>
          <p style={{ maxWidth: '620px', margin: '0 auto', color: '#666', lineHeight: 1.7 }}>
            Ab admin panel se story create karke publish karoge to wahi live homepage,
            article page, suggestions aur section blocks me dikhai degi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {show('trending') && <TrendingBar topics={homeData.trendingTopics || []} />}

      {pinnedCityNews && pinnedCityNews.items.length > 0 ? (
        <section className="container" style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px',
              borderBottom: '2px solid #de1f27',
              paddingBottom: '10px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>
              <span style={{ color: '#de1f27' }}>आपके शहर</span> की खबरें ({pinnedCityNews.city})
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem('pinnedCity');
                window.dispatchEvent(new Event('storage'));
              }}
              style={{
                marginLeft: 'auto',
                fontSize: '0.8rem',
                color: '#666',
                border: '1px solid #ddd',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              हटाएँ
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {pinnedCityNews.items.slice(0, 4).map((item) => (
              <NewsCard key={item.id} type="city" data={item} />
            ))}
          </div>
          <SectionDivider />
        </section>
      ) : null}

      {hasTopStories ? (
        <TopNewsLayout
          latestNews={latestNews}
          centerHero={centerHero}
          centerNews={centerNews}
          breakingNews={breakingNews}
          labels={labels}
        />
      ) : null}

      {cricketData?.hero ? (
        <>
          <CricketSection data={cricketData} />
          <SectionDivider />
        </>
      ) : null}

      {electionCards.length > 0 ? (
        <ElectionSection tabs={homeData.electionTabs || []} cards={electionCards} title={labels.election} />
      ) : null}

      {cityNews.length > 0 ? (
        <>
          <CityNewsSection cityNews={cityNews} title={labels.city} tabs={homeData.locationStates || []} />
          <SectionDivider />
        </>
      ) : null}

      {businessItems.length > 0 ? (
        <>
          <FeatureSection title={labels.business || 'बिजनेस'} items={businessItems} />
          <SectionDivider />
        </>
      ) : null}

      {editorialItems.length > 0 ? <FeatureSection title={labels.editorial || 'संपादकीय'} items={editorialItems} /> : null}

      {shortsItems.length > 0 ? (
        <>
          <ShortsSection items={shortsItems} title={labels.shorts} />
          <SectionDivider />
        </>
      ) : null}

      {trioColumns.some((column) => (column.items || []).length > 0) ? <NewsTrioSection columns={trioColumns} /> : null}
    </div>
  );
};

export default Home;
