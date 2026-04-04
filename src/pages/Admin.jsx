import React, { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../lib/api';
import '../admin/admin.css';

import AdminSidebar from '../admin/components/AdminSidebar';
import AdminHeader from '../admin/components/AdminHeader';
import DashboardOverview from '../admin/components/DashboardOverview';
import NewsList from '../admin/components/NewsList';
import StoryStudio from '../admin/components/StoryStudio';
import TaxonomyManager from '../admin/components/TaxonomyManager';
import SiteSettings from '../admin/components/SiteSettings';
import AdminLogin from '../admin/components/AdminLogin';
import AdminForgotPassword from '../admin/components/AdminForgotPassword';
import LocationMaster from '../admin/components/LocationMaster';
import WorkflowBoard from '../admin/components/WorkflowBoard';
import UserManage from '../admin/components/UserManage';

const STORAGE_KEY = 'pratham_genda_admin_token';
const USER_KEY = 'pratham_genda_admin_user';

const emptyPost = {
  id: '',
  slot: 'latest',
  title: '',
  category: '',
  city: '',
  image: '',
  excerpt: '',
  body: '',
  status: 'draft',
  featured: false,
  showOnHomepage: true,
  isSuggestion: true,
  socialLinks: [],
  order: '',
  tags: [],
  cityId: null,
  gallery: [],
  videoUrl: '',
  sticky: false,
  headlineShort: '',
  internalComments: '',
  banner: '',
  authorName: '',
  editorName: '',
  publishedAt: '',
};

function formatNumber(value) {
  return new Intl.NumberFormat('hi-IN').format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) return '-';

  try {
    return new Intl.DateTimeFormat('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function toDateTimeInputValue(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Image file read failed.'));
    reader.readAsDataURL(file);
  });
}

function formFromPost(post = {}) {
  return {
    id: post.id || '',
    slot: post.slot || 'latest',
    title: post.title || '',
    category: post.category || '',
    city: post.city || '',
    image: post.image || '',
    excerpt: post.excerpt || '',
    body: Array.isArray(post.body) ? post.body.join('\n\n') : String(post.body || ''),
    status: post.status || 'draft',
    featured: Boolean(post.featured),
    showOnHomepage: post.showOnHomepage !== false,
    isSuggestion: post.isSuggestion !== false,
    socialLinks: Array.isArray(post.socialLinks) ? post.socialLinks : [],
    order: post.order ? String(post.order) : '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    cityId: post.cityId ?? null,
    gallery: Array.isArray(post.gallery) ? post.gallery : [],
    videoUrl: post.videoUrl || '',
    sticky: Boolean(post.sticky),
    headlineShort: post.headlineShort || post.headline_short || '',
    internalComments: post.internalComments || post.internal_comments || '',
    banner: post.banner || '',
    authorName: post.authorName || '',
    editorName: post.editorName || '',
    publishedAt: toDateTimeInputValue(post.publishedAt || post.published_at),
  };
}

function settingsFormFromDashboard(data = {}) {
  const config = data.config || {};
  return {
    trending: config.trending !== false,
    siteNamePrimary: config.siteNamePrimary || '',
    siteNameSecondary: config.siteNameSecondary || '',
    siteTagline: config.siteTagline || '',
    footerCopyright: config.footerCopyright || '',
    facebook_url: config.facebook_url || '',
    twitter_url: config.twitter_url || '',
    whatsapp_number: config.whatsapp_number || '',
    support_email: config.support_email || '',
    meta_description: config.meta_description || '',
    latest: config.latest !== false,
    center: config.center !== false,
    breaking: config.breaking !== false,
    city: config.city !== false,
    election: config.election !== false,
    business: config.business !== false,
    editorial: config.editorial !== false,
    cricket: config.cricket !== false,
    shorts: config.shorts !== false,
    trio: config.trio !== false,
    show_article_suggestions: config.show_article_suggestions !== false,
    show_article_latest_news: config.show_article_latest_news !== false,
    slots: Array.isArray(data.slots) ? data.slots : [],
    trendingTopics: Array.isArray(data.trendingTopics) ? data.trendingTopics : [],
    electionTabs: Array.isArray(data.electionTabs) ? data.electionTabs : [],
    cricketPointsTable: Array.isArray(data.cricketSection?.pointsTable) ? data.cricketSection.pointsTable : [],
  };
}

function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [savingMessage, setSavingMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState('');
  const [postForm, setPostForm] = useState(emptyPost);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [settingsForm, setSettingsForm] = useState(() => settingsFormFromDashboard());

  const authHeaders = useMemo(
    () => ({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token],
  );

  const loadDashboard = async (activeToken = token) => {
    if (!activeToken) return;

    setLoadingDashboard(true);
    try {
      const response = await fetch(apiUrl('/api/admin/dashboard'), {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (response.status === 401) {
        throw new Error('unauthorized');
      }

      const data = await response.json();
      setDashboard(data);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      setSettingsForm(settingsFormFromDashboard(data));
      return data;
    } catch (error) {
      if (error.message === 'unauthorized') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_KEY);
        setToken('');
        setUser(null);
      }

      return null;
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard(token);
    }
  }, [token]);

  const filteredPosts = useMemo(() => {
    const allPosts = dashboard?.posts || [];
    const normalizedQuery = query.trim().toLowerCase();

    return allPosts.filter((post) => {
      const queryMatch =
        !normalizedQuery ||
        [post.title, post.category, post.city, post.slot, ...(post.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const slotMatch = !slotFilter || post.slot === slotFilter;
      const categoryMatch = !categoryFilter || post.category === categoryFilter;
      const statusMatch = !statusFilter || post.status === statusFilter;
      const cityMatch = !cityFilter || String(post.city || '').toLowerCase().includes(cityFilter.toLowerCase());

      return queryMatch && slotMatch && categoryMatch && statusMatch && cityMatch;
    });
  }, [dashboard, query, slotFilter, categoryFilter, statusFilter, cityFilter]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    try {
      const response = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        throw new Error('Login failed: Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem(STORAGE_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken('');
    setUser(null);
    setDashboard(null);
  };

  const savePost = async (event, nextStatus = 'published') => {
    event?.preventDefault?.();
    setSavingPost(true);
    setSavingMessage('');

    try {
      const response = await fetch(apiUrl('/api/admin/posts/submit'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          ...postForm,
          status: nextStatus,
          order: postForm.order ? Number(postForm.order) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Story save failed');
      }

      const data = await response.json();
      const nextDashboard = await loadDashboard();
      const savedPost = nextDashboard?.posts?.find((post) => String(post.id) === String(data.id));
      setEditingId(data.id);
      setPostForm(savedPost ? formFromPost(savedPost) : (current) => ({
        ...current,
        id: data.id,
        status: nextStatus,
      }));
      setSavingMessage(nextStatus === 'draft' ? 'Draft save ho gaya.' : 'Story publish ho gayi.');
    } catch (error) {
      setSavingMessage(error.message);
    } finally {
      setSavingPost(false);
    }
  };

  const resetEditor = () => {
    setEditingId('');
    setSavingMessage('');
    setUploadMessage('');
    setPostForm({ ...emptyPost });
    setActiveTab('editor');
  };

  const uploadStoryImage = async (file) => {
    if (!file) {
      return;
    }

    setUploadingImage(true);
    setUploadMessage('');

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch(apiUrl('/api/admin/uploads/images'), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          fileName: file.name,
          dataUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Image upload failed');
      }

      const data = await response.json();
      setPostForm((current) => ({
        ...current,
        image: data.url,
      }));
      setUploadMessage('Image upload ho gaya.');
    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this story?')) {
      return;
    }

    try {
      const response = await fetch(apiUrl(`/api/admin/posts/${postId}`), {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      await loadDashboard();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const updateTaxonomy = async (type, name, action) => {
    try {
      const response = await fetch(apiUrl(`/api/admin/taxonomy/${type}`), {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ name, action }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Taxonomy update failed');
      }

      await loadDashboard();
    } catch (error) {
      window.alert(error.message);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);

    try {
      const response = await fetch(apiUrl('/api/admin/config'), {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          config: {
            siteNamePrimary: settingsForm.siteNamePrimary,
            siteNameSecondary: settingsForm.siteNameSecondary,
            siteTagline: settingsForm.siteTagline,
            footerCopyright: settingsForm.footerCopyright,
            facebook_url: settingsForm.facebook_url,
            twitter_url: settingsForm.twitter_url,
            whatsapp_number: settingsForm.whatsapp_number,
            support_email: settingsForm.support_email,
            meta_description: settingsForm.meta_description,
            trending: settingsForm.trending,
            latest: settingsForm.latest,
            center: settingsForm.center,
            breaking: settingsForm.breaking,
            city: settingsForm.city,
            election: settingsForm.election,
            business: settingsForm.business,
            editorial: settingsForm.editorial,
            cricket: settingsForm.cricket,
            shorts: settingsForm.shorts,
            trio: settingsForm.trio,
            show_article_suggestions: settingsForm.show_article_suggestions,
            show_article_latest_news: settingsForm.show_article_latest_news,
          },
          slots: settingsForm.slots,
          trendingTopics: settingsForm.trendingTopics,
          electionTabs: settingsForm.electionTabs,
          cricketPointsTable: settingsForm.cricketPointsTable,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Settings save failed');
      }

      await loadDashboard();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setSavingSettings(false);
    }
  };

  if (!token || !user) {
    if (forgotPasswordMode) {
      return <AdminForgotPassword onBack={() => setForgotPasswordMode(false)} />;
    }

    return (
      <AdminLogin
        error={loginError}
        username={loginForm.username}
        setUsername={(value) => setLoginForm((current) => ({ ...current, username: value }))}
        password={loginForm.password}
        setPassword={(value) => setLoginForm((current) => ({ ...current, password: value }))}
        handleLogin={handleLogin}
        onForgotPassword={() => setForgotPasswordMode(true)}
      />
    );
  }

  if (loadingDashboard && !dashboard) {
    return <div className="admin-loading-screen">Admin panel load ho raha hai...</div>;
  }

  if (!dashboard) {
    return <div className="admin-loading-screen">Admin data load nahi ho paya.</div>;
  }

  return (
    <div className="admin-layout modern-theme">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} user={user} />

      <div className="admin-main-container">
        <AdminHeader query={query} setQuery={setQuery} user={user} />
        <main className="admin-content-area">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              summary={dashboard.summary}
              analytics={dashboard.analytics}
              categories={dashboard.categories}
              slots={dashboard.slots}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'workflow' && (
            <WorkflowBoard
              authHeaders={authHeaders}
              formatDateTime={formatDateTime}
              openEditor={(postId) => {
                const post = dashboard?.posts?.find((p) => String(p.id) === String(postId));
                if (post) {
                  setPostForm(formFromPost(post));
                  setEditingId(post.id);
                  setActiveTab('editor');
                } else {
                  window.alert('Detailed story data not found in dashboard! Please refresh.');
                }
              }}
            />
          )}

          {activeTab === 'posts' && (
            <NewsList
              filteredPosts={filteredPosts}
              slots={dashboard.slots}
              categories={dashboard.categories}
              slotFilter={slotFilter}
              setSlotFilter={setSlotFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              setActiveTab={setActiveTab}
              setPostForm={setPostForm}
              setEditingId={setEditingId}
              emptyPost={emptyPost}
              formFromPost={formFromPost}
              labels={dashboard.config?.labels || {}}
              formatDateTime={formatDateTime}
              deletePost={deletePost}
            />
          )}

          {activeTab === 'editor' && (
            <StoryStudio
              editingId={editingId}
              postForm={postForm}
              setPostForm={setPostForm}
              slots={dashboard.slots}
              categories={dashboard.categories}
              savePost={savePost}
              savingPost={savingPost}
              savingMessage={savingMessage}
              resetEditor={resetEditor}
              uploadingImage={uploadingImage}
              uploadMessage={uploadMessage}
              uploadStoryImage={uploadStoryImage}
              user={user}
            />
          )}

          {activeTab === 'locations' && <LocationMaster authHeaders={authHeaders} />}

          {activeTab === 'taxonomy' && (
            <TaxonomyManager
              categories={dashboard.categories}
              tags={dashboard.tags}
              analytics={dashboard.analytics}
              updateTaxonomy={updateTaxonomy}
              formatNumber={formatNumber}
            />
          )}

          {activeTab === 'users' && (
            <UserManage authHeaders={authHeaders} locationOptions={dashboard.locationOptions} />
          )}

          {activeTab === 'settings' && (
            <SiteSettings
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              saveSettings={saveSettings}
              savingSettings={savingSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
