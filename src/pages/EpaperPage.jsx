import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../lib/api';

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */
const fmt = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/* ─── icon primitives ───────────────────────────────────────────────────────── */
const SvgIcon = ({ children, size = 20, stroke = '#fff', fill = 'none', ...rest }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={stroke}
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
    {children}
  </svg>
);

const WAIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} fill="#25D366" aria-hidden>
    <path d="M16 3C9.4 3 4 8.4 4 15c0 2.3.6 4.5 1.8 6.4L4 29l7.8-1.8C13.5 28.4 14.7 29 16 29c6.6 0 12-5.4 12-12S22.6 3 16 3zm5.9 16.6c-.3.8-1.4 1.5-2 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5-.3.4c.1.2.6.9 1.3 1.5.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1l.5-.6c.2-.2.4-.2.6-.1l2 .9c.2.1.4.2.5.4.1.2.1.9-.2 1.7z" />
  </svg>
);

const FBIcon = ({ size = 22 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#1877F2" aria-hidden>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#fff" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

/* ─── global style (injected once) ─────────────────────────────────────────── */
const STYLE_ID = 'epaper-global-style-v5';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    body.epaper-open { overflow: hidden; }
    body.epaper-open > *:not(#ep-portal) { visibility: hidden; }

    .ep-shell {
      visibility: visible !important;
      position: fixed; inset: 0; z-index: 9999;
      width: 100vw; height: 100dvh;
      display: flex; flex-direction: column;
      background: #fff;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .ep-header {
      display: flex;
      align-items: stretch;
      background: #3a3f44;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      flex-shrink: 0;
    }
    .ep-overlay {
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(15, 23, 42, 0.35);
      border: none;
    }
    .ep-sidebar {
      position: fixed; top: 0; left: 0; bottom: 0; z-index: 10001;
      width: min(320px, 92vw);
      background: #fff;
      box-shadow: 12px 0 32px rgba(0,0,0,0.2);
      display: flex; flex-direction: column;
    }
    .ep-sidebar-header {
      min-height: 58px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 18px;
      border-bottom: 1px solid #eceff3;
      font-size: 1.05rem; font-weight: 800; color: #111827;
    }
    .ep-sidebar-close {
      border: none; background: transparent; cursor: pointer;
      color: #6b7280; font-size: 30px; line-height: 1;
    }
    .ep-sidebar-list {
      overflow-y: auto;
      padding: 12px 0 18px;
    }
    .ep-sidebar-item {
      width: 100%;
      min-height: 58px;
      padding: 0 18px;
      border: none;
      border-bottom: 1px solid #f1f5f9;
      background: #fff;
      display: flex; align-items: center; justify-content: space-between;
      text-align: left;
      font-size: 1rem; font-weight: 600; color: #111827;
      cursor: pointer;
    }
    .ep-sidebar-subitem {
      min-height: 50px;
      font-weight: 500;
      color: #374151;
      background: #fafafa;
    }

    .ep-toolbar {
      display: flex; align-items: stretch;
      background: transparent; min-height: 46px; flex: 1 1 auto;
      border-bottom: 0;
    }
    .ep-tbtn {
      background: transparent; border: none; color: #fff;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; padding: 0 12px; min-width: 54px;
      border-right: 1px solid rgba(255,255,255,0.08);
    }
    .ep-tbtn:hover { background: rgba(255,255,255,0.07); }

    .ep-city-pill {
      display: flex; align-items: center; gap: 4px;
      background: #ef1d25; padding: 0 16px; cursor: pointer;
      border: none; color: #fff;
      min-width: 190px; justify-content: space-between;
      border-right: 1px solid rgba(255,255,255,0.08);
    }
    .ep-trigger-label {
      color: #fff; font-weight: 700; font-size: 14px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .ep-edition-wrap {
      display: flex; align-items: center; gap: 3px;
      padding: 0 14px;
      min-width: 134px;
      justify-content: space-between;
      border-left: none;
      border-right: 1px solid rgba(255,255,255,0.08); border-top: none; border-bottom: none;
      background: transparent; cursor: pointer;
    }

    .ep-date-pill {
      display: flex; align-items: center; gap: 6px;
      padding: 0 14px;
      min-width: 198px;
      justify-content: space-between;
      font-size: 13px; font-weight: 600; color: #fff; white-space: nowrap;
      border-left: none;
      border-right: 1px solid rgba(255,255,255,0.08); border-top: none; border-bottom: none;
      background: transparent; cursor: pointer;
    }

    .ep-right { margin-left: auto; display: flex; align-items: stretch; }
    .ep-dropdown {
      position: absolute;
      top: 52px;
      left: 44px;
      z-index: 10002;
      background: #fff;
      border: 1px solid #e5e7eb;
      box-shadow: 0 16px 32px rgba(15, 23, 42, 0.18);
      border-radius: 0 0 10px 10px;
      overflow: hidden;
      max-height: min(60vh, 360px);
      overflow-y: auto;
    }
    .ep-dropdown-wide { width: min(240px, calc(100vw - 56px)); }
    .ep-dropdown-compact { left: 180px; width: 180px; }
    .ep-dropdown-date { left: 250px; width: min(220px, calc(100vw - 56px)); padding: 12px; }
    .ep-dropdown-item {
      width: 100%;
      min-height: 44px;
      padding: 0 12px;
      border: none;
      border-bottom: 1px solid #f3f4f6;
      background: #fff;
      text-align: left;
      color: #111827;
      font-size: 14px;
      cursor: pointer;
    }
    .ep-dropdown-item:hover {
      background: #f8fafc;
    }
    .ep-dropdown-empty {
      padding: 14px 12px;
      color: #6b7280;
      font-size: 13px;
    }
    .ep-date-input {
      width: 100%;
      min-height: 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0 10px;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .ep-date-presets {
      display: grid;
      gap: 0;
    }

    .ep-sharebar {
      display: flex; align-items: center;
      background: transparent; min-height: 46px; flex-shrink: 0;
      padding: 0; gap: 0;
      border-bottom: 0;
    }
    .ep-sbtn {
      background: transparent; border: none; color: #fff;
      cursor: pointer; display: flex; align-items: center; gap: 5px;
      min-height: 44px;
      padding: 0 14px;
      border-right: 1px solid rgba(255,255,255,0.08);
      border-radius: 0; font-size: 13px; font-weight: 600;
    }
    .ep-sbtn:hover { background: rgba(255,255,255,0.08); }
    .ep-sbtn:disabled { opacity: 0.35; cursor: default; }
    .ep-sep { width: 1px; height: 22px; background: rgba(255,255,255,0.15); margin: 0 2px; flex-shrink: 0; }

    .ep-viewer {
      flex: 1; overflow-y: auto; overflow-x: hidden;
      display: flex; flex-direction: column; align-items: center;
      background: #e8eaed;
    }
    .ep-page-wrap { width: 100%; max-width: 960px; padding: 12px; box-sizing: border-box; }
    .ep-page-img {
      width: 100%; display: block;
      box-shadow: 0 2px 16px rgba(0,0,0,0.18);
      border: 1px solid #d1d5db; background: #fff;
    }
    .ep-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      color: #64748b; text-align: center; padding: 40px 20px; min-height: 300px;
    }

    .ep-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 10px; padding: 12px; width: 100%; max-width: 960px; box-sizing: border-box;
    }
    .ep-thumb {
      background: #fff; border: 1.5px solid #e2e8f0; border-radius: 4px;
      overflow: hidden; cursor: pointer; padding: 0; text-align: left;
    }
    .ep-thumb:hover, .ep-thumb.ep-active { border-color: #d72638; }
    .ep-thumb img { width: 100%; display: block; }
    .ep-thumb-ph { height: 110px; background: #f1f5f9; display: grid; place-items: center; color: #94a3b8; font-size: 12px; }
    .ep-thumb-lbl { padding: 4px 6px; font-size: 11px; font-weight: 700; color: #334155; }

    .ep-pagebar {
      display: flex; align-items: center;
      background: #1a1d23; color: #fff; min-height: 50px; flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .ep-pbtn {
      background: transparent; border: none; color: #fff; cursor: pointer;
      height: 100%; min-width: 46px; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
    }
    .ep-pbtn:hover:not(:disabled) { background: rgba(255,255,255,0.07); }
    .ep-pbtn:disabled { opacity: 0.3; cursor: default; }
    .ep-plabel { flex: 1; text-align: center; font-weight: 700; font-size: 14px; }
    .ep-view-all {
      background: transparent; border: none; color: #bbb;
      font-size: 12px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; gap: 5px;
      padding: 0 12px; white-space: nowrap; height: 100%;
    }
    .ep-view-all:hover { color: #fff; }

    @media (min-width: 769px) {
      .ep-viewer {
        position: relative;
      }
      .ep-pagebar {
        position: fixed;
        left: 50%;
        bottom: 18px;
        transform: translateX(-50%);
        width: auto;
        min-height: 46px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 14px 36px rgba(0, 0, 0, 0.28);
        overflow: hidden;
        z-index: 10003;
        background: rgba(33, 36, 42, 0.96);
      }
      .ep-view-all {
        min-width: 168px;
        justify-content: center;
        padding: 0 16px;
        color: #fff;
        font-size: 13px;
        border-right: 1px solid rgba(255,255,255,0.09);
      }
      .ep-view-all svg {
        flex-shrink: 0;
      }
      .ep-pbtn {
        min-width: 46px;
        height: 46px;
        font-size: 19px;
        border-right: 1px solid rgba(255,255,255,0.09);
      }
      .ep-pbtn:last-of-type {
        border-right: 0;
      }
      .ep-plabel {
        min-width: 156px;
        padding: 0 16px;
        font-size: 13px;
        font-weight: 700;
        border-right: 1px solid rgba(255,255,255,0.09);
        letter-spacing: 0.01em;
      }
    }

    @media (max-width: 768px) {
      .ep-header {
        display: block;
      }
      .ep-dropdown {
        top: 96px;
        left: 8px;
        right: 8px;
        width: auto;
        max-height: 280px;
      }
      .ep-dropdown-compact,
      .ep-dropdown-date {
        left: 8px;
        width: auto;
      }
      .ep-toolbar {
        min-height: 96px;
        flex-wrap: wrap;
      }
      .ep-tbtn {
        min-width: 42px;
        padding: 0 8px;
      }
      .ep-city-pill,
      .ep-edition-wrap,
      .ep-date-pill {
        min-height: 48px;
      }
      .ep-city-pill {
        flex: 1 1 42%;
      }
      .ep-edition-wrap {
        flex: 1 1 33%;
      }
      .ep-date-pill {
        flex: 0 0 48px;
        justify-content: center;
      }
      .ep-right {
        width: 100%;
        margin-left: 0;
        justify-content: flex-end;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .ep-sharebar {
        flex-wrap: wrap;
        justify-content: flex-start;
        min-height: 44px;
        height: auto;
        padding: 6px 8px;
        background: #3a3f44;
        border-top: 1px solid rgba(255,255,255,0.06);
      }
      .ep-page-wrap {
        padding: 8px;
      }
      .ep-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        padding: 8px;
      }
      .ep-pagebar {
        min-height: 54px;
      }
      .ep-view-all {
        padding: 0 10px;
        font-size: 11px;
      }
      .ep-plabel {
        font-size: 12px;
        line-height: 1.2;
        padding: 0 6px;
      }
    }

    @media (max-width: 480px) {
      .ep-sidebar {
        width: 100vw;
      }
      .ep-header {
        display: block;
      }
      .ep-shell {
        background: #f3f4f6;
      }
      .ep-toolbar {
        min-height: 50px;
        display: grid;
        grid-template-columns: 48px minmax(0, 1.45fr) minmax(0, 0.95fr) 44px 44px;
        grid-template-rows: 50px;
        flex-wrap: nowrap;
      }
      .ep-date-pill .ep-date-txt { display: none; }
      .ep-hide-mobile { display: none !important; }
      .ep-tbtn {
        min-width: 44px;
        height: 50px;
        padding: 0;
      }
      .ep-city-pill {
        width: 100%;
        min-width: 0;
        min-height: 50px;
        justify-content: center;
        padding: 0 8px;
        border-radius: 0;
      }
      .ep-city-pill select,
      .ep-edition-wrap select {
        font-size: 13px;
      }
      .ep-trigger-label {
        font-size: 12px;
        max-width: 100%;
      }
      .ep-edition-wrap {
        width: 100%;
        min-width: 0;
        min-height: 50px;
        justify-content: center;
        padding: 0 6px;
        border-left: 1px solid rgba(255,255,255,0.1);
      }
      .ep-date-pill {
        width: 44px;
        min-height: 50px;
        padding: 0;
        justify-content: center;
      }
      .ep-right {
        width: auto;
        margin-left: 0;
        border-top: 0;
      }
      .ep-right .ep-tbtn:last-child {
        width: 44px;
      }
      .ep-dropdown {
        top: 50px;
      }
      .ep-sharebar {
        min-height: 50px;
        justify-content: space-between;
        padding: 0;
        gap: 0;
        border-top: 1px solid rgba(255,255,255,0.08);
        background: #3a3f44;
        overflow: hidden;
      }
      .ep-sbtn {
        min-height: 50px;
        min-width: 0;
        flex: 1 1 0;
        justify-content: center;
        padding: 0 8px;
        font-size: 11px;
        border-right: 1px solid rgba(255,255,255,0.08);
        border-radius: 0;
        gap: 4px;
      }
      .ep-sbtn:first-child {
        flex: 1.2 1 0;
      }
      .ep-sbtn span,
      .ep-sbtn .ep-sbtn-label {
        white-space: nowrap;
      }
      .ep-sep {
        display: none;
      }
      .ep-viewer {
        background: #eef2f7;
        padding: 8px 0 0;
      }
      .ep-page-wrap {
        padding: 8px 8px 12px;
        display: flex;
        justify-content: center;
      }
      .ep-page-img {
        width: min(100%, 390px);
        border: 1px solid #d6d9de;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      }
      .ep-empty {
        margin: 8px;
        width: calc(100% - 16px);
        min-height: calc(100dvh - 180px);
        padding: 28px 16px;
        background: #fff;
        border: 1px solid #dbe3ee;
        border-radius: 14px;
        box-sizing: border-box;
      }
      .ep-empty div[style*="font-size: 18px"],
      .ep-empty div[style*="font-size: 16px"] {
        font-size: 15px !important;
      }
      .ep-pagebar {
        display: grid;
        grid-template-columns: auto auto 1fr auto auto;
        align-items: center;
        min-height: 48px;
        background: #24272d;
      }
      .ep-view-all {
        grid-column: 1 / -1;
        justify-content: center;
        min-height: 40px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        font-size: 10px;
        letter-spacing: 0.01em;
      }
      .ep-pbtn {
        min-width: 40px;
        min-height: 48px;
        font-size: 18px;
      }
      .ep-plabel {
        font-size: 10px;
        padding: 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `;
  document.head.appendChild(s);
}

export default function EpaperPage() {
  const [data, setData] = useState({ editions: [], magazines: [], socialLinks: {} });
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [cityFilter, setCityFilter] = useState('');
  const [editionFilter, setEditionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [imageError, setImageError] = useState(false);
  const [showAllPages, setShowAllPages] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showEditionMenu, setShowEditionMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);

  useEffect(() => {
    document.body.classList.add('epaper-open');
    return () => document.body.classList.remove('epaper-open');
  }, []);

  useEffect(() => {
    setShowCityMenu(false);
    setShowEditionMenu(false);
    setShowDateMenu(false);
  }, [cityFilter, editionFilter, dateFilter]);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl('/api/epaper'))
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((p) => setData({
        editions: Array.isArray(p.editions) ? p.editions : [],
        magazines: Array.isArray(p.magazines) ? p.magazines : [],
        socialLinks: p.socialLinks || {},
      }))
      .catch((e) => console.error('E-Paper fetch:', e))
      .finally(() => setLoading(false));
  }, []);

  const cityOptions = useMemo(() =>
    [...new Set(data.editions.map((e) => String(e.cityRegion || e.city || '').trim()).filter(Boolean))],
    [data.editions]);
  const editionOptions = useMemo(() =>
    [...new Set(data.editions.map((e) => String(e.edition || e.name || '').trim()).filter(Boolean))],
    [data.editions]);
  const dateOptions = useMemo(() =>
    [...new Set(data.editions.map((e) => String(e.date || e.publishDate || '').trim()).filter(Boolean))].sort().reverse(),
    [data.editions]);

  const filtered = useMemo(() => data.editions.filter((e) => {
    const city = String(e.cityRegion || e.city || '').trim();
    const name = String(e.edition || e.name || '').trim();
    const date = String(e.date || e.publishDate || '').trim();
    if (cityFilter && city !== cityFilter) return false;
    if (editionFilter && name !== editionFilter) return false;
    if (dateFilter && date !== dateFilter) return false;
    return true;
  }), [cityFilter, editionFilter, dateFilter, data.editions]);

  const sel = filtered[0] || data.editions[0] || null;

  useEffect(() => {
    setPageIndex(0); setImageError(false); setShowAllPages(false);
  }, [sel?.id, sel?.name, cityFilter, editionFilter, dateFilter]);

  const explicitPages = Array.isArray(sel?.pages) ? sel.pages : [];
  const declaredCount = Number(sel?.pageCount || sel?.pagesCount || 0);
  const pages = explicitPages.length > 0
    ? explicitPages
    : declaredCount > 0
      ? Array.from({ length: declaredCount }, (_, i) => ({
          image: i === 0 ? (sel?.image || sel?.coverImage || '') : '',
          url: i === 0 ? (sel?.image || sel?.coverImage || '') : '',
          title: `Page ${i + 1}`,
        }))
      : [{ image: sel?.image || sel?.coverImage || '', title: sel?.name || 'E-Paper' }];

  const totalPages = Math.max(1, pages.length);
  const safeIdx = Math.min(pageIndex, totalPages - 1);
  const curPage = pages[safeIdx] || pages[0];
  const pageImage = curPage?.image || curPage?.url || curPage?.imageUrl || '';
  const pageLabel = `Page ${String(safeIdx + 1).padStart(2, '0')} of ${String(totalPages).padStart(2, '0')}`;
  const canDownload = Boolean(sel?.pdfUrl || sel?.pdf_url);
  const pdfUrl = sel?.pdfUrl || sel?.pdf_url || '';

  const displayCity     = cityFilter    || sel?.cityRegion || sel?.city    || 'City';
  const displayEdition  = editionFilter || sel?.edition    || sel?.name    || 'Main';
  const displayDateRaw  = dateFilter    || sel?.date       || sel?.publishDate || '';
  const displayDateFull = fmt(displayDateRaw) || fmt(new Date().toISOString());
  const displayDateNum  = displayDateRaw
    ? (new Date(displayDateRaw).getDate() || String(displayDateRaw).slice(-2))
    : new Date().getDate();
  const normalizedDateValue = (() => {
    const candidate = dateFilter || sel?.date || sel?.publishDate || '';
    if (!candidate) return '';
    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  })();

  const clamp = (n) => { setPageIndex(Math.max(0, Math.min(totalPages - 1, n))); setImageError(false); };

  const shareUrl  = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(`${displayCity} E-Paper – ${displayDateFull}`);
  const socialLinks = data.socialLinks || {};
  const normalizedWhatsapp = String(socialLinks.whatsapp?.url || '').trim();
  const whatsappHref = normalizedWhatsapp.startsWith('http')
    ? normalizedWhatsapp
    : normalizedWhatsapp
      ? `https://wa.me/${normalizedWhatsapp.replace(/[^\d]/g, '')}`
      : `https://wa.me/?text=${shareText}%20${shareUrl}`;
  const facebookHref = String(socialLinks.facebook?.url || '').trim() || `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
  const twitterHref = String(socialLinks.twitter?.url || '').trim() || `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
  const showWhatsapp = socialLinks.whatsapp?.active !== false;
  const showFacebook = socialLinks.facebook?.active !== false;
  const showTwitter = socialLinks.twitter?.active !== false;
  const topEditions = filtered.length > 0 ? filtered : data.editions;
  const sidebarItems = [
    { label: 'E-Paper', action: () => setShowSidebar(false) },
    { label: 'Top Editions', action: () => undefined },
    { label: 'Subscribe', action: () => setShowSidebar(false) },
    { label: 'Contact Us', action: () => setShowSidebar(false) },
  ];

  return (
    <div className="ep-shell" id="ep-portal">
      {showSidebar ? <button className="ep-overlay" aria-label="Close menu" onClick={() => setShowSidebar(false)} /> : null}
      {showSidebar ? (
        <aside className="ep-sidebar">
          <div className="ep-sidebar-header">
            <strong>E-Paper</strong>
            <button type="button" className="ep-sidebar-close" onClick={() => setShowSidebar(false)}>×</button>
          </div>
          <div className="ep-sidebar-list">
            {sidebarItems.map((item) => (
              <button key={item.label} type="button" className="ep-sidebar-item" onClick={item.action}>
                <span>{item.label}</span>
                <SvgIcon size={16} stroke="#8b8f96"><path d="M9 6l6 6-6 6" /></SvgIcon>
              </button>
            ))}
            {topEditions.slice(0, 8).map((edition) => (
              <button
                key={`${edition.slug || edition.name}-${edition.date || ''}`}
                type="button"
                className="ep-sidebar-item ep-sidebar-subitem"
                onClick={() => {
                  setCityFilter(String(edition.cityRegion || edition.city || '').trim());
                  setEditionFilter(String(edition.edition || edition.name || '').trim());
                  setDateFilter(String(edition.date || edition.publishDate || '').trim());
                  setShowSidebar(false);
                  setShowAllPages(false);
                  setImageError(false);
                  setPageIndex(0);
                }}
              >
                <span>
                  <strong style={{ display: 'block', fontSize: 14 }}>{edition.name || edition.edition || 'Edition'}</strong>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>
                    {String(edition.cityRegion || edition.city || 'General')} • {fmt(edition.date || edition.publishDate || '')}
                  </span>
                </span>
              </button>
            ))}
            {(data.magazines || []).slice(0, 3).map((item) => (
              <button key={item.slug || item.name} type="button" className="ep-sidebar-item ep-sidebar-subitem" onClick={() => setShowSidebar(false)}>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="ep-header">
        <div className="ep-toolbar">
          <button className="ep-tbtn" aria-label="Menu" onClick={() => setShowSidebar(true)}>
            <SvgIcon size={22}><path d="M3 6h18M3 12h18M3 18h18" /></SvgIcon>
          </button>

          <button type="button" className="ep-city-pill" onClick={() => {
            setShowCityMenu((value) => !value);
            setShowEditionMenu(false);
            setShowDateMenu(false);
          }}>
            <SvgIcon size={13}>
              <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="#fff" stroke="none" />
            </SvgIcon>
            <span className="ep-trigger-label">{displayCity}</span>
            <SvgIcon size={11}><path d="M6 9l6 6 6-6" /></SvgIcon>
          </button>

          <button type="button" className="ep-edition-wrap" onClick={() => {
            setShowEditionMenu((value) => !value);
            setShowCityMenu(false);
            setShowDateMenu(false);
          }}>
            <span className="ep-trigger-label">{displayEdition}</span>
            <SvgIcon size={11}><path d="M6 9l6 6 6-6" /></SvgIcon>
          </button>

          <button type="button" className="ep-date-pill" onClick={() => {
            setShowDateMenu((value) => !value);
            setShowCityMenu(false);
            setShowEditionMenu(false);
          }}>
            <SvgIcon size={14} stroke="#bbb">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </SvgIcon>
            <span className="ep-date-txt">{displayDateFull}</span>
          </button>

          <div className="ep-right">
            <button className="ep-tbtn ep-hide-mobile" aria-label="Zoom out" onClick={() => setZoom((v) => Math.max(0.5, +(v - 0.25).toFixed(2)))}>
              <SvgIcon size={18}>
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-3-3M8 11h6" />
              </SvgIcon>
            </button>
            <button className="ep-tbtn ep-hide-mobile" aria-label="Zoom in" onClick={() => setZoom((v) => Math.min(2.5, +(v + 0.25).toFixed(2)))}>
              <SvgIcon size={18}>
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-3-3M11 8v6M8 11h6" />
              </SvgIcon>
            </button>
            <button className="ep-tbtn ep-hide-mobile" aria-label="Fullscreen" onClick={() => document.documentElement.requestFullscreen?.()}>
              <SvgIcon size={18}>
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </SvgIcon>
            </button>
            <button className="ep-tbtn ep-hide-mobile" aria-label="Bookmark">
              <SvgIcon size={18}><path d="M17 3H7a2 2 0 0 0-2 2v16l7-4 7 4V5a2 2 0 0 0-2-2z" /></SvgIcon>
            </button>
            <button className="ep-tbtn" aria-label="Account" style={{ paddingRight: 12 }}>
              <SvgIcon size={20}>
                <circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" />
              </SvgIcon>
            </button>
          </div>
        </div>

        <div className="ep-sharebar">
          <button className="ep-sbtn" aria-label="Clip">
            <SvgIcon size={16}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></SvgIcon>
            Clip
          </button>
          <div className="ep-sep" />
          <button className="ep-sbtn" aria-label="Download PDF" disabled={!canDownload} onClick={() => canDownload && window.open(pdfUrl, '_blank', 'noopener,noreferrer')}>
            <SvgIcon size={18}><path d="M12 3v13M8 12l4 4 4-4M4 21h16" /></SvgIcon>
          </button>
          <div className="ep-sep" />
          {showWhatsapp ? (
            <button className="ep-sbtn" aria-label="WhatsApp" onClick={() => window.open(whatsappHref, '_blank', 'noopener,noreferrer')}>
              <WAIcon size={22} />
            </button>
          ) : null}
          {showFacebook ? (
            <button className="ep-sbtn" aria-label="Facebook" onClick={() => window.open(facebookHref, '_blank', 'noopener,noreferrer')}>
              <FBIcon size={22} />
            </button>
          ) : null}
          {showTwitter ? (
            <button className="ep-sbtn" aria-label="X (Twitter)" onClick={() => window.open(twitterHref, '_blank', 'noopener,noreferrer')}>
              <XIcon size={20} />
            </button>
          ) : null}
          {zoom !== 1 && <span className="ep-hide-mobile" style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{Math.round(zoom * 100)}%</span>}
        </div>
      </div>

      {showCityMenu ? (
        <div className="ep-dropdown ep-dropdown-wide">
          {cityOptions.length > 0 ? cityOptions.map((c) => (
            <button key={c} type="button" className="ep-dropdown-item" onClick={() => setCityFilter(c)}>
              {c}
            </button>
          )) : <div className="ep-dropdown-empty">No city editions available</div>}
        </div>
      ) : null}

      {showEditionMenu ? (
        <div className="ep-dropdown ep-dropdown-compact">
          {editionOptions.length > 0 ? editionOptions.map((n) => (
            <button key={n} type="button" className="ep-dropdown-item" onClick={() => setEditionFilter(n)}>
              {n}
            </button>
          )) : <div className="ep-dropdown-empty">No editions available</div>}
        </div>
      ) : null}

      {showDateMenu ? (
        <div className="ep-dropdown ep-dropdown-date">
          <input
            type="date"
            className="ep-date-input"
            value={normalizedDateValue}
            onChange={(event) => setDateFilter(event.target.value)}
          />
          <div className="ep-date-presets">
            {dateOptions.length > 0 ? dateOptions.slice(0, 6).map((value) => (
              <button key={value} type="button" className="ep-dropdown-item" onClick={() => setDateFilter(value)}>
                {fmt(value) || value}
              </button>
            )) : <div className="ep-dropdown-empty">No dates available</div>}
          </div>
        </div>
      ) : null}

      <div className="ep-viewer">
        {loading ? (
          <div className="ep-empty">
            <div style={{ fontSize: 16, fontWeight: 700, color: '#475569' }}>E-Paper लोड हो रहा है…</div>
          </div>
        ) : !sel ? (
          <div className="ep-empty">
            <SvgIcon size={52} stroke="#cbd5e1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </SvgIcon>
            <div style={{ marginTop: 16, fontSize: 18, fontWeight: 800, color: '#334155' }}>कोई E-Paper उपलब्ध नहीं</div>
            <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 14 }}>Admin panel से E-Paper edition upload करें।</div>
          </div>
        ) : showAllPages ? (
          <div className="ep-grid">
            {pages.map((pg, i) => {
              const src = pg.image || pg.url || pg.imageUrl || '';
              return (
                <button key={i} className={`ep-thumb${safeIdx === i ? ' ep-active' : ''}`} onClick={() => { setPageIndex(i); setShowAllPages(false); setImageError(false); }}>
                  {src ? <img src={src} alt={`Page ${i + 1}`} /> : <div className="ep-thumb-ph">पृष्ठ {i + 1}</div>}
                  <div className="ep-thumb-lbl">पृष्ठ {i + 1}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ep-page-wrap">
            {pageImage && !imageError ? (
              <img
                className="ep-page-img"
                src={pageImage}
                alt={`${displayCity} E-Paper पृष्ठ ${safeIdx + 1}`}
                onError={() => setImageError(true)}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
              />
            ) : (
              <div className="ep-empty">
                <SvgIcon size={52} stroke="#cbd5e1">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h4" />
                </SvgIcon>
                <div style={{ marginTop: 16, fontSize: 16, fontWeight: 700, color: '#334155' }}>{imageError ? 'Image load नहीं हुई' : 'Image उपलब्ध नहीं'}</div>
                <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 13 }}>Admin से page image या PDF URL attach करवाएं।</div>
                {canDownload && (
                  <button onClick={() => window.open(pdfUrl, '_blank', 'noopener,noreferrer')} style={{ marginTop: 16, background: '#d72638', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    PDF Download करें
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {!showAllPages ? (
        <div className="ep-pagebar">
          <button className="ep-view-all" onClick={() => setShowAllPages(true)}>
            <SvgIcon size={14} stroke="#aaa">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </SvgIcon>
            View All Pages
          </button>
          <button className="ep-pbtn" style={{ fontSize: 16 }} onClick={() => clamp(0)} disabled={safeIdx === 0} aria-label="First">«</button>
          <button className="ep-pbtn" onClick={() => clamp(safeIdx - 1)} disabled={safeIdx === 0} aria-label="Prev">‹</button>
          <div className="ep-plabel">{pageLabel}</div>
          <button className="ep-pbtn" onClick={() => clamp(safeIdx + 1)} disabled={safeIdx >= totalPages - 1} aria-label="Next">›</button>
          <button className="ep-pbtn" style={{ fontSize: 16 }} onClick={() => clamp(totalPages - 1)} disabled={safeIdx >= totalPages - 1} aria-label="Last">»</button>
        </div>
      ) : (
        <div className="ep-pagebar" style={{ justifyContent: 'center' }}>
          <button onClick={() => setShowAllPages(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '0 20px' }}>
            <SvgIcon size={16}><path d="M19 12H5M12 5l-7 7 7 7" /></SvgIcon>
            Single Page View पर वापस जाएं
          </button>
        </div>
      )}
    </div>
  );
}
