import React, { useMemo, useState } from 'react';

const TaxonomyManager = ({ categories = [], tags = [], analytics, updateTaxonomy, formatNumber }) => {
  const [activeMode, setActiveMode] = useState('categories');
  const [inputValue, setInputValue] = useState('');

  const items = activeMode === 'categories' ? categories : tags;
  const usageMap = useMemo(() => {
    const source = analytics?.topCategories || [];
    return Object.fromEntries(source.map((item) => [item.label, item.count]));
  }, [analytics]);

  const handleAdd = () => {
    const cleaned = inputValue.trim();
    if (!cleaned) {
      return;
    }

    updateTaxonomy(activeMode, cleaned, 'add');
    setInputValue('');
  };

  return (
    <section className="admin-taxonomy-view">
      <div className="table-card">
        <header className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className={activeMode === 'categories' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveMode('categories')}
            >
              Categories
            </button>
            <button
              className={activeMode === 'tags' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setActiveMode('tags')}
            >
              Tags
            </button>
          </div>

          <div className="header-add-box" style={{ display: 'flex', gap: 12 }}>
            <input
              className="input-modern"
              style={{ width: '240px' }}
              value={inputValue}
              placeholder={activeMode === 'categories' ? 'New category' : 'New tag'}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
            <button className="btn-primary" onClick={handleAdd}>
              Add
            </button>
          </div>
        </header>

        <div className="card-body" style={{ padding: '24px' }}>
          <div className="taxonomy-grid">
            {items.map((item) => (
              <article key={item} className="taxonomy-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <strong style={{ fontSize: '15px', color: '#111827' }}>
                    {activeMode === 'tags' ? '#' : ''}
                    {item}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                    {formatNumber(usageMap[item] || 0)} Linked stories
                  </span>
                </div>
                <button
                  className="btn-ghost danger"
                  onClick={() => {
                    if (window.confirm(`Delete ${item}?`)) {
                      updateTaxonomy(activeMode, item, 'remove');
                    }
                  }}
                >
                  <i className="fas fa-trash-alt" />
                </button>
              </article>
            ))}

            {items.length === 0 ? (
              <div className="empty-state-pro" style={{ gridColumn: '1 / -1' }}>
                <i className="fas fa-folder-open" />
                <h3>No {activeMode}</h3>
                <p>Add your first {activeMode === 'categories' ? 'category' : 'tag'} to organize stories.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TaxonomyManager;
