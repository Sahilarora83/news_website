import React from 'react';

const CityDrawer = ({ isOpen, close }) => {
  const cities = ['उत्तर प्रदेश', 'बिहार', 'दिल्ली', 'हरियाणा', 'उत्तराखंड', 'राजस्थान', 'मध्य प्रदेश', 'छत्तीसगढ़', 'हिमाचल', 'पंजाब'];

  return (
    <aside className={`city-drawer ${isOpen ? 'active' : ''}`}>
      <div className="city-header">
        <span className="city-title">शहर चुनें</span>
        <button className="city-close" onClick={close} type="button">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className="city-search">
        <i className="fa-solid fa-magnifying-glass" />
        <input type="text" placeholder="अपना शहर खोजें..." />
      </div>
      <div className="city-section-title">प्रमुख राज्य</div>
      <div className="city-list">
        {cities.map((city) => (
          <div key={city} className="city-item">
            <span>{city}</span>
            <button className="city-follow" type="button">फॉलो करें</button>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default CityDrawer;
