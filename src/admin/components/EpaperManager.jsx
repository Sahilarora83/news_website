import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../../lib/api';

const createPage = (index = 0) => ({
  pageNumber: index + 1,
  title: `Page ${index + 1}`,
  image: '',
  pdfUrl: '',
});

const createEdition = () => ({
  name: '',
  slug: `edition-${Date.now()}`,
  cityRegion: '',
  edition: 'Main',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  image: '',
  pdfUrl: '',
  pageCount: 1,
  sortOrder: Date.now(),
  isActive: true,
  pages: [createPage(0)],
});

const createMagazine = () => ({
  name: '',
  slug: `magazine-${Date.now()}`,
  category: 'Magazine',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  image: '',
  pdfUrl: '',
  sortOrder: Date.now(),
  isActive: true,
});

const createSocialLinks = () => ({
  whatsapp: { url: '', active: true },
  facebook: { url: '', active: true },
  twitter: { url: '', active: true },
});

const CALENDAR_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatMonthLabel(date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      iso: date.toISOString().slice(0, 10),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('File read failed.'));
    reader.readAsDataURL(file);
  });
}

function normalizeEdition(item = {}, index = 0) {
  const pages = Array.isArray(item.pages) && item.pages.length > 0
    ? item.pages.map((page, pageIndex) => ({
        pageNumber: Number(page.pageNumber || page.page_no || pageIndex + 1),
        title: page.title || `Page ${pageIndex + 1}`,
        image: page.image || page.url || page.pageImage || '',
        pdfUrl: page.pdfUrl || page.pdf_url || '',
      }))
    : [createPage(0)];

  return {
    ...createEdition(),
    ...item,
    cityRegion: item.cityRegion || item.city || '',
    edition: item.edition || item.editionName || item.name || 'Main',
    date: item.date || item.issueDate || item.publishDate || new Date().toISOString().slice(0, 10),
    image: item.image || item.coverImage || item.cover_image || '',
    pdfUrl: item.pdfUrl || item.pdf_url || '',
    pageCount: Math.max(Number(item.pageCount || item.pagesCount || pages.length || 1), 1),
    sortOrder: Number(item.sortOrder ?? item.order ?? index + 1),
    isActive: item.isActive !== false,
    pages,
  };
}

function normalizeMagazine(item = {}, index = 0) {
  return {
    ...createMagazine(),
    ...item,
    date: item.date || item.issueDate || item.publishDate || new Date().toISOString().slice(0, 10),
    image: item.image || item.coverImage || item.cover_image || '',
    pdfUrl: item.pdfUrl || item.pdf_url || '',
    sortOrder: Number(item.sortOrder ?? item.order ?? index + 1),
    isActive: item.isActive !== false,
  };
}

const fieldGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
};

const panelStyle = {
  background: '#fff',
  border: '1px solid var(--admin-border)',
  borderRadius: 18,
  padding: 18,
  display: 'grid',
  gap: 14,
  minHeight: 0,
};

const previewStyle = {
  width: '100%',
  height: 140,
  objectFit: 'cover',
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  background: '#fff',
};

const Field = ({ label, children, fullWidth = false }) => (
  <label style={{ display: 'grid', gap: 6, gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</span>
    {children}
  </label>
);

export default function EpaperManager({ authHeaders }) {
  const [editions, setEditions] = useState([]);
  const [magazines, setMagazines] = useState([]);
  const [socialLinks, setSocialLinks] = useState(createSocialLinks());
  const [cityOptions, setCityOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('editions');
  const [editionSearch, setEditionSearch] = useState('');
  const [editionDateFilter, setEditionDateFilter] = useState('');
  const [editionStatusFilter, setEditionStatusFilter] = useState('all');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedEditionIndex, setSelectedEditionIndex] = useState(0);
  const [selectedMagazineIndex, setSelectedMagazineIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('/api/epaper'))
      .then((res) => res.json())
      .then((data) => {
        const nextEditions = (data.editions || []).map(normalizeEdition);
        const nextMagazines = (data.magazines || []).map(normalizeMagazine);
        setEditions(nextEditions);
        setMagazines(nextMagazines);
        setSocialLinks({
          ...createSocialLinks(),
          ...(data.socialLinks || {}),
        });
        setSelectedEditionIndex(0);
        setSelectedMagazineIndex(0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authHeaders?.Authorization) return;

    fetch(apiUrl('/api/admin/locations'), { headers: authHeaders })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load city options');
        return res.json();
      })
      .then((data) => {
        setCityOptions((data.cities || []).map((city) => city.name).filter(Boolean));
      })
      .catch(() => {
        setCityOptions([]);
      });
  }, [authHeaders]);

  const totals = useMemo(() => ({
    editions: editions.length,
    pages: editions.reduce((sum, edition) => sum + (edition.pages?.length || 0), 0),
    magazines: magazines.length,
  }), [editions, magazines]);

  const selectedEdition = editions[selectedEditionIndex] || null;
  const selectedMagazine = magazines[selectedMagazineIndex] || null;
  const todayKey = new Date().toISOString().slice(0, 10);
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const editionDateCountMap = useMemo(() => {
    const map = new Map();
    editions.forEach((edition) => {
      const key = String(edition.date || '').trim();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [editions]);

  const getEditionBucket = (edition) => {
    const raw = String(edition.date || '');
    if (!raw) return 'undated';
    if (raw === todayKey) return 'current';
    return raw > todayKey ? 'upcoming' : 'archive';
  };

  const filteredEditionEntries = useMemo(() => {
    return editions
      .map((edition, index) => ({ edition, index, bucket: getEditionBucket(edition) }))
      .filter(({ edition, bucket }) => {
        const haystack = `${edition.name} ${edition.cityRegion} ${edition.edition} ${edition.slug}`.toLowerCase();
        const searchOk = !editionSearch.trim() || haystack.includes(editionSearch.trim().toLowerCase());
        const dateOk = !editionDateFilter || String(edition.date || '') === editionDateFilter;
        const statusOk = editionStatusFilter === 'all' || bucket === editionStatusFilter;
        return searchOk && dateOk && statusOk;
      });
  }, [editions, editionSearch, editionDateFilter, editionStatusFilter]);

  const groupedEditionEntries = useMemo(() => {
    const groups = {
      current: [],
      upcoming: [],
      archive: [],
      undated: [],
    };
    filteredEditionEntries.forEach((entry) => {
      groups[entry.bucket].push(entry);
    });
    return groups;
  }, [filteredEditionEntries]);

  const editionDateOptions = useMemo(() => {
    return [...new Set(editions.map((edition) => String(edition.date || '')).filter(Boolean))].sort().reverse();
  }, [editions]);

  const updateEdition = (index, patch) => {
    setEditions((list) => list.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const next = { ...item, ...patch };
      next.pageCount = Math.max(Number(next.pageCount || next.pages?.length || 1), 1);
      return next;
    }));
  };

  const updateEditionPage = (editionIndex, pageIndex, patch) => {
    setEditions((list) => list.map((edition, itemIndex) => {
      if (itemIndex !== editionIndex) return edition;
      const pages = (edition.pages || []).map((page, currentPageIndex) => (
        currentPageIndex === pageIndex ? { ...page, ...patch } : page
      ));
      return { ...edition, pages, pageCount: Math.max(pages.length, 1) };
    }));
  };

  const updateMagazine = (index, patch) => {
    setMagazines((list) => list.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  };

  const updateSocialLinks = (key, patch) => {
    setSocialLinks((current) => ({
      ...current,
      [key]: {
        ...(current[key] || { url: '', active: true }),
        ...patch,
      },
    }));
  };

  const uploadAsset = async ({ file, endpoint, onComplete, targetKey }) => {
    if (!file) return;
    setUploadingTarget(targetKey);
    setMessage('');
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ fileName: file.name, dataUrl }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Upload failed');
      }
      const data = await response.json();
      onComplete(data.url);
      setMessage(`${file.name} uploaded successfully.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploadingTarget('');
    }
  };

  const save = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(apiUrl('/api/admin/epaper'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ editions, magazines, socialLinks }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'E-Paper save failed');
      }
      const data = await response.json();
      setEditions((data.editions || []).map(normalizeEdition));
      setMagazines((data.magazines || []).map(normalizeMagazine));
      setSocialLinks({
        ...createSocialLinks(),
        ...(data.socialLinks || {}),
      });
      setMessage('E-Paper data saved successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSocialMedia = async () => {
    setSavingSocial(true);
    setMessage('');
    try {
      const response = await fetch(apiUrl('/api/admin/epaper'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ editions, magazines, socialLinks }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Social media save failed');
      }
      const data = await response.json();
      setSocialLinks({
        ...createSocialLinks(),
        ...(data.socialLinks || {}),
      });
      setMessage('E-Paper social media saved successfully. Refresh the frontend to verify show and hide changes.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingSocial(false);
    }
  };

  return (
    <section className="admin-card" style={{ display: 'grid', gap: 20 }}>
      <div className="card-header">
        <div>
          <h3 style={{ margin: 0 }}>E-Paper CMS</h3>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
            Keep navigation on the left and editing on the right so each edition or magazine is easier to manage.
          </p>
        </div>
        <button className="btn-primary" onClick={save} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div style={panelStyle}><strong>Total Editions</strong><span style={{ fontSize: 28, fontWeight: 800 }}>{totals.editions}</span></div>
        <div style={panelStyle}><strong>Total Pages</strong><span style={{ fontSize: 28, fontWeight: 800 }}>{totals.pages}</span></div>
        <div style={panelStyle}><strong>Total Magazines</strong><span style={{ fontSize: 28, fontWeight: 800 }}>{totals.magazines}</span></div>
      </div>

      <div style={{ ...panelStyle, gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h4 style={{ margin: 0 }}>E-Paper Social Media</h4>
            <div style={{ marginTop: 4, color: '#64748b', fontSize: 13 }}>
              E-Paper page ke Facebook, X, WhatsApp, Instagram aur YouTube links yahin se control honge.
            </div>
          </div>
          <button className="btn-secondary" onClick={saveSocialMedia} disabled={savingSocial || loading}>
            {savingSocial ? 'Saving Social...' : 'Save Social Media'}
          </button>
        </div>
        <div style={fieldGrid}>
          <Field label="WhatsApp Share / Number">
            <>
              <input className="input-modern" value={socialLinks.whatsapp?.url || ''} onChange={(e) => updateSocialLinks('whatsapp', { url: e.target.value })} placeholder="919999999999 or full WhatsApp URL" />
              <label className="admin-checkbox">
                <input type="checkbox" checked={socialLinks.whatsapp?.active !== false} onChange={(e) => updateSocialLinks('whatsapp', { active: e.target.checked })} />
                <span>Active</span>
              </label>
            </>
          </Field>
          <Field label="Facebook URL">
            <>
              <input className="input-modern" value={socialLinks.facebook?.url || ''} onChange={(e) => updateSocialLinks('facebook', { url: e.target.value })} placeholder="https://facebook.com/yourpage" />
              <label className="admin-checkbox">
                <input type="checkbox" checked={socialLinks.facebook?.active !== false} onChange={(e) => updateSocialLinks('facebook', { active: e.target.checked })} />
                <span>Active</span>
              </label>
            </>
          </Field>
          <Field label="X / Twitter URL">
            <>
              <input className="input-modern" value={socialLinks.twitter?.url || ''} onChange={(e) => updateSocialLinks('twitter', { url: e.target.value })} placeholder="https://x.com/yourpage" />
              <label className="admin-checkbox">
                <input type="checkbox" checked={socialLinks.twitter?.active !== false} onChange={(e) => updateSocialLinks('twitter', { active: e.target.checked })} />
                <span>Active</span>
              </label>
            </>
          </Field>
        </div>
      </div>

      {message ? (
        <div style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? '#fef2f2' : '#eff6ff',
          color: message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? '#b91c1c' : '#1d4ed8',
          fontWeight: 600,
        }}>
          {message}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className={activeTab === 'editions' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('editions')}>Editions</button>
        <button className={activeTab === 'magazines' ? 'btn-primary' : 'btn-secondary'} onClick={() => setActiveTab('magazines')}>Magazines</button>
      </div>

      <div
        className={`admin-epaper-layout${activeTab === 'editions' ? ' editions' : ' magazines'}`}
        style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'editions' ? '340px minmax(0, 1fr)' : '320px minmax(0, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <aside
          className="admin-epaper-sidebar"
          style={{ ...panelStyle, position: 'sticky', top: 20, maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', overflowX: 'hidden' }}
        >
          {activeTab === 'editions' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <strong>Editions</strong>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditions((list) => [...list, createEdition()]);
                    setSelectedEditionIndex(editions.length);
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  className="input-modern"
                  value={editionSearch}
                  onChange={(e) => setEditionSearch(e.target.value)}
                  placeholder="Search city, edition, slug..."
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select className="input-modern" value={editionStatusFilter} onChange={(e) => setEditionStatusFilter(e.target.value)}>
                    <option value="all">All Records</option>
                    <option value="current">Current</option>
                    <option value="upcoming">New / Upcoming</option>
                    <option value="archive">Old / Archive</option>
                    <option value="undated">No Date</option>
                  </select>
                  <select className="input-modern" value={editionDateFilter} onChange={(e) => setEditionDateFilter(e.target.value)}>
                    <option value="">All Dates</option>
                    {editionDateOptions.map((date) => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: 14,
                  background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)',
                  display: 'grid',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <strong style={{ fontSize: 15 }}>Calendar</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ minWidth: 36, padding: 0 }}
                      onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    >
                      ‹
                    </button>
                    <div style={{ minWidth: 132, textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                      {formatMonthLabel(calendarMonth)}
                    </div>
                    <button
                      type="button"
                      className="btn-ghost"
                      style={{ minWidth: 36, padding: 0 }}
                      onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    >
                      ›
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
                  {CALENDAR_DAY_LABELS.map((label) => (
                    <div key={label} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {label}
                    </div>
                  ))}
                  {calendarDays.map((item) => {
                    const hasRecords = editionDateCountMap.has(item.iso);
                    const isSelectedFilter = editionDateFilter === item.iso;
                    const isToday = item.iso === todayKey;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setEditionDateFilter((current) => (current === item.iso ? '' : item.iso))}
                        style={{
                          position: 'relative',
                          minHeight: 38,
                          borderRadius: 12,
                          border: isSelectedFilter ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                          background: isSelectedFilter ? '#eef2ff' : item.isCurrentMonth ? '#fff' : '#f8fafc',
                          color: item.isCurrentMonth ? '#0f172a' : '#94a3b8',
                          fontWeight: isToday ? 800 : 600,
                          cursor: 'pointer',
                        }}
                      >
                        {item.day}
                        {hasRecords ? (
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 6,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: 6,
                              height: 6,
                              borderRadius: '999px',
                              background: isSelectedFilter ? '#4f46e5' : '#ef4444',
                            }}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="btn-ghost" onClick={() => setEditionDateFilter(todayKey)}>Today</button>
                  <button type="button" className="btn-ghost" onClick={() => setEditionDateFilter('')}>Clear Filter</button>
                  {selectedEdition ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => updateEdition(selectedEditionIndex, { date: editionDateFilter || todayKey })}
                    >
                      Use For Selected Edition
                    </button>
                  ) : null}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  ['current', 'Current'],
                  ['upcoming', 'New / Upcoming'],
                  ['archive', 'Old Records'],
                  ['undated', 'Without Date'],
                ].map(([bucketKey, label]) => (
                  groupedEditionEntries[bucketKey].length > 0 ? (
                    <div key={bucketKey} style={{ display: 'grid', gap: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {label} ({groupedEditionEntries[bucketKey].length})
                      </div>
                      {groupedEditionEntries[bucketKey].map(({ edition, index }) => (
                        <button
                          key={`${edition.slug}-${index}`}
                          onClick={() => setSelectedEditionIndex(index)}
                          style={{
                            textAlign: 'left',
                            border: index === selectedEditionIndex ? '1px solid #6366f1' : '1px solid #e2e8f0',
                            background: index === selectedEditionIndex ? '#eef2ff' : '#fff',
                            borderRadius: 14,
                            padding: 14,
                            cursor: 'pointer',
                            display: 'grid',
                            gap: 4,
                          }}
                        >
                          <strong>{edition.name || `Edition ${index + 1}`}</strong>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{edition.cityRegion || 'No city'} • {edition.date || 'No date'}</span>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{edition.pages?.length || 0} pages</span>
                        </button>
                      ))}
                    </div>
                  ) : null
                ))}
                {filteredEditionEntries.length === 0 ? (
                  <div style={{ padding: 14, borderRadius: 12, background: '#f8fafc', color: '#64748b', fontSize: 14 }}>
                    No editions found for current filters.
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <strong>Magazines</strong>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setMagazines((list) => [...list, createMagazine()]);
                    setSelectedMagazineIndex(magazines.length);
                  }}
                >
                  Add
                </button>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {magazines.map((magazine, index) => (
                  <button
                    key={`${magazine.slug}-${index}`}
                    onClick={() => setSelectedMagazineIndex(index)}
                    style={{
                      textAlign: 'left',
                      border: index === selectedMagazineIndex ? '1px solid #6366f1' : '1px solid #e2e8f0',
                      background: index === selectedMagazineIndex ? '#eef2ff' : '#fff',
                      borderRadius: 14,
                      padding: 14,
                      cursor: 'pointer',
                      display: 'grid',
                      gap: 4,
                    }}
                  >
                    <strong>{magazine.name || `Magazine ${index + 1}`}</strong>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{magazine.category} • {magazine.date}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <div style={{ display: 'grid', gap: 16 }}>
          {activeTab === 'editions' ? (
            selectedEdition ? (
              <>
                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{selectedEdition.name || 'Untitled Edition'}</h4>
                      <div style={{ color: '#64748b', fontSize: 13 }}>{selectedEdition.slug}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => updateEdition(selectedEditionIndex, {
                          pages: [...(selectedEdition.pages || []), createPage((selectedEdition.pages || []).length)],
                          pageCount: (selectedEdition.pages || []).length + 1,
                        })}
                      >
                        Add Page
                      </button>
                      <button
                        className="btn-ghost danger"
                        onClick={() => {
                          setEditions((list) => list.filter((_, index) => index !== selectedEditionIndex));
                          setSelectedEditionIndex((current) => Math.max(0, current - 1));
                        }}
                      >
                        Delete Edition
                      </button>
                    </div>
                  </div>

                  <div style={fieldGrid}>
                    <Field label="Edition Name"><input className="input-modern" value={selectedEdition.name} onChange={(e) => updateEdition(selectedEditionIndex, { name: e.target.value })} /></Field>
                    <Field label="Slug"><input className="input-modern" value={selectedEdition.slug} onChange={(e) => updateEdition(selectedEditionIndex, { slug: e.target.value })} /></Field>
                    <Field label="City / Region">
                      <>
                        <input
                          className="input-modern"
                          list="epaper-city-options"
                          value={selectedEdition.cityRegion}
                          onChange={(e) => updateEdition(selectedEditionIndex, { cityRegion: e.target.value })}
                          placeholder="Select or type city"
                        />
                        {cityOptions.length > 0 ? (
                          <datalist id="epaper-city-options">
                            {cityOptions.map((city) => (
                              <option key={city} value={city} />
                            ))}
                          </datalist>
                        ) : null}
                      </>
                    </Field>
                    <Field label="Edition Label"><input className="input-modern" value={selectedEdition.edition} onChange={(e) => updateEdition(selectedEditionIndex, { edition: e.target.value })} /></Field>
                    <Field label="Issue Date"><input type="date" className="input-modern" value={selectedEdition.date} onChange={(e) => updateEdition(selectedEditionIndex, { date: e.target.value })} /></Field>
                    <Field label="Sort Order"><input type="number" className="input-modern" value={selectedEdition.sortOrder} onChange={(e) => updateEdition(selectedEditionIndex, { sortOrder: Number(e.target.value || 0) })} /></Field>
                    <Field label="Active">
                      <select className="input-modern" value={selectedEdition.isActive ? 'yes' : 'no'} onChange={(e) => updateEdition(selectedEditionIndex, { isActive: e.target.value === 'yes' })}>
                        <option value="yes">Active</option>
                        <option value="no">Hidden</option>
                      </select>
                    </Field>
                    <Field label="Total Pages"><input type="number" className="input-modern" value={selectedEdition.pageCount} onChange={(e) => updateEdition(selectedEditionIndex, { pageCount: Number(e.target.value || 1) })} /></Field>
                    <Field label="Description" fullWidth>
                      <textarea className="textarea-modern" style={{ minHeight: 90 }} value={selectedEdition.description} onChange={(e) => updateEdition(selectedEditionIndex, { description: e.target.value })} />
                    </Field>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
                  <div style={panelStyle}>
                    <strong>Cover Image</strong>
                    {selectedEdition.image ? <img src={selectedEdition.image} alt="Edition cover" style={previewStyle} /> : <div style={{ ...previewStyle, display: 'grid', placeItems: 'center', color: '#94a3b8' }}>No cover</div>}
                    <input className="input-modern" value={selectedEdition.image} onChange={(e) => updateEdition(selectedEditionIndex, { image: e.target.value })} placeholder="Cover image URL" />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                        <input hidden type="file" accept="image/*" onChange={(event) => uploadAsset({
                          file: event.target.files?.[0],
                          endpoint: '/api/admin/uploads/images',
                          targetKey: `edition-cover-${selectedEditionIndex}`,
                          onComplete: (url) => updateEdition(selectedEditionIndex, { image: url }),
                        })} />
                        {uploadingTarget === `edition-cover-${selectedEditionIndex}` ? 'Uploading...' : 'Upload Cover'}
                      </label>
                      {selectedEdition.image ? <a className="btn-ghost" href={selectedEdition.image} target="_blank" rel="noreferrer">Preview</a> : null}
                    </div>
                  </div>

                  <div style={panelStyle}>
                    <strong>Edition PDF</strong>
                    <div style={{ padding: 16, borderRadius: 12, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: 14 }}>
                      Upload a full edition PDF here, or upload page images and PDFs separately below.
                    </div>
                    <input className="input-modern" value={selectedEdition.pdfUrl} onChange={(e) => updateEdition(selectedEditionIndex, { pdfUrl: e.target.value })} placeholder="Edition PDF URL" />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                        <input hidden type="file" accept="application/pdf" onChange={(event) => uploadAsset({
                          file: event.target.files?.[0],
                          endpoint: '/api/admin/uploads/documents',
                          targetKey: `edition-pdf-${selectedEditionIndex}`,
                          onComplete: (url) => updateEdition(selectedEditionIndex, { pdfUrl: url }),
                        })} />
                        {uploadingTarget === `edition-pdf-${selectedEditionIndex}` ? 'Uploading...' : 'Upload PDF'}
                      </label>
                      {selectedEdition.pdfUrl ? <a className="btn-ghost" href={selectedEdition.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a> : null}
                    </div>
                  </div>
                </div>

                <div style={panelStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <strong>Page Uploads</strong>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Each page has its own card so the team can update files without scrolling through one long form.</span>
                  </div>
                  <div className="admin-epaper-page-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {(selectedEdition.pages || []).map((page, pageIndex) => (
                      <div key={`${selectedEdition.slug}-page-${pageIndex}`} style={{ border: '1px solid #e2e8f0', borderRadius: 16, padding: 14, display: 'grid', gap: 10, background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <strong>Page {page.pageNumber}</strong>
                          <button
                            className="btn-ghost danger"
                            onClick={() => updateEdition(selectedEditionIndex, {
                              pages: (selectedEdition.pages || []).filter((_, index) => index !== pageIndex),
                              pageCount: Math.max((selectedEdition.pages || []).length - 1, 1),
                            })}
                          >
                            Delete
                          </button>
                        </div>
                        {page.image ? <img src={page.image} alt={page.title || `Page ${page.pageNumber}`} style={previewStyle} /> : <div style={{ ...previewStyle, display: 'grid', placeItems: 'center', color: '#94a3b8' }}>No page image</div>}
                        <Field label="Title"><input className="input-modern" value={page.title} onChange={(e) => updateEditionPage(selectedEditionIndex, pageIndex, { title: e.target.value })} /></Field>
                        <Field label="Page No"><input type="number" className="input-modern" value={page.pageNumber} onChange={(e) => updateEditionPage(selectedEditionIndex, pageIndex, { pageNumber: Number(e.target.value || pageIndex + 1) })} /></Field>
                        <Field label="Image URL"><input className="input-modern" value={page.image} onChange={(e) => updateEditionPage(selectedEditionIndex, pageIndex, { image: e.target.value })} /></Field>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                            <input hidden type="file" accept="image/*" onChange={(event) => uploadAsset({
                              file: event.target.files?.[0],
                              endpoint: '/api/admin/uploads/images',
                              targetKey: `page-image-${selectedEditionIndex}-${pageIndex}`,
                              onComplete: (url) => updateEditionPage(selectedEditionIndex, pageIndex, { image: url }),
                            })} />
                            {uploadingTarget === `page-image-${selectedEditionIndex}-${pageIndex}` ? 'Uploading...' : 'Upload Image'}
                          </label>
                          {page.image ? <a className="btn-ghost" href={page.image} target="_blank" rel="noreferrer">Preview</a> : null}
                        </div>
                        <Field label="Page PDF"><input className="input-modern" value={page.pdfUrl} onChange={(e) => updateEditionPage(selectedEditionIndex, pageIndex, { pdfUrl: e.target.value })} /></Field>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                            <input hidden type="file" accept="application/pdf" onChange={(event) => uploadAsset({
                              file: event.target.files?.[0],
                              endpoint: '/api/admin/uploads/documents',
                              targetKey: `page-pdf-${selectedEditionIndex}-${pageIndex}`,
                              onComplete: (url) => updateEditionPage(selectedEditionIndex, pageIndex, { pdfUrl: url }),
                            })} />
                            {uploadingTarget === `page-pdf-${selectedEditionIndex}-${pageIndex}` ? 'Uploading...' : 'Upload PDF'}
                          </label>
                          {page.pdfUrl ? <a className="btn-ghost" href={page.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="admin-epaper-empty" style={panelStyle}>No edition selected.</div>
            )
          ) : selectedMagazine ? (
            <div style={panelStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedMagazine.name || 'Untitled Magazine'}</h4>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{selectedMagazine.slug}</div>
                </div>
                <button
                  className="btn-ghost danger"
                  onClick={() => {
                    setMagazines((list) => list.filter((_, index) => index !== selectedMagazineIndex));
                    setSelectedMagazineIndex((current) => Math.max(0, current - 1));
                  }}
                >
                  Delete Magazine
                </button>
              </div>

              <div style={fieldGrid}>
                <Field label="Magazine Name"><input className="input-modern" value={selectedMagazine.name} onChange={(e) => updateMagazine(selectedMagazineIndex, { name: e.target.value })} /></Field>
                <Field label="Slug"><input className="input-modern" value={selectedMagazine.slug} onChange={(e) => updateMagazine(selectedMagazineIndex, { slug: e.target.value })} /></Field>
                <Field label="Category"><input className="input-modern" value={selectedMagazine.category} onChange={(e) => updateMagazine(selectedMagazineIndex, { category: e.target.value })} /></Field>
                <Field label="Issue Date"><input type="date" className="input-modern" value={selectedMagazine.date} onChange={(e) => updateMagazine(selectedMagazineIndex, { date: e.target.value })} /></Field>
                <Field label="Sort Order"><input type="number" className="input-modern" value={selectedMagazine.sortOrder} onChange={(e) => updateMagazine(selectedMagazineIndex, { sortOrder: Number(e.target.value || 0) })} /></Field>
                <Field label="Active">
                  <select className="input-modern" value={selectedMagazine.isActive ? 'yes' : 'no'} onChange={(e) => updateMagazine(selectedMagazineIndex, { isActive: e.target.value === 'yes' })}>
                    <option value="yes">Active</option>
                    <option value="no">Hidden</option>
                  </select>
                </Field>
                <Field label="Description" fullWidth>
                  <textarea className="textarea-modern" style={{ minHeight: 90 }} value={selectedMagazine.description} onChange={(e) => updateMagazine(selectedMagazineIndex, { description: e.target.value })} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16 }}>
                <div style={panelStyle}>
                  <strong>Magazine Cover</strong>
                  {selectedMagazine.image ? <img src={selectedMagazine.image} alt="Magazine cover" style={previewStyle} /> : <div style={{ ...previewStyle, display: 'grid', placeItems: 'center', color: '#94a3b8' }}>No cover</div>}
                  <input className="input-modern" value={selectedMagazine.image} onChange={(e) => updateMagazine(selectedMagazineIndex, { image: e.target.value })} placeholder="Cover image URL" />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                      <input hidden type="file" accept="image/*" onChange={(event) => uploadAsset({
                        file: event.target.files?.[0],
                        endpoint: '/api/admin/uploads/images',
                        targetKey: `mag-cover-${selectedMagazineIndex}`,
                        onComplete: (url) => updateMagazine(selectedMagazineIndex, { image: url }),
                      })} />
                      {uploadingTarget === `mag-cover-${selectedMagazineIndex}` ? 'Uploading...' : 'Upload Cover'}
                    </label>
                    {selectedMagazine.image ? <a className="btn-ghost" href={selectedMagazine.image} target="_blank" rel="noreferrer">Preview</a> : null}
                  </div>
                </div>

                <div style={panelStyle}>
                  <strong>Magazine PDF</strong>
                  <input className="input-modern" value={selectedMagazine.pdfUrl} onChange={(e) => updateMagazine(selectedMagazineIndex, { pdfUrl: e.target.value })} placeholder="Magazine PDF URL" />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                      <input hidden type="file" accept="application/pdf" onChange={(event) => uploadAsset({
                        file: event.target.files?.[0],
                        endpoint: '/api/admin/uploads/documents',
                        targetKey: `mag-pdf-${selectedMagazineIndex}`,
                        onComplete: (url) => updateMagazine(selectedMagazineIndex, { pdfUrl: url }),
                      })} />
                      {uploadingTarget === `mag-pdf-${selectedMagazineIndex}` ? 'Uploading...' : 'Upload PDF'}
                    </label>
                    {selectedMagazine.pdfUrl ? <a className="btn-ghost" href={selectedMagazine.pdfUrl} target="_blank" rel="noreferrer">Open PDF</a> : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-epaper-empty" style={panelStyle}>No magazine selected.</div>
          )}
        </div>
      </div>
    </section>
  );
}
