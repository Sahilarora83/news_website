import React, { useEffect, useState } from 'react';
import TopNewsLayout from '../components/home/TopNewsLayout';
import CityNewsSection from '../components/sections/CityNewsSection';
import SectionDivider from '../components/sections/SectionDivider';
import ElectionSection from '../components/sections/ElectionSection';
import FeatureSection from '../components/sections/FeatureSection';
import NewsTrioSection from '../components/sections/NewsTrioSection';
import DynamicStorySection from '../components/sections/DynamicStorySection';
import NewsCard from '../components/news/NewsCard';
import ShortsSection from '../components/sections/ShortsSection';
import { apiUrl } from '../lib/api';
import { getPreferredCities, prioritizeHomeData } from '../lib/personalization';

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [pinnedCityNews, setPinnedCityNews] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadHome = async () => {
      try {
        const [response, preferredCities] = await Promise.all([
          fetch(apiUrl('/api/home'), { signal: controller.signal }),
          getPreferredCities(),
        ]);
        if (!response.ok) {
          throw new Error(`Failed to load live home content (${response.status})`);
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setHomeData(prioritizeHomeData(data, preferredCities));
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

    const handleStorageChange = async () => {
      const city = localStorage.getItem('pinnedCity');
      if (!city) {
        setPinnedCityNews(null);
      } else {
        fetch(apiUrl(`/api/news-by-city?city=${encodeURIComponent(city)}`))
          .then((response) => {
            if (!response.ok) throw new Error(`Failed to fetch city news: ${response.status}`);
            return response.json();
          })
          .then((data) => setPinnedCityNews({ city, items: data.items || [] }))
          .catch(() => {
            setPinnedCityNews(null);
          });
      }

      loadHome();
    };

    loadHome();
    handleStorageChange();
    
    // Auto-refresh content every 60 seconds
    const intervalId = setInterval(loadHome, 60000);

    window.addEventListener('storage', handleStorageChange);

    return () => {
      controller.abort();
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const labels = homeData?.config?.labels || {};
  const show = (key) => homeData?.config?.[key] !== false;

  const seenIds = new Set();
  const processItems = (items) => {
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.filter((item) => {
      if (!item || !item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  };

  const centerHero = show('center') ? processItems(homeData?.centerHero)[0] || null : null;
  const centerNews = show('center') ? processItems(homeData?.centerNews) : [];
  const breakingNews = show('breaking') ? processItems(homeData?.breakingNews) : [];
  const latestNews = show('latest') ? processItems(homeData?.latestNews) : [];
  
  const cityNews = show('city') ? processItems(homeData?.cityNews) : [];
  const electionCards = show('election') ? processItems(homeData?.electionCards) : [];
  const businessItems = show('business') ? processItems(homeData?.featureSections?.business) : [];
  const editorialItems = show('editorial') ? processItems(homeData?.featureSections?.editorial) : [];
  
  const trioColumns = show('trio') 
    ? (homeData?.trioSections || []).map(section => ({
        ...section,
        items: processItems(section.items)
      }))
    : [];

  const customSections = (homeData?.customSections || []).map(section => ({
    ...section,
    items: processItems(section.items)
  }));
  const sectionsBeforeShorts = customSections.filter((section) => Array.isArray(section.items) && section.items.length > 0);

  const shortsVideos = homeData?.shortsVideos || [];
  const effectiveCenterHero = centerHero || centerNews[0] || null;
  const effectiveCenterNews = centerHero ? centerNews : centerNews.slice(1);
  const hasTopStories =
    latestNews.length > 0 || Boolean(effectiveCenterHero) || effectiveCenterNews.length > 0 || breakingNews.length > 0;

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
            Publish a story from the admin panel and it will appear here, on article pages, and in search.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
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
              हटाएं
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
          centerHero={effectiveCenterHero}
          centerNews={effectiveCenterNews}
          breakingNews={breakingNews}
          labels={labels}
        />
      ) : null}

      {electionCards.length > 0 ? <ElectionSection tabs={homeData.electionTabs || []} cards={electionCards} title={labels.election} /> : null}

      {cityNews.length > 0 ? (
        <>
          <CityNewsSection cityNews={cityNews} title={labels.city} tabs={homeData.locationCities || []} />
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

      {trioColumns.some((column) => (column.items || []).length > 0) ? (
        <>
          <NewsTrioSection columns={trioColumns} />
          <SectionDivider />
        </>
      ) : null}

      {shortsVideos.length > 0 ? (
        <>
          <ShortsSection items={shortsVideos} title={labels.shorts} />
          <SectionDivider />
        </>
      ) : null}

      {sectionsBeforeShorts.map((section) => (
        <React.Fragment key={section.slot}>
          <DynamicStorySection section={section} />
          <SectionDivider />
        </React.Fragment>
      ))}

    </div>
  );
};

export default Home;
