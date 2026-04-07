import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StoryActionButton from '../components/common/StoryActionButton';
import { apiUrl } from '../lib/api';
import { resolveImageUrl } from '../lib/media';
import { getPreferredCities, prioritizeStoriesByCities } from '../lib/personalization';

const DEFAULT_SEARCH_IMAGE = '/970x90.jpg.jpeg';

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
        const [response, preferredCities] = await Promise.all([
          fetch(apiUrl(`/api/search?q=${encodeURIComponent(query)}`)),
          getPreferredCities(),
        ]);
        if (!response.ok) {
          throw new Error('Search service is temporarily unavailable.');
        }

        const data = await response.json();
        setResults(prioritizeStoriesByCities(data.items || [], preferredCities));
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
  const storyPath = (article) => `/article/${encodeURIComponent(article?.slug || article?.id || '')}`;

  return (
    <main className="search-results-page container">
      {hasQuery ? (
        <header className="search-results-header">
          <h1 className="search-results-title">
            <span className="search-results-prefix">खोज परिणाम</span>
            <span>"{query}"</span>
          </h1>
        </header>
      ) : null}

      {loading ? (
        <div className="search-results-empty">
          <i className="fas fa-spinner fa-spin" aria-hidden="true" />
          <h3>परिणाम लोड हो रहे हैं...</h3>
        </div>
      ) : error ? (
        <div className="search-results-empty">
          <i className="fas fa-circle-exclamation" aria-hidden="true" />
          <h3>खोज सेवा अभी उपलब्ध नहीं है</h3>
          <p>{error}</p>
          <Link to="/" className="search-results-link">होमपेज पर लौटें</Link>
        </div>
      ) : !hasQuery ? (
        <div className="search-results-empty">
          <i className="fas fa-search" aria-hidden="true" />
          <h3>कुछ खोजिए</h3>
          <p>ऊपर search bar में शब्द लिखकर खबरें खोजें।</p>
        </div>
      ) : results.length > 0 ? (
        <section className="search-results-rail">
          <div className="search-results-grid">
            {results.map((article) => {
              const imageSrc = article.image ? resolveImageUrl(article.image) : DEFAULT_SEARCH_IMAGE;

              return (
                <Link key={article.id} to={storyPath(article)} className="search-result-card" style={{ height: '100%' }}>
                  <div className="search-result-media">
                    <img className="search-result-image" src={imageSrc} alt={article.title} />
                  </div>
                  <div className="search-result-copy" style={{ paddingBottom: '16px' }}>
                    <h3 className="search-result-title">{article.title}</h3>
                    {article.tags && article.tags.length > 0 && (
                      <div className="search-result-tags" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="search-result-footer" style={{ marginTop: 'auto', paddingTop: '12px' }}>
                      <div className="search-result-meta">
                        {article.category ? <span className="search-result-category">{article.category}</span> : null}
                      </div>
                    <span
                      className="search-result-save"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                        <StoryActionButton storyId={article.id} className="bookmark-btn search-result-bookmark" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="search-results-empty">
          <i className="fas fa-search" aria-hidden="true" />
          <h3>कोई खबर नहीं मिली</h3>
          <p>कृपया दूसरे शब्दों से खोजकर देखें।</p>
          <Link to="/" className="search-results-link">होमपेज पर लौटें</Link>
        </div>
      )}
    </main>
  );
};

export default SearchResults;
