import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <section>
            <h2 className="site-footer-title">हमारा नेटवर्क</h2>
            <div className="site-footer-links">
              <a href="#">हिंदी न्यूज़</a>
              <a href="#">हर ज़िंदगी</a>
              <a href="#">स्वास्थ्य</a>
              <a href="#">टीवी</a>
              <a href="#">इनएक्स्टलाइव</a>
              <a href="#">नवदुनिया</a>
              <a href="#">प्राइम वीडियो</a>
              <a href="#">खेल</a>
            </div>
          </section>

          <section>
            <h2 className="site-footer-title">ज़रूरी लिंक</h2>
            <div className="site-footer-links">
              <a href="#">हमारे बारे में</a>
              <a href="#">संपर्क करें</a>
              <a href="#">विज्ञापन दें</a>
              <a href="#">गोपनीयता नीति</a>
              <a href="#">कुकी नीति</a>
              <a href="#">अस्वीकरण</a>
              <a href="#">साइटमैप</a>
              <a href="#">ई-पेपर</a>
            </div>
          </section>

          <section>
            <h2 className="site-footer-title">ऐप और अपडेट</h2>
            <div className="site-footer-meta">
              <a href="#">लेटेस्ट खबरें सीधे मोबाइल पर पाएं</a>
              <a href="#">अपने शहर की खबरें फ़ॉलो करें</a>
              <a href="#">वीडियो, फोटो और ई-पेपर एक्सेस करें</a>
            </div>
          </section>
        </div>

        <div className="site-footer-brand">
          <div className="site-footer-brand-mark" aria-hidden="true"></div>
          <div className="site-footer-brand-text">प्रथम गेंडा</div>
        </div>

        <div className="site-footer-bottom">
          <div className="site-footer-copy">अंतिम अपडेट: 3 अप्रैल 2026</div>
          <div className="site-footer-badges">
            <a className="site-footer-badge" href="#"><i className="fab fa-apple"></i><span>ऐप स्टोर</span></a>
            <a className="site-footer-badge" href="#"><i className="fab fa-google-play"></i><span>गूगल प्ले</span></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
