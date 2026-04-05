import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Admin from './pages/Admin';
import SearchResults from './pages/SearchResults';
import ShortsPage from './pages/ShortsPage';
import ShortVideoPage from './pages/ShortVideoPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/shorts" element={<ShortsPage />} />
          <Route path="/short/:id" element={<ShortVideoPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
