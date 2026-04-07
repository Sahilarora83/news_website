import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ config, categories = [], tags = [], trendingTopics = [], cities = [] }) => {
  if (!config) {
    return null;
  }

  const brand = config?.siteNamePrimary || 'प्रथम एजेंडा';
  const secondary = config?.siteNameSecondary || 'NEWS';
  const tagline = config?.siteTagline || 'सच आईने की तरह...';
  const copy = config?.footerCopyright || '© 2026 प्रथम एजेंडा न्यूज़. सर्वाधिकार सुरक्षित.';
  const footerLogo = '/150x60 logo.jpg.jpeg';

  const quickLinks = [
    { to: '/', label: 'होम' },
    { to: '/epaper', label: 'E-Paper' },
    { to: '/shorts', label: 'शॉर्ट न्यूज़' },
    { to: '/weather', label: 'मौसम' },
  ];

  const footerCategories = categories.slice(0, 6);
  const footerTopics = trendingTopics.slice(0, 6);
  const footerCities = cities.slice(0, 4);
  const socialLinks = [
    { href: config?.facebook_url, label: 'Facebook' },
    { href: config?.twitter_url, label: 'X' },
    config?.whatsapp_number ? { href: `https://wa.me/${config.whatsapp_number}`, label: 'WhatsApp' } : null,
  ].filter((item) => item?.href);

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <section className="site-footer-intro">
            <div className="site-footer-kicker">डिजिटल न्यूज़ नेटवर्क</div>
            <h2 className="site-footer-title">
              {brand} <span className="site-footer-title-muted">{secondary}</span>
            </h2>
            <div className="site-footer-meta">
              <span>{tagline}</span>
              {config?.support_email ? <a href={`mailto:${config.support_email}`}>{config.support_email}</a> : null}
            </div>
            <div className="site-footer-actions">
              {quickLinks.map((item) => (
                <Link key={item.label} to={item.to} className="site-footer-badge">
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="site-footer-heading">लोकप्रिय श्रेणियां</h3>
            <div className="site-footer-links">
              {footerCategories.map((category) => (
                <Link key={category} to={`/search?q=${encodeURIComponent(category)}`}>
                  {category}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="site-footer-heading">ट्रेंडिंग टॉपिक्स</h3>
            <div className="site-footer-chip-list">
              {footerTopics.map((topic) => (
                <Link key={topic} to={`/search?q=${encodeURIComponent(topic)}`} className="site-footer-chip">
                  #{topic}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="site-footer-heading">शहर और पहुंच</h3>
            <div className="site-footer-links">
              {footerCities.map((city) => (
                <Link key={city} to={`/search?q=${encodeURIComponent(city)}`}>
                  {city}
                </Link>
              ))}
              {tags.slice(0, Math.max(0, 6 - footerCities.length)).map((tag) => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="site-footer-brand">
          <div className="site-footer-brand-lockup">
            <img className="site-footer-brand-image" src={footerLogo} alt={brand} />
            <div className="site-footer-brand-copy">
              <strong>{brand}</strong>
              <span>तेज़, भरोसेमंद और लोकल कवरेज के साथ</span>
            </div>
          </div>
          {socialLinks.length > 0 ? (
            <div className="site-footer-badges">
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="site-footer-badge">
                  {item.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-copy">{copy}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
