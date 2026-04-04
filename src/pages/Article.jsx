import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import NewsCard from '../components/news/NewsCard';

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) {
      return;
    }

    const loadData = async () => {
      setStatus('loading');
      setError('');

      try {
        const [articleResponse, homeResponse] = await Promise.all([
          fetch(apiUrl(`/api/article/${id}`)),
          fetch(apiUrl('/api/home')),
        ]);

        if (!articleResponse.ok) {
          throw new Error('Article not found');
        }

        const articleData = await articleResponse.json();
        const homeData = await homeResponse.json();
        const relatedItems = homeData.items || [
          ...(homeData.latestNews || []),
          ...(homeData.centerNews || []),
          ...(homeData.breakingNews || []),
          ...(homeData.cityNews || []),
        ];

        setArticle(articleData.article);
        setRelated(
          relatedItems
            .filter((item) => String(item.id) !== String(id) && item.isSuggestion !== false)
            .slice(0, 4),
        );
        setConfig(homeData.config);
        setStatus('ready');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Article not found');
        setStatus('error');
      }
    };

    loadData();
  }, [id]);

  const bodyParagraphs = useMemo(() => {
    if (Array.isArray(article?.body)) {
      return article.body.filter(Boolean);
    }

    if (typeof article?.body === 'string' && article.body.trim()) {
      return article.body
        .split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    }

    return [];
  }, [article]);

  const highlights = useMemo(
    () =>
      bodyParagraphs
        .slice(0, 3)
        .map((paragraph) => paragraph.split('.').find((part) => part.trim())?.trim())
        .filter(Boolean)
        .map((point) => `${point}.`),
    [bodyParagraphs],
  );

  if (status === 'loading') {
    return (
      <div className="container article-status-view">
        <h2>खबर लोड हो रही है...</h2>
      </div>
    );
  }

  if (status === 'error' || !article) {
    return (
      <div className="container article-status-view">
        <h2>{error || 'खबर नहीं मिली'}</h2>
        <Link to="/">होमपेज पर लौटें</Link>
      </div>
    );
  }

  const showSuggestions = config?.show_article_suggestions !== false;
  const showLatest = config?.show_article_latest_news !== false;
  const publishedAt = article.publishedAt || article.createdAt;
  const updatedAt = article.updatedAt || publishedAt;
  const publishedLabel = publishedAt
    ? new Intl.DateTimeFormat('hi-IN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(publishedAt))
    : '';
  const updatedLabel = updatedAt
    ? new Intl.DateTimeFormat('hi-IN', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(updatedAt))
    : '';
  const authorName = article.authorName || 'News Desk';
  const editorName = article.editorName || '';
  const shareItems = [
    config?.facebook_url ? { href: config.facebook_url, icon: 'fab fa-facebook-f', label: 'Facebook' } : null,
    config?.twitter_url ? { href: config.twitter_url, icon: 'fab fa-x-twitter', label: 'X' } : null,
    config?.whatsapp_number
      ? { href: `https://wa.me/${config.whatsapp_number}`, icon: 'fab fa-whatsapp', label: 'WhatsApp' }
      : null,
  ].filter(Boolean);

  return (
    <main className="container single-article-view">
      <div className="article-breadcrumb">
        <Link to="/">Hindi News</Link> / <span>{article.category || 'News'}</span>
      </div>

      <div className="article-page-layout">
        <div className="article-main-content">
          <h1 className="article-title">{article.title}</h1>

          <div className="article-meta-info">
            <div className="article-byline">
              <span>
                By <strong>{authorName}</strong>
              </span>
              {editorName ? (
                <span>
                  {' '}
                  | Edited By: <strong>{editorName}</strong>
                </span>
              ) : null}
            </div>
            <div className="article-updated">
              {publishedLabel ? `Published: ${publishedLabel}` : null}
              {updatedLabel ? `${publishedLabel ? ' | ' : ''}Updated: ${updatedLabel}` : 'Updated just now'}
            </div>
          </div>

          <div className="social-share-row">
            <div className="social-share-icons">
              {shareItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="share-icon-btn"
                  aria-label={item.label}
                >
                  <i className={item.icon} />
                </a>
              ))}
              <button type="button" className="share-icon-btn" aria-label="Like story">
                <i className="far fa-heart" />
              </button>
              <button type="button" className="share-icon-btn" aria-label="Save story">
                <i className="far fa-bookmark" />
              </button>
            </div>
          </div>

          {article.image ? (
            <figure className="article-lead-media">
              <img src={article.image} alt={article.title} />
              <figcaption className="article-figcaption">{article.title}</figcaption>
            </figure>
          ) : null}

          {highlights.length > 0 ? (
            <div className="article-highlights">
              <ul>
                {highlights.map((point, index) => (
                  <li key={`${point}-${index}`}>{point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="article-full-body">
            {bodyParagraphs.map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {showSuggestions && related.length > 0 ? (
            <section className="related-news-section">
              <h2 className="related-news-heading">
                <span className="related-news-kicker">अगली खबर</span>
                आपके लिए सुझाव
              </h2>
              <div className="related-grid">
                {related.map((item) => (
                  <NewsCard key={item.id} type="list" data={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="article-sidebar">
          {showLatest && related.length > 0 ? (
            <div className="sidebar-block">
              <h3 className="sidebar-block-title">ताज़ा खबरें</h3>
              <div className="sidebar-list">
                {related.slice(0, 5).map((item) => (
                  <Link key={item.id} to={`/article/${item.id}`} className="sidebar-story-link">
                    <h4>{item.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
};

export default Article;
