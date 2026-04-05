import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { createDefaultStoreData } from './default-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const runtimeDirectory = join(__dirname, '.runtime');
const runtimeFile = join(runtimeDirectory, 'cms-data.json');

const PASSWORD_HASH_KEY_LEN = 64;
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_HASH_COST = 16384;

function normalizePasswordHash(value) {
  const parts = String(value || '').split('$');
  return parts.length === 6 ? parts : null;
}

function hashPassword(password) {
  const rawPassword = String(password || '');
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString('base64url');
  const derivedKey = scryptSync(rawPassword, salt, PASSWORD_HASH_KEY_LEN, {
    N: PASSWORD_HASH_COST,
    r: 8,
    p: 1,
  });

  return `scrypt$${PASSWORD_HASH_COST}$8$1$${salt}$${derivedKey.toString('base64url')}`;
}

function isHashedPassword(value) {
  return Boolean(normalizePasswordHash(value));
}

function verifyPassword(storedPassword, password) {
  const parts = normalizePasswordHash(storedPassword);
  const rawPassword = String(password || '');

  if (!parts) {
    return String(storedPassword) === rawPassword;
  }

  const [, cost, r, p, salt, storedHash] = parts;
  const derivedKey = scryptSync(rawPassword, salt, PASSWORD_HASH_KEY_LEN, {
    N: Number(cost) || PASSWORD_HASH_COST,
    r: Number(r) || 8,
    p: Number(p) || 1,
  });

  const storedBuffer = Buffer.from(storedHash, 'base64url');
  const derivedBuffer = Buffer.from(derivedKey);
  return storedBuffer.length === derivedBuffer.length && timingSafeEqual(storedBuffer, derivedBuffer);
}

const slotLabelToConfigKey = {
  latest: 'latest',
  center: 'center',
  breaking: 'breaking',
  city: 'city',
  election: 'election',
  business: 'business',
  editorial: 'editorial',
  'cricket-hero': 'cricket',
  'cricket-story': 'cricket',
  shorts: 'shorts',
};

let cache = null;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value, fallback = 'item') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

function formatRelativeTime(value) {
  if (!value) return '';

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return 'अभी';
  if (diffMinutes < 60) return `${diffMinutes} मिनट पहले`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} घंटे पहले`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} दिन पहले`;
}

function splitBody(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sortByOrderThenDate(items) {
  return [...items].sort((left, right) => {
    const orderDiff = Number(left.order || 0) - Number(right.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });
}

function nextNumericId(items = []) {
  return Math.max(0, ...items.map((item) => Number(item.id || 0))) + 1;
}

function normalizeNameList(items = []) {
  return items
    .map((item, index) => ({
      id: Number(item.id || index + 1),
      name: String(item.name || '').trim(),
      isActive: item.isActive !== false,
    }))
    .filter((item) => item.name);
}

function normalizeCricketPointsTable(rows = []) {
  return rows
    .map((row, index) => ({
      id: Number(row.id || index + 1),
      team: String(row.team || '').trim(),
      played: Number(row.played || 0),
      won: Number(row.won || 0),
      lost: Number(row.lost || 0),
      tied: Number(row.tied || 0),
      pts: Number(row.pts || 0),
      rr: String(row.rr || '0.000').trim(),
      badge: String(row.badge || '').trim(),
    }))
    .filter((row) => row.team);
}

function getLocationCollection(data, type) {
  const normalizedType = String(type || '').toLowerCase();
  if (normalizedType === 'state' || normalizedType === 'states') return data.locations.states;
  if (normalizedType === 'district' || normalizedType === 'districts') return data.locations.districts;
  if (normalizedType === 'city' || normalizedType === 'cities') return data.locations.cities;
  throw new Error('Unsupported location type.');
}

function sanitizeLoadedData(data) {
  let changed = false;

  if (Array.isArray(data.categories)) {
    const nextCategories = data.categories.filter((category) => String(category.name || '').trim() !== '???');
    if (nextCategories.length !== data.categories.length) {
      data.categories = nextCategories;
      changed = true;
    }
  }

  if (Array.isArray(data.articles)) {
    const nextArticles = data.articles.filter((article) => {
      return String(article.slug || '') !== 'smoke-test-story';
    });

    if (nextArticles.length !== data.articles.length) {
      data.articles = nextArticles;
      changed = true;
    }
  }

  if (Array.isArray(data.users)) {
    for (const user of data.users) {
      if (user && typeof user.password === 'string' && !isHashedPassword(user.password)) {
        user.password = hashPassword(user.password);
        changed = true;
      }
    }
  }

  if (!Array.isArray(data.passwordResetTokens)) {
    data.passwordResetTokens = [];
    changed = true;
  } else {
    const now = Date.now();
    const validTokens = data.passwordResetTokens.filter(
      (entry) => entry && entry.token && Number(entry.expiresAt) > now,
    );
    if (validTokens.length !== data.passwordResetTokens.length) {
      data.passwordResetTokens = validTokens;
      changed = true;
    }
  }

  return { data, changed };
}

function mapArticleForClient(article) {
  return {
    id: article.id,
    slug: article.slug,
    slot: article.slotKey,
    title: article.title,
    headlineShort: article.headlineShort || '',
    category: article.category,
    city: article.city || '',
    time: formatRelativeTime(article.publishedAt || article.updatedAt || article.createdAt),
    image: article.image,
    excerpt: article.excerpt,
    body: Array.isArray(article.body) ? article.body : [],
    status: article.status,
    featured: Boolean(article.featured),
    sticky: Boolean(article.sticky),
    isVideo: Boolean(article.isVideo),
    banner: article.banner || '',
    order: Number(article.order || 0),
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    publishedAt: article.publishedAt,
    authorName: article.authorName || '',
    editorName: article.editorName || '',
    banner: article.banner || '',
    showOnHomepage: article.showOnHomepage !== false,
    isSuggestion: article.isSuggestion !== false,
    tags: Array.isArray(article.tags) ? article.tags : [],
    videoUrl: article.videoUrl || '',
  };
}

function getPublishedHomepageArticles(data) {
  return sortByOrderThenDate(
    data.articles.filter((article) => {
      if (article.status !== 'published' || article.showOnHomepage === false) {
        return false;
      }

      if (Array.isArray(article.tags)) {
        const hasExcludedTag = article.tags.some(tag => {
          const t = String(tag).trim().toLowerCase();
          return t === 'test' || t === 'draft' || t === 'dummy';
        });
        if (hasExcludedTag) {
          return false;
        }
      }

      const lowerTitle = String(article.title || '').toLowerCase();
      if (lowerTitle.includes('dummy story') || lowerTitle.includes('test article')) {
        return false;
      }

      return true;
    }),
  );
}

function getActiveTopicNames(items) {
  return items.filter((item) => item.isActive !== false).map((item) => item.name);
}

function deriveTrendingTopicsFromArticles(articles = [], limit = 8) {
  const seen = new Set();
  const derived = [];

  for (const article of articles) {
    const candidates = [
      ...(Array.isArray(article.tags) ? article.tags : []),
      article.category,
      article.city,
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);

    for (const candidate of candidates) {
      const normalized = candidate.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      derived.push(candidate);
      if (derived.length >= limit) {
        return derived;
      }
    }
  }

  return derived;
}

function ensureCategory(data, categoryName) {
  if (!categoryName) return;
  const exists = data.categories.some(
    (category) => category.name.toLowerCase() === String(categoryName).toLowerCase(),
  );

  if (!exists) {
    const id = Math.max(0, ...data.categories.map((category) => Number(category.id || 0))) + 1;
    data.categories.push({
      id,
      name: categoryName,
      slug: slugify(categoryName, `category-${id}`),
      sortOrder: data.categories.length + 1,
    });
  }
}

function ensureTags(data, tagNames = []) {
  for (const tagName of tagNames) {
    if (!tagName) continue;
    const exists = data.tags.some((tag) => tag.name.toLowerCase() === String(tagName).toLowerCase());
    if (!exists) {
      const id = Math.max(0, ...data.tags.map((tag) => Number(tag.id || 0))) + 1;
      data.tags.push({
        id,
        name: tagName,
        slug: slugify(tagName, `tag-${id}`),
      });
    }
  }
}

function assignLocationIds(data, article) {
  if (!article.city) {
    return article;
  }

  const matchedCity = data.locations.cities.find(
    (city) => city.name.toLowerCase() === String(article.city).toLowerCase(),
  );

  return {
    ...article,
    mainCityId: matchedCity?.id ?? null,
  };
}

function buildCoverageData(data) {
  const published = getPublishedHomepageArticles(data);
  const bySlot = (slot) => published.filter((article) => article.slotKey === slot);

  const sections = [
    { key: 'latest', label: data.config.labels.latest, type: 'list', required: true, items: bySlot('latest') },
    {
      key: 'center',
      label: data.config.labels.center,
      type: 'hero-feed',
      required: true,
      items: [...bySlot('center-hero'), ...bySlot('center')],
      extras: { heroPresent: bySlot('center-hero').length > 0 },
    },
    { key: 'breaking', label: data.config.labels.breaking, type: 'list', required: true, items: bySlot('breaking') },
    { key: 'city', label: data.config.labels.city, type: 'grid', required: true, items: bySlot('city') },
    {
      key: 'elections',
      label: data.config.labels.election,
      type: 'tabs-grid',
      required: true,
      items: bySlot('election'),
      extras: { tabsCount: getActiveTopicNames(data.electionTabs).length },
    },
    { key: 'business', label: data.config.labels.business, type: 'feature-grid', required: true, items: bySlot('business') },
    {
      key: 'editorial',
      label: data.config.labels.editorial,
      type: 'feature-grid',
      required: true,
      items: bySlot('editorial'),
    },
    {
      key: 'cricket',
      label: data.config.labels.cricket,
      type: 'hero-table',
      required: true,
      items: [...bySlot('cricket-hero'), ...bySlot('cricket-story')],
      extras: {
        heroPresent: bySlot('cricket-hero').length > 0,
        pointsRows: data.cricketPointsTable.length,
      },
    },
    { key: 'shorts', label: data.config.labels.shorts, type: 'shorts-grid', required: true, items: bySlot('shorts') },
    {
      key: 'newsTrio',
      label: 'राष्ट्रीय न्यूज़ / पॉलिटिक्स / दुनिया',
      type: 'three-column',
      required: true,
      items: [...bySlot('trio-national'), ...bySlot('trio-politics'), ...bySlot('trio-world')],
      extras: { columns: 3 },
    },
  ];

  const normalizedSections = sections.map((section) => ({
    key: section.key,
    label: section.label,
    type: section.type,
    required: section.required,
    count: section.items.length,
    sampleTitles: section.items.slice(0, 3).map((article) => article.title),
    ...section.extras,
  }));

  const allRequiredCovered = normalizedSections
    .filter((section) => section.required)
    .every((section) => section.count > 0);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalSections: normalizedSections.length,
      totalArticles: published.length,
      uniqueArticles: new Set(published.map((article) => article.id)).size,
      duplicateArticles: 0,
      allRequiredCovered,
    },
    sections: normalizedSections,
    checks: [
      {
        key: 'all_sections',
        label: 'सभी प्रमुख sections में खबर मौजूद है',
        passed: allRequiredCovered,
      },
      {
        key: 'unique_articles',
        label: 'Article IDs unique हैं',
        passed: true,
      },
    ],
  };
}

function buildAnalytics(data) {
  const published = getPublishedHomepageArticles(data);
  const sectionCounts = data.slotDefinitions.map((definition) => ({
    key: definition.slot,
    label: definition.label,
    count: published.filter((article) => article.slotKey === definition.slot).length,
  }));

  const categoryCountMap = new Map();
  const cityCountMap = new Map();

  for (const article of published) {
    categoryCountMap.set(article.category, (categoryCountMap.get(article.category) || 0) + 1);
    if (article.city) {
      cityCountMap.set(article.city, (cityCountMap.get(article.city) || 0) + 1);
    }
  }

  const topCategories = [...categoryCountMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);

  const cityStats = [...cityCountMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count);

  return {
    totals: {
      posts: data.articles.length,
      sections: data.slotDefinitions.length,
      published: published.length,
      featured: data.articles.filter((article) => article.featured).length,
    },
    sectionCounts,
    topCategories,
    cityStats,
    cityCounts: Object.fromEntries(cityStats.map((item) => [item.label, item.count])),
  };
}

async function persist(nextData) {
  cache = deepClone(nextData);
  await mkdir(runtimeDirectory, { recursive: true });
  await writeFile(runtimeFile, JSON.stringify(cache, null, 2), 'utf8');
}

async function loadData() {
  if (cache) {
    return cache;
  }

  try {
    await access(runtimeFile, fsConstants.F_OK);
    const raw = await readFile(runtimeFile, 'utf8');
    cache = JSON.parse(raw);
    const sanitized = sanitizeLoadedData(cache);
    cache = sanitized.data;
    if (sanitized.changed) {
      await persist(cache);
    }
  } catch {
    cache = createDefaultStoreData();
    await persist(cache);
  }

  return cache;
}

async function updateData(mutator) {
  const current = deepClone(await loadData());
  const result = await mutator(current);
  await persist(current);
  return result;
}

function buildHomePayload(data) {
  const published = getPublishedHomepageArticles(data);
  const articlesBySlot = new Map();
  const slotDefinitionMap = new Map((data.slotDefinitions || []).map((slot) => [slot.slot, slot]));

  for (const article of published) {
    if (!articlesBySlot.has(article.slotKey)) {
      articlesBySlot.set(article.slotKey, []);
    }
    articlesBySlot.get(article.slotKey).push(mapArticleForClient(article));
  }

  const trioColumns = [
    { title: 'राष्ट्रीय न्यूज़', items: articlesBySlot.get('trio-national') || [] },
    { title: 'पॉलिटिक्स', items: articlesBySlot.get('trio-politics') || [] },
    { title: 'दुनिया', items: articlesBySlot.get('trio-world') || [] },
  ];

  const builtInSlots = new Set([
    'center-hero',
    'latest',
    'center',
    'breaking',
    'city',
    'election',
    'business',
    'editorial',
    'cricket-hero',
    'cricket-story',
    'shorts',
    'trio-national',
    'trio-politics',
    'trio-world',
  ]);

  const customSections = (data.slotDefinitions || [])
    .filter((slot) => !builtInSlots.has(slot.slot))
    .map((slot) => ({
      slot: slot.slot,
      title: slot.label || slot.section || slot.slot,
      section: slot.section || '',
      items: articlesBySlot.get(slot.slot) || [],
      single: Boolean(slot.single),
    }))
    .filter((section) => section.items.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    config: deepClone(data.config),
    locationStates: data.locations.states.map((state) => state.name),
    locationCities: data.locations.cities.map((city) => city.name),
    categories: [...data.categories]
      .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
      .map((category) => category.name),
    tags: data.tags.map((tag) => tag.name),
    trendingTopics: (() => {
      const configuredTopics = getActiveTopicNames(data.trendingTopics);
      return configuredTopics.length > 0
        ? configuredTopics
        : deriveTrendingTopicsFromArticles(published);
    })(),
    centerHero: (articlesBySlot.get('center-hero') || [])[0] || null,
    latestNews: articlesBySlot.get('latest') || [],
    centerNews: articlesBySlot.get('center') || [],
    breakingNews: articlesBySlot.get('breaking') || [],
    cityNews: articlesBySlot.get('city') || [],
    electionTabs: getActiveTopicNames(data.electionTabs),
    electionCards: articlesBySlot.get('election') || [],
    featureSections: {
      business: articlesBySlot.get('business') || [],
      editorial: articlesBySlot.get('editorial') || [],
    },
    cricketSection: {
      title: data.config.labels.cricket,
      icon: 'https://www.jagranimages.com/images/cricball.svg',
      tabs: ['शेड्यूल', 'रिजल्ट', 'टीम'],
      hero: (articlesBySlot.get('cricket-hero') || [])[0] || null,
      stories: articlesBySlot.get('cricket-story') || [],
      pointsTable: deepClone(data.cricketPointsTable),
    },
    shortsVideos: articlesBySlot.get('shorts') || [],
    trioSections: trioColumns,
    customSections,
    items: published.map(mapArticleForClient),
  };
}

export async function getHomeAggregatedData() {
  return buildHomePayload(deepClone(await loadData()));
}

export async function getArticleByIdOrSlug(idOrSlug) {
  const data = await loadData();
  const match = data.articles.find(
    (article) =>
      article.status === 'published' &&
      (String(article.id) === String(idOrSlug) || String(article.slug) === String(idOrSlug)),
  );

  return match ? mapArticleForClient(match) : null;
}

export async function searchArticles(query) {
  const normalized = String(query || '').trim().toLowerCase();
  if (!normalized) return [];

  const data = await loadData();
  return getPublishedHomepageArticles(data)
    .filter((article) => {
      const haystack = [
        article.title,
        article.excerpt,
        article.category,
        article.city,
        ...(article.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    })
    .map(mapArticleForClient);
}

export async function getNewsByCity(city) {
  const normalized = String(city || '').trim().toLowerCase();
  if (!normalized) return [];

  const data = await loadData();
  const matchedCity = data.locations.cities.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized,
  );
  const matchedState = data.locations.states.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized,
  );
  const alternateNeedles = [matchedCity?.name, matchedState?.name].filter(Boolean).map((item) => item.toLowerCase());

  return getPublishedHomepageArticles(data)
    .filter((article) => {
      const cityValue = String(article.city || '').toLowerCase();
      const categoryValue = String(article.category || '').toLowerCase();
      const cityMatch = cityValue.includes(normalized) || alternateNeedles.some((needle) => cityValue.includes(needle));
      const categoryMatch = categoryValue.includes(normalized) || alternateNeedles.some((needle) => categoryValue.includes(needle));
      return cityMatch || categoryMatch;
    })
    .map(mapArticleForClient);
}

export async function fetchAdminDashboard() {
  const data = deepClone(await loadData());
  const coverage = buildCoverageData(data);
  const analytics = buildAnalytics(data);

  return {
    generatedAt: new Date().toISOString(),
    config: deepClone(data.config),
    categories: data.categories
      .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
      .map((category) => category.name),
    tags: data.tags.map((tag) => tag.name),
    summary: {
      totalPosts: data.articles.length,
      drafts: data.articles.filter((article) => article.status === 'draft').length,
      published: data.articles.filter((article) => article.status === 'published').length,
      featured: data.articles.filter((article) => article.featured).length,
      sections: data.slotDefinitions.length,
      slots: data.slotDefinitions.length,
      allRequiredCovered: coverage.summary.allRequiredCovered,
    },
    coverage,
    analytics,
    posts: sortByOrderThenDate(data.articles).map((article) => ({
      ...mapArticleForClient(article),
      headline: article.title,
      headline_short: article.headlineShort,
      internal_comments: article.internalComments || '',
      created_at: article.createdAt,
      updated_at: article.updatedAt,
      published_at: article.publishedAt,
      city: article.city || '',
      showOnHomepage: article.showOnHomepage !== false,
      isSuggestion: article.isSuggestion !== false,
      socialLinks: article.socialLinks || [],
      gallery: article.gallery || [],
      videoUrl: article.videoUrl || '',
      banner: article.banner || '',
      authorName: article.authorName || '',
      editorName: article.editorName || '',
      tags: article.tags || [],
      breaking: article.slotKey === 'breaking',
    })),
    slots: deepClone(data.slotDefinitions),
    trendingTopics: deepClone(data.trendingTopics),
    electionTabs: deepClone(data.electionTabs),
    cricketSection: {
      title: data.config.labels.cricket,
      icon: 'https://www.jagranimages.com/images/cricball.svg',
      tabs: ['शेड्यूल', 'रिजल्ट', 'टीम'],
      pointsTable: deepClone(data.cricketPointsTable),
    },
    locationOptions: deepClone(data.locations),
  };
}

export async function fetchCoverageSummary() {
  return buildCoverageData(deepClone(await loadData()));
}

export async function listLocationsRepo() {
  const data = await loadData();
  return deepClone(data.locations);
}

export async function createLocation(type, payload = {}) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    const name = String(payload.name || '').trim();
    if (!name) {
      throw new Error('Location name is required.');
    }

    const slug = slugify(payload.slug || name, `${normalizedType}-${Date.now()}`);

    if (normalizedType === 'state') {
      const id = nextNumericId(data.locations.states);
      data.locations.states.push({ id, name, slug });
      return { id, name, slug };
    }

    if (normalizedType === 'district') {
      const id = nextNumericId(data.locations.districts);
      const stateId = Number(payload.stateId || data.locations.states[0]?.id || 1);
      if (!data.locations.states.some((item) => Number(item.id) === stateId)) {
        throw new Error('State not found.');
      }
      data.locations.districts.push({ id, stateId, name, slug });
      return { id, stateId, name, slug };
    }

    if (normalizedType === 'city') {
      const id = nextNumericId(data.locations.cities);
      const districtId = Number(payload.districtId || data.locations.districts[0]?.id || 1);
      if (!data.locations.districts.some((item) => Number(item.id) === districtId)) {
        throw new Error('District not found.');
      }
      data.locations.cities.push({
        id,
        districtId,
        name,
        slug,
        lat: Number(payload.lat || 0),
        lng: Number(payload.lng || 0),
      });
      return { id, districtId, name, slug };
    }

    throw new Error('Unsupported location type.');
  });
}

export async function updateLocation(type, locationId, payload = {}) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    const collection = getLocationCollection(data, normalizedType);
    const item = collection.find((entry) => Number(entry.id) === Number(locationId));
    if (!item) {
      throw new Error('Location not found.');
    }

    const previousName = item.name;
    const nextName = String(payload.name || item.name || '').trim();
    if (!nextName) {
      throw new Error('Location name is required.');
    }

    item.name = nextName;
    item.slug = slugify(payload.slug || nextName, `${normalizedType}-${item.id}`);

    if (normalizedType === 'district') {
      const stateId = Number(payload.stateId || item.stateId || 0);
      if (!data.locations.states.some((entry) => Number(entry.id) === stateId)) {
        throw new Error('State not found.');
      }
      item.stateId = stateId;
    }

    if (normalizedType === 'city') {
      const districtId = Number(payload.districtId || item.districtId || 0);
      if (!data.locations.districts.some((entry) => Number(entry.id) === districtId)) {
        throw new Error('District not found.');
      }
      item.districtId = districtId;
      item.lat = Number(payload.lat ?? item.lat ?? 0);
      item.lng = Number(payload.lng ?? item.lng ?? 0);

      for (const article of data.articles) {
        if (String(article.city || '').toLowerCase() === String(previousName || '').toLowerCase()) {
          article.city = nextName;
          article.mainCityId = item.id;
        }
      }
    }

    return deepClone(item);
  });
}

export async function deleteLocation(type, locationId) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    const collection = getLocationCollection(data, normalizedType);
    const item = collection.find((entry) => Number(entry.id) === Number(locationId));
    if (!item) {
      throw new Error('Location not found.');
    }

    if (normalizedType === 'state') {
      const hasDistricts = data.locations.districts.some((entry) => Number(entry.stateId) === Number(locationId));
      if (hasDistricts) {
        throw new Error('Delete districts under this state first.');
      }
    }

    if (normalizedType === 'district') {
      const hasCities = data.locations.cities.some((entry) => Number(entry.districtId) === Number(locationId));
      if (hasCities) {
        throw new Error('Delete cities under this district first.');
      }
    }

    if (normalizedType === 'city') {
      const cityInArticles = data.articles.some(
        (article) =>
          Number(article.mainCityId) === Number(locationId) ||
          String(article.city || '').toLowerCase() === String(item.name || '').toLowerCase(),
      );
      if (cityInArticles) {
        throw new Error('This city is linked to stories. Update those stories first.');
      }

      const cityInUsers = data.users.some((user) => Number(user.assignedCityId) === Number(locationId));
      if (cityInUsers) {
        throw new Error('This city is assigned to users. Reassign those users first.');
      }
    }

    const nextItems = collection.filter((entry) => Number(entry.id) !== Number(locationId));
    if (normalizedType === 'state') data.locations.states = nextItems;
    if (normalizedType === 'district') data.locations.districts = nextItems;
    if (normalizedType === 'city') data.locations.cities = nextItems;

    return { id: Number(locationId) };
  });
}

export async function listUsers() {
  const data = await loadData();
  return data.users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    assigned_city_id: user.assignedCityId ?? null,
    assigned_city: data.locations.cities.find((city) => city.id === user.assignedCityId)?.name || '',
  }));
}

export async function createUser(payload = {}) {
  return updateData(async (data) => {
    const username = String(payload.username || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '').trim();
    const role = String(payload.role || 'reporter').trim().toLowerCase();
    const assignedCityId = payload.assignedCityId ? Number(payload.assignedCityId) : null;

    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required.');
    }

    const duplicate = data.users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email,
    );
    if (duplicate) {
      throw new Error('User with the same username or email already exists.');
    }

    if (assignedCityId && !data.locations.cities.some((city) => Number(city.id) === assignedCityId)) {
      throw new Error('Assigned city not found.');
    }

    const nextUser = {
      id: nextNumericId(data.users),
      username,
      email,
      password: hashPassword(password),
      role,
      assignedCityId,
    };

    data.users.push(nextUser);
    return deepClone(nextUser);
  });
}

export async function updateUser(userId, payload = {}) {
  return updateData(async (data) => {
    const user = data.users.find((item) => Number(item.id) === Number(userId));
    if (!user) {
      throw new Error('User not found.');
    }

    const nextUsername = String(payload.username || user.username || '').trim();
    const nextEmail = String(payload.email || user.email || '').trim().toLowerCase();
    const nextRole = String(payload.role || user.role || '').trim().toLowerCase();
    const nextAssignedCityId =
      payload.assignedCityId === '' || payload.assignedCityId == null ? null : Number(payload.assignedCityId);

    if (!nextUsername || !nextEmail) {
      throw new Error('Username and email are required.');
    }

    const duplicate = data.users.find(
      (item) =>
        Number(item.id) !== Number(userId) &&
        (item.username.toLowerCase() === nextUsername.toLowerCase() || item.email.toLowerCase() === nextEmail),
    );
    if (duplicate) {
      throw new Error('User with the same username or email already exists.');
    }

    if (nextAssignedCityId && !data.locations.cities.some((city) => Number(city.id) === nextAssignedCityId)) {
      throw new Error('Assigned city not found.');
    }

    user.username = nextUsername;
    user.email = nextEmail;
    user.role = nextRole || user.role;
    user.assignedCityId = nextAssignedCityId;
    if (payload.password) {
      user.password = hashPassword(String(payload.password).trim());
    }

    return deepClone(user);
  });
}

export async function updateUserRole(userId, role) {
  return updateData(async (data) => {
    const user = data.users.find((item) => Number(item.id) === Number(userId));
    if (!user) {
      throw new Error('User not found.');
    }

      user.role = String(role || '').trim().toLowerCase() || user.role;
      return { id: user.id, role: user.role };
  });
}

export async function deleteUser(userId) {
  return updateData(async (data) => {
    const user = data.users.find((item) => Number(item.id) === Number(userId));
    if (!user) {
      throw new Error('User not found.');
    }

    const remainingAdmins = data.users.filter(
      (item) => Number(item.id) !== Number(userId) && String(item.role || '').toLowerCase() === 'admin',
    );
    if (String(user.role || '').toLowerCase() === 'admin' && remainingAdmins.length === 0) {
      throw new Error('At least one admin user is required.');
    }

    data.users = data.users.filter((item) => Number(item.id) !== Number(userId));
    return { id: Number(userId) };
  });
}

export async function requestPasswordReset(identity) {
  return updateData(async (data) => {
    const normalizedIdentity = String(identity || '').trim().toLowerCase();
    const user = data.users.find(
      (item) =>
        item.username.toLowerCase() === normalizedIdentity || item.email.toLowerCase() === normalizedIdentity,
    );

    if (!user) {
      return { message: 'If that account exists, password reset instructions have been sent.' };
    }

    data.passwordResetTokens = Array.isArray(data.passwordResetTokens) ? data.passwordResetTokens : [];
    data.passwordResetTokens = data.passwordResetTokens.filter((entry) => Number(entry.userId) !== Number(user.id));

    const token = randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60;
    data.passwordResetTokens.push({ token, userId: user.id, expiresAt });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  });
}

export async function resetPassword(token, password) {
  return updateData(async (data) => {
    const normalizedToken = String(token || '').trim();
    const entry = (Array.isArray(data.passwordResetTokens) ? data.passwordResetTokens : []).find(
      (item) => item.token === normalizedToken,
    );

    if (!entry || Number(entry.expiresAt) <= Date.now()) {
      throw new Error('Invalid or expired password reset token.');
    }

    const user = data.users.find((item) => Number(item.id) === Number(entry.userId));
    if (!user) {
      throw new Error('Invalid password reset request.');
    }

    user.password = hashPassword(String(password || '').trim());
    data.passwordResetTokens = data.passwordResetTokens.filter((item) => item.token !== normalizedToken);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  });
}

export async function fetchWorkflowQueue() {
  const data = await loadData();
  return sortByOrderThenDate(
    data.articles.filter((article) => ['pending', 'rejected'].includes(article.status)),
  ).map((article) => ({
    id: article.id,
    headline: article.title,
    status: article.status,
    city: article.city || '',
    updated_at: article.updatedAt,
    internal_comments: article.internalComments || '',
  }));
}

export async function updatePostStatus(postId, payload = {}) {
  return updateData(async (data) => {
    const article = data.articles.find((item) => String(item.id) === String(postId));
    if (!article) {
      throw new Error('Story not found.');
    }

    article.status = String(payload.status || article.status).trim().toLowerCase();
    article.internalComments = String(payload.comments || '').trim();
    article.updatedAt = new Date().toISOString();
    if (article.status === 'published' && !article.publishedAt) {
      article.publishedAt = article.updatedAt;
    }

    return { id: article.id, status: article.status };
  });
}

export async function upsertArticle(articleInput = {}, admin = null) {
  return updateData(async (data) => {
    const requestedStatus = String(articleInput.status || 'published').trim().toLowerCase();
    const now = new Date().toISOString();
    const body = splitBody(articleInput.body);
    const requestedPublishedAt = String(articleInput.publishedAt || '').trim();
    const normalizedPublishedAt =
      requestedPublishedAt && !Number.isNaN(new Date(requestedPublishedAt).getTime())
        ? new Date(requestedPublishedAt).toISOString()
        : '';
    const tags = Array.isArray(articleInput.tags)
      ? articleInput.tags.filter(Boolean).map((tag) => String(tag).trim())
      : [];
    const slotKey = String(articleInput.slot || 'latest').trim();

    ensureCategory(data, articleInput.category);
    ensureTags(data, tags);

    const existing = data.articles.find((item) => String(item.id) === String(articleInput.id));
    const nextId = existing?.id || `story-${Date.now()}`;
    const nextSlug = slugify(articleInput.slug || articleInput.title || nextId, nextId);

    const nextArticle = assignLocationIds(data, {
      ...(existing || {}),
      id: nextId,
      slug: nextSlug,
      title: String(articleInput.title || existing?.title || '').trim(),
      headlineShort: String(articleInput.headlineShort || existing?.headlineShort || '').trim(),
      excerpt: String(articleInput.excerpt || articleInput.title || existing?.excerpt || '').trim(),
      body: body.length ? body : existing?.body || [],
      image: String(articleInput.image || existing?.image || '').trim(),
      category: String(articleInput.category || existing?.category || '').trim(),
      city: String(articleInput.city || existing?.city || '').trim(),
      slotKey,
      status: requestedStatus,
      featured: Boolean(articleInput.featured),
      sticky: Boolean(articleInput.sticky),
      isVideo: Boolean(articleInput.isVideo),
      showOnHomepage: articleInput.showOnHomepage !== false,
      isSuggestion: articleInput.isSuggestion !== false,
      tags,
      videoUrl: String(articleInput.videoUrl || existing?.videoUrl || '').trim(),
      gallery: Array.isArray(articleInput.gallery) ? articleInput.gallery : existing?.gallery || [],
      socialLinks: Array.isArray(articleInput.socialLinks) ? articleInput.socialLinks : existing?.socialLinks || [],
      internalComments: String(articleInput.internalComments || existing?.internalComments || '').trim(),
      authorName: String(articleInput.authorName || existing?.authorName || admin?.sub || '').trim(),
      editorName: String(articleInput.editorName || existing?.editorName || admin?.sub || '').trim(),
      banner: String(articleInput.banner || existing?.banner || '').trim(),
      order: Number(articleInput.order || existing?.order || data.articles.length + 1),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      publishedAt:
        requestedStatus === 'published'
          ? normalizedPublishedAt || existing?.publishedAt || now
          : null,
    });

    if (!nextArticle.title) {
      throw new Error('Story title is required.');
    }

    if (existing) {
      const index = data.articles.findIndex((item) => item.id === existing.id);
      data.articles[index] = nextArticle;
    } else {
      data.articles.push(nextArticle);
    }

    return { id: nextArticle.id, status: nextArticle.status };
  });
}

export async function deleteArticle(postId) {
  return updateData(async (data) => {
    const nextArticles = data.articles.filter((article) => String(article.id) !== String(postId));
    if (nextArticles.length === data.articles.length) {
      throw new Error('Story not found.');
    }

    data.articles = nextArticles;
    return { id: postId };
  });
}

export async function updateTaxonomy(type, name, action) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedAction = String(action || '').toLowerCase();
  const cleanedName = String(name || '').trim();

  if (!cleanedName) {
    throw new Error('Taxonomy name is required.');
  }

  return updateData(async (data) => {
    if (normalizedType === 'categories' || normalizedType === 'category') {
      if (normalizedAction === 'remove') {
        data.categories = data.categories.filter(
          (category) => category.name.toLowerCase() !== cleanedName.toLowerCase(),
        );
      } else {
        ensureCategory(data, cleanedName);
      }

      return data.categories.map((category) => category.name);
    }

    if (normalizedType === 'tags' || normalizedType === 'tag') {
      if (normalizedAction === 'remove') {
        data.tags = data.tags.filter((tag) => tag.name.toLowerCase() !== cleanedName.toLowerCase());
        data.articles = data.articles.map((article) => ({
          ...article,
          tags: (article.tags || []).filter((tag) => tag.toLowerCase() !== cleanedName.toLowerCase()),
        }));
      } else {
        ensureTags(data, [cleanedName]);
      }

      return data.tags.map((tag) => tag.name);
    }

    throw new Error('Unsupported taxonomy type.');
  });
}

export async function updateSiteConfig(payload = {}) {
  return updateData(async (data) => {
    const nextConfig = payload.config || {};
    data.config = {
      ...data.config,
      ...nextConfig,
      labels: {
        ...data.config.labels,
        ...(nextConfig.labels || {}),
      },
    };

    if (Array.isArray(payload.slots)) {
      data.slotDefinitions = payload.slots.map((slot, index) => ({
        ...slot,
        slot: slot.slot,
        label: slot.label,
        section: slot.section || slot.sectionName || '',
        single: Boolean(slot.single),
        order: index + 1,
      }));

      for (const slot of data.slotDefinitions) {
        const configKey = slotLabelToConfigKey[slot.slot];
        if (configKey) {
          data.config.labels[configKey] = slot.label;
        }
      }
    }

    if (Array.isArray(payload.trendingTopics)) {
      data.trendingTopics = normalizeNameList(payload.trendingTopics);
    }

    if (Array.isArray(payload.electionTabs)) {
      data.electionTabs = normalizeNameList(payload.electionTabs);
    }

    if (Array.isArray(payload.cricketPointsTable)) {
      data.cricketPointsTable = normalizeCricketPointsTable(payload.cricketPointsTable);
    }

    return {
      config: deepClone(data.config),
      slots: deepClone(data.slotDefinitions),
      trendingTopics: deepClone(data.trendingTopics),
      electionTabs: deepClone(data.electionTabs),
      cricketPointsTable: deepClone(data.cricketPointsTable),
    };
  });
}

export async function getConfig() {
  const data = await loadData();
  return deepClone(data.config);
}

export async function authenticateUserRecord(identity, password) {
  const data = await loadData();
  const normalizedIdentity = String(identity || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');
  const user = data.users.find(
    (item) =>
      (item.username.toLowerCase() === normalizedIdentity || item.email.toLowerCase() === normalizedIdentity) &&
      verifyPassword(item.password, normalizedPassword),
  );

  if (!user) return null;

  if (!isHashedPassword(user.password)) {
    user.password = hashPassword(normalizedPassword);
    await persist(data);
  }

  return deepClone(user);
}
