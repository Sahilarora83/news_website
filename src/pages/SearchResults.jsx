import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import { resolveImageUrl } from '../lib/media';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}`));
        if (!response.ok) {
          throw new Error('Search service is temporarily unavailable.');
        }

        const data = await response.json();
        setResults(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
      return;
    }

    setLoading(false);
    setResults([]);
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const subtitle = (() => {
    if (!hasQuery) return 'किसी विषय, शहर या श्रेणी से खबरें खोजें।';
    if (loading) return 'आपकी खोज के लिए खबरें ढूंढी जा रही हैं...';
    if (error) return error;
    return `${results.length} खबरें मिलीं`;
  })();

  return (
    <main className="search-results-page container">
      <header className="search-results-header">
        <span className="search-results-kicker">Search</span>
        <h1 className="search-results-title">
          {hasQuery ? (
            <>
              Results for <span>"{query}"</span>
            </>
          ) : (
            'खोज शुरू करें'
          )}
        </h1>
        <p className="search-results-subtitle">{subtitle}</p>
      </header>

      {loading ? (
        <div className="search-results-empty">
          <i className="fas fa-spinner fa-spin" aria-hidden="true" />
          <h3>Loading results...</h3>
        </div>
      ) : error ? (
        <div className="search-results-empty">
          <i className="fas fa-circle-exclamation" aria-hidden="true" />
          <h3>Search temporarily unavailable</h3>
          <p>{error}</p>
          <Link to="/" className="search-results-link">Return to homepage</Link>
        </div>
      ) : !hasQuery ? (
        <div className="search-results-empty">
          <i className="fas fa-search" aria-hidden="true" />
          <h3>कुछ खोजिए</h3>
          <p>ऊपर search bar में शब्द लिखकर ताज़ा खबरें खोजें।</p>
        </div>
      ) : results.length > 0 ? (
        <div className="results-grid">
          {results.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="search-result-card">
              <div className="search-result-media">
                <img className="search-result-image" src={resolveImageUrl(article.image)} alt={article.title} />
              </div>
              <div className="search-result-copy">
                {article.category ? <span className="search-result-category">{article.category}</span> : null}
                <h3 className="search-result-title">{article.title}</h3>
                <p className="search-result-excerpt">{article.excerpt || article.title}</p>
                {article.time ? <div className="search-result-time">{article.time}</div> : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="search-results-empty">
          <i className="fas fa-search" aria-hidden="true" />
          <h3>No articles found</h3>
          <p>Try searching with different keywords.</p>
          <Link to="/" className="search-results-link">Return to homepage</Link>
        </div>
      )}
    </main>
  );
};

export default SearchResults;
