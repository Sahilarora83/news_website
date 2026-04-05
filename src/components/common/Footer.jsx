import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ config, categories = [], tags = [] }) => {
  if (!config && categories.length === 0 && tags.length === 0) {
    return null;
  }

  const brand = (config?.siteNamePrimary || '').replace('प्रथम गेंडा', 'प्रथम एजेंडा');
  const copy = (config?.footerCopyright || '').replace('प्रथम गेंडा', 'प्रथम एजेंडा');
  const footerLogo = '/150x60 logo.jpg.jpeg';
  const socialLinks = [
    { href: config?.facebook_url, label: 'Facebook' },
    { href: config?.twitter_url, label: 'X' },
    config?.whatsapp_number ? { href: `https://wa.me/${config.whatsapp_number}`, label: 'WhatsApp' } : null,
  ].filter((item) => item?.href);

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          {categories.length > 0 ? (
            <section>
              <h2 className="site-footer-title">श्रेणियां</h2>
              <div className="site-footer-links">
                {categories.slice(0, 10).map((category) => (
                  <Link key={category} to={`/search?q=${encodeURIComponent(category)}`}>
                    {category}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {tags.length > 0 ? (
            <section>
              <h2 className="site-footer-title">ट्रेंडिंग टैग्स</h2>
              <div className="site-footer-links">
                {tags.slice(0, 10).map((tag) => (
                  <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}>
                    #{tag}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {socialLinks.length > 0 || config?.siteTagline || config?.support_email ? (
            <section>
              <h2 className="site-footer-title">हमसे जुड़ें</h2>
              <div className="site-footer-meta">
                {config?.siteTagline ? <span>{config.siteTagline}</span> : null}
                {config?.support_email ? <a href={`mailto:${config.support_email}`}>{config.support_email}</a> : null}
                {socialLinks.map((item) => (
                  <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {brand ? (
          <div className="site-footer-brand">
            <img className="site-footer-brand-image" src={footerLogo} alt={brand} />
          </div>
        ) : null}

        {copy ? (
          <div className="site-footer-bottom">
            <div className="site-footer-copy">{copy}</div>
          </div>
        ) : null}
      </div>
    </footer>
  );
};

export default Footer;
