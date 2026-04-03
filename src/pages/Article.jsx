import React from 'react';
import { useParams } from 'react-router-dom';

const Article = () => {
  const { id } = useParams();

  return (
    <main className="container article-container">
      <div className="main-grid" style={{ marginTop: '20px' }}>
        <div className="content-left">
          <div
            className="article-path"
            style={{ fontSize: '0.8rem', color: 'var(--news-red)', marginBottom: '15px', fontWeight: '700' }}
          >
            होम &rsaquo; राजनीति
          </div>
          <h1 style={{ fontSize: '2.2rem', lineHeight: '1.2', fontWeight: '800', marginBottom: '20px' }}>
            संसद में कब घटना के बाद राघव चड्ढा ने तोड़ी चुप्पी, AAP नेताओं ने किया पलटवार
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #eee',
              borderBottom: '1px solid #eee',
              padding: '12px 0',
              color: '#666',
              fontSize: '0.85rem',
              marginBottom: '25px',
            }}
          >
            <div>
              <span>एजेंसी, नई दिल्ली</span> | <span>Mar 3, 2026, 3:34 PM IST</span>
            </div>
            <div style={{ display: 'flex', gap: '15px', fontSize: '1.1rem', color: '#666' }}>
              <i className="fab fa-facebook-f" />
              <i className="fab fa-twitter" />
              <i className="fab fa-whatsapp" />
            </div>
          </div>

          <article className="article-body">
            <img
              src="https://staticimg.amarujala.com/assets/images/2026/04/03/raghav-chadha-aap_03d29bce66f8a8414004bc97393f31a4.jpeg?w=800"
              style={{ width: '100%', borderRadius: '4px', marginBottom: '25px' }}
              alt="Article Hero"
            />

            <div style={{ background: '#f9f9f9', padding: '20px', borderLeft: '5px solid var(--news-red)', marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: '800' }}>विस्तार</h3>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#444' }}>
                आम आदमी पार्टी ने राज्यसभा सांसद राघव चड्ढा पर हमला बोला है। आरोप है कि चड्ढा प्रधानमंत्री मोदी से डरते हैं
                और इसी वजह से पार्टी के बजाय खुद को बचाना ज्यादा सुरक्षित समझा।
              </p>
            </div>

            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '20px', color: '#222' }}>
              राजनीति में उथल-पुथल का दौर जारी है। राघव चड्ढा को लेकर आम आदमी पार्टी के भीतर से ही कई सवाल उठने लगे हैं।
              दिल्ली के मुख्यमंत्री अरविंद केजरीवाल की अनुपस्थिति में कई नेताओं ने राघव पर पार्टी का साथ न देने का आरोप
              लगाया है।
            </p>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '30px', color: '#222' }}>
              हाल ही में हुए एक प्रेस कॉन्फ्रेंस में 'आप' प्रवक्ता ने कहा, "जो डर गया, समझो मर गया। राघव जी आज मोदी जी के
              खिलाफ बोलने में हिचकिचा रहे हैं।" इसके बाद राघव चड्ढा ने भी पलटवार किया है।
            </p>

            <div style={{ color: '#888', fontSize: '0.9rem' }}>Article ID: {id}</div>
          </article>
        </div>
      </div>
    </main>
  );
};

export default Article;
