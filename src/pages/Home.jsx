import React from 'react';
import TrendingBar from '../components/home/TrendingBar';
import TopNewsLayout from '../components/home/TopNewsLayout';
import CityNewsSection from '../components/sections/CityNewsSection';
import SectionDivider from '../components/sections/SectionDivider';
import ElectionSection from '../components/sections/ElectionSection';
import FeatureSection from '../components/sections/FeatureSection';
import CricketSection from '../components/sections/CricketSection';
import ShortsSection from '../components/sections/ShortsSection';
import NewsTrioSection from '../components/sections/NewsTrioSection';
import {
  latestNews,
  centerNews,
  breakingNews,
  cityNews,
  electionTabs,
  electionCards,
  featureSections,
  cricketSection,
  shortsVideos,
  trioSections,
} from '../data/mockData';

const Home = () => {
  const centerHero = {
    image: 'https://picsum.photos/seed/hero-defense-news/980/560',
    title: 'समुद्र में बढ़ी भारत की ताकत, INS तारागिरी और INS अर्दमन नौसेना में शामिल; पढ़ें खासियत',
    category: 'न्यूज़',
    time: 'एक घंटा पहले',
  };

  return (
    <div className="home-page">
      <TrendingBar />

      <TopNewsLayout
        latestNews={latestNews}
        centerHero={centerHero}
        centerNews={centerNews}
        breakingNews={breakingNews}
      />

      <CricketSection data={cricketSection} />
      <SectionDivider />

      <ElectionSection tabs={electionTabs} cards={electionCards} />
      <CityNewsSection cityNews={cityNews} />
      <SectionDivider />

      <FeatureSection title="बिजनेस" items={featureSections.business} />
      <SectionDivider />

      <FeatureSection title="संपादकीय" items={featureSections.editorial} />
      <ShortsSection items={shortsVideos} />
      <SectionDivider />

      <NewsTrioSection columns={trioSections} />
    </div>
  );
};

export default Home;
