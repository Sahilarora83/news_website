import { configDotenv } from 'dotenv';
configDotenv();

import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authenticateUser,
  createAdminToken,
  requireRole,
} from './auth.js';
import {
  followCity,
  listFollowedCities,
  unfollowCity,
} from './city-follow-store.js';
import {
  listSavedStoryIds,
  saveStory,
  unsaveStory,
} from './story-save-store.js';
import {
  likeStory,
  listLikedStoryIds,
  unlikeStory,
} from './story-like-store.js';
import {
  createLocation,
  createUser,
  deleteLocation,
  deleteArticle,
  deleteShort,
  deleteUser,
  fetchAdminDashboard,
  fetchCoverageSummary,
  fetchPublicShorts,
  fetchShortById,
  fetchShorts,
  fetchWorkflowQueue,
  getArticleByIdOrSlug,
  getConfig,
  getHomeAggregatedData,
  getNewsByCity,
  listLocationsRepo,
  listUsers,
  requestPasswordReset,
  resetPassword,
  searchArticles,
  updateLocation,
  updatePostStatus,
  updateSiteConfig,
  updateTaxonomy,
  updateUser,
  updateUserRole,
  upsertArticle,
  upsertShort,
} from './sql-store.js';
import { getUploadsDirectory, saveBase64ImageUpload } from './media-store.js';

const app = express();
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');
let server = null;

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(getUploadsDirectory()));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'pratham-genda-unified-api',
    date: new Date().toISOString(),
  });
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body || {};

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Login failed: Invalid credentials' });
    }

    const token = createAdminToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      expiresInMinutes: 720,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/password-reset-request', async (req, res) => {
  const { identity } = req.body || {};
  try {
    const result = await requestPasswordReset(identity);
    const response = {
      message: 'If that account exists, password reset instructions have been sent.',
    };

    if (result && process.env.NODE_ENV !== 'production') {
      response.token = result.token;
      response.username = result.user.username;
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/password-reset', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  try {
    await resetPassword(token, password);
    return res.json({ message: 'Password has been updated successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/dashboard', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    const dashboard = await fetchAdminDashboard();
    return res.json({
      ...dashboard,
      user: {
        username: req.admin.sub,
        role: req.admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/coverage', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json(await fetchCoverageSummary());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/config', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json(await getConfig());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/config', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.json(await updateSiteConfig(req.body || {}));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/locations', requireRole(['super_admin', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json(await listLocationsRepo());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/locations/:type', requireRole(['super_admin', 'city_manager', 'admin']), async (req, res) => {
  try {
    const item = await createLocation(req.params.type, req.body || {});
    return res.status(201).json(item);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/locations/:type/:locationId', requireRole(['super_admin', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json(await updateLocation(req.params.type, req.params.locationId, req.body || {}));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/locations/:type/:locationId', requireRole(['super_admin', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json(await deleteLocation(req.params.type, req.params.locationId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/users', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.json({ users: await listUsers() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.status(201).json(await createUser(req.body || {}));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/users/:userId', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.json(await updateUser(req.params.userId, req.body || {}));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/users/:userId/role', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.json(await updateUserRole(req.params.userId, req.body?.role));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:userId', requireRole(['super_admin', 'admin']), async (req, res) => {
  try {
    return res.json(await deleteUser(req.params.userId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/posts/queue', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json({ items: await fetchWorkflowQueue() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/posts/:postId/status', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json(await updatePostStatus(req.params.postId, req.body || {}));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/posts/submit', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json(await upsertArticle(req.body || {}, req.admin));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/uploads/images', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    const uploaded = await saveBase64ImageUpload(req.body || {});
    const origin = `${req.protocol}://${req.get('host')}`;

    return res.status(201).json({
      ...uploaded,
      url: `${origin}${uploaded.relativeUrl}`,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/uploads/videos', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    const { saveBase64VideoUpload } = await import('./media-store.js');
    const uploaded = await saveBase64VideoUpload(req.body || {});
    const origin = `${req.protocol}://${req.get('host')}`;

    return res.status(201).json({
      ...uploaded,
      url: `${origin}${uploaded.relativeUrl}`,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/posts/:postId', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json(await deleteArticle(req.params.postId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/admin/shorts', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json({ items: await fetchShorts() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/shorts', requireRole(['super_admin', 'editor', 'reporter', 'city_manager', 'admin']), async (req, res) => {
  try {
    return res.json(await upsertShort(req.body || {}));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/admin/shorts/:shortId', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    return res.json(await deleteShort(req.params.shortId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/admin/taxonomy/:type', requireRole(['super_admin', 'editor', 'admin']), async (req, res) => {
  try {
    const names = await updateTaxonomy(req.params.type, req.body?.name, req.body?.action);
    return res.json({ items: names });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/home', async (req, res) => {
  try {
    return res.json(await getHomeAggregatedData());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/news-by-city', async (req, res) => {
  try {
    return res.json({ items: await getNewsByCity(req.query.city) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/shorts', async (req, res) => {
  try {
    return res.json({ items: await fetchPublicShorts() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/shorts/:id', async (req, res) => {
  try {
    const data = await fetchShortById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Short not found' });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/followed-cities', async (req, res) => {
  try {
    return res.json({ items: await listFollowedCities(req.query.clientId) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/followed-cities', async (req, res) => {
  try {
    return res.status(201).json(await followCity(req.body?.clientId, req.body?.city));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/followed-cities', async (req, res) => {
  try {
    return res.json(await unfollowCity(req.body?.clientId, req.body?.city));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/saved-stories', async (req, res) => {
  try {
    return res.json({ items: await listSavedStoryIds(req.query.clientId) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/saved-stories', async (req, res) => {
  try {
    return res.status(201).json(await saveStory(req.body?.clientId, req.body?.storyId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/saved-stories', async (req, res) => {
  try {
    return res.json(await unsaveStory(req.body?.clientId, req.body?.storyId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/liked-stories', async (req, res) => {
  try {
    return res.json({ items: await listLikedStoryIds(req.query.clientId) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post('/api/liked-stories', async (req, res) => {
  try {
    return res.status(201).json(await likeStory(req.body?.clientId, req.body?.storyId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/api/liked-stories', async (req, res) => {
  try {
    return res.json(await unlikeStory(req.body?.clientId, req.body?.storyId));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.get('/api/article/:id', async (req, res) => {
  try {
    const article = await getArticleByIdOrSlug(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    return res.json({ article });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const homeData = await getHomeAggregatedData();
    return res.json({
      query: String(req.query.q || ''),
      items: await searchArticles(req.query.q),
      trendingTopics: homeData.trendingTopics || [],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use('/api', (err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(join(distDir, 'index.html'));
  });
}

export function startServer(port = PORT, host = HOST) {
  if (server) {
    return server;
  }

  server = app.listen(port, host, () => {
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logLevel !== 'silent') {
      console.log(`[CMS] Server running on http://${host}:${port}`);
    }
  });
  return server;
}

export { app, server };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}
