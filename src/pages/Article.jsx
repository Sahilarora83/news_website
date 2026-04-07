import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../lib/api';
import NewsCard from '../components/news/NewsCard';
import StoryActionButton from '../components/common/StoryActionButton';

function collectRelatedCandidates(homeData = {}) {
  const buckets = [
    ...(homeData.items || []),
    ...(homeData.latestNews || []),
    ...(homeData.centerHero ? [homeData.centerHero] : []),
    ...(homeData.centerNews || []),
    ...(homeData.breakingNews || []),
    ...(homeData.cityNews || []),
    ...(homeData.electionCards || []),
    ...Object.values(homeData.featureSections || {}).flat(),
    ...(homeData.shortsVideos || []),
    ...((homeData.trioSections || []).flatMap((section) => section.items || [])),
    ...((homeData.customSections || []).flatMap((section) => section.items || [])),
  ];

  const seen = new Set();
  return buckets.filter((item) => {
    const nextId = String(item?.id || '').trim();
    if (!nextId || seen.has(nextId)) {
      return false;
    }
    seen.add(nextId);
    return true;
  });
}

function storyPath(item) {
  return `/article/${encodeURIComponent(item?.slug || item?.id || '')}`;
}

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) {
      return;
    }

    const loadData = async () => {
      setStatus('loading');
      setError('');

      try {
        const [articleResponse, homeResponse] = await Promise.all([
          fetch(apiUrl(`/api/article/${slug}`)),
          fetch(apiUrl('/api/home')),
        ]);

        if (!articleResponse.ok) {
          throw new Error('Article not found');
        }

        const articleData = await articleResponse.json();
        const homeData = await homeResponse.json();
        const relatedItems = collectRelatedCandidates(homeData);
        const latestStories = collectRelatedCandidates({
          items: homeData.items || [],
          latestNews: homeData.latestNews || [],
          centerHero: homeData.centerHero || null,
          centerNews: homeData.centerNews || [],
          breakingNews: homeData.breakingNews || [],
        });

        setArticle(articleData.article);
        setRelated(
          relatedItems
            .filter((item) => String(item.id) !== String(slug) && item.isSuggestion !== false)
            .slice(0, 4),
        );
        setLatestItems(latestStories.filter((item) => String(item.id) !== String(slug)).slice(0, 5));
        setConfig(homeData.config);
        setStatus('ready');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Article not found');
        setStatus('error');
      }
    };

    loadData();
  }, [slug]);

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

  const highlights = useMemo(() => {
    if (article?.excerpt) {
      return article.excerpt
        .split(/\n+/)
        .map((point) => point.trim())
        .filter(Boolean);
    }

    return [];
  }, [article?.excerpt]);


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
    <>
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
              <StoryActionButton storyId={article.id} action="like" className="share-icon-btn" title="Like story" />
              <StoryActionButton storyId={article.id} className="share-icon-btn" title="Bookmark story" />
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
          {showLatest && latestItems.length > 0 ? (
            <div className="sidebar-block">
              <h3 className="sidebar-block-title">खबरें और भी</h3>
              <div className="sidebar-list">
                {latestItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                  <Link to={storyPath(item)} className="sidebar-story-link">
                      <div className="sidebar-story-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="sidebar-thumb-placeholder" />
                        )}
                      </div>
                      <div className="sidebar-story-text">
                        <h4>{item.title}</h4>
                      </div>
                    </Link>
                    {index < latestItems.length - 1 && (
                      <div className="sidebar-divider" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
      </main>
    </>
  );
};

export default Article;
