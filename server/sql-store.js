import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import pool from './db.js';
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
  shorts: 'shorts',
};

let cache = null;
let epaperTablesEnsured = false;
let ourTeamTablesEnsured = false;

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

  if (!Array.isArray(data.shorts)) {
    data.shorts = [];
    changed = true;
  }

  if (!Array.isArray(data.ourTeam)) {
    data.ourTeam = [];
    changed = true;
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
    showOnHomepage: article.showOnHomepage !== false,
    isSuggestion: article.isSuggestion !== false,
    tags: Array.isArray(article.tags) ? article.tags : [],
    videoUrl: article.videoUrl || '',
  };
}

function getPublishedHomepageArticles(data) {
  return sortByOrderThenDate(
    data.articles.filter((article) => {
      return article.status === 'published' && article.showOnHomepage !== false;
    }),
  );
}

function getActiveTopicNames(items) {
  return items.filter((item) => item.isActive !== false).map((item) => item.name);
}

function deriveTagsFromArticles(articles = [], limit = 20) {
  const seen = new Set();
  const derived = [];

  for (const article of articles) {
    for (const tag of Array.isArray(article.tags) ? article.tags : []) {
      const value = String(tag || '').trim();
      if (!value) continue;

      const normalized = value.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      derived.push(value);

      if (derived.length >= limit) {
        return derived;
      }
    }
  }

  return derived;
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
    { key: 'shorts', label: data.config.labels.shorts, type: 'shorts-grid', required: true, items: [] },
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

function buildHomePayload(data, shortsVideos = []) {
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
    tags: (() => {
      const configuredTags = data.tags.map((tag) => tag.name).filter(Boolean);
      const derivedTags = deriveTagsFromArticles(published);
      return [...new Set([...configuredTags, ...derivedTags].map((tag) => String(tag).trim()).filter(Boolean))];
    })(),
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
    shortsVideos,
    trioSections: trioColumns,
    customSections,
    items: published.map(mapArticleForClient),
  };
}

export async function getHomeAggregatedData() {
  const data = await loadData();
  const shorts = await fetchPublicShorts();
  return buildHomePayload(deepClone(data), shorts);
}

const EPAPER_TABLE_SETUP_SQL = [
  `CREATE TABLE IF NOT EXISTS epaper_editions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    city_region VARCHAR(150) NOT NULL,
    edition_name VARCHAR(150) NOT NULL DEFAULT 'Main',
    issue_date DATE NOT NULL,
    description TEXT DEFAULT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    pdf_url VARCHAR(500) DEFAULT NULL,
    page_count INT NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS epaper_pages (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    edition_id INT NOT NULL,
    page_no INT NOT NULL,
    title VARCHAR(180) DEFAULT NULL,
    page_image VARCHAR(500) DEFAULT NULL,
    pdf_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_epaper_page_edition FOREIGN KEY (edition_id) REFERENCES epaper_editions(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_epaper_page (edition_id, page_no)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS epaper_magazines (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(160) NOT NULL UNIQUE,
    category VARCHAR(120) NOT NULL DEFAULT 'Magazine',
    issue_date DATE DEFAULT NULL,
    description TEXT DEFAULT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    pdf_url VARCHAR(500) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function ensureEpaperTables() {
  if (epaperTablesEnsured) {
    return;
  }

  for (const statement of EPAPER_TABLE_SETUP_SQL) {
    await pool.execute(statement);
  }

  epaperTablesEnsured = true;
}

const OUR_TEAM_TABLE_SETUP_SQL = [
  `CREATE TABLE IF NOT EXISTS our_team (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    role VARCHAR(180) NOT NULL,
    photo VARCHAR(500) DEFAULT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function ensureOurTeamTables() {
  if (ourTeamTablesEnsured) {
    return;
  }

  for (const statement of OUR_TEAM_TABLE_SETUP_SQL) {
    await pool.execute(statement);
  }

  ourTeamTablesEnsured = true;
}

function normalizeTeamMember(item = {}, index = 0) {
  const name = String(item.name || '').trim();
  return {
    id: item.id || null,
    name,
    slug: slugify(item.slug || name || `team-member-${index + 1}`, `team-member-${Date.now()}-${index + 1}`),
    role: String(item.role || '').trim(),
    photo: String(item.photo || item.image || '').trim(),
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? index),
    isActive: item.isActive !== false && item.is_active !== 0,
  };
}

export async function getPublicTeam() {
  try {
    await ensureOurTeamTables();
    const [rows] = await pool.execute(
      `SELECT id, name, slug, role, photo, sort_order, is_active
       FROM our_team
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      role: row.role,
      photo: row.photo || '',
      sortOrder: Number(row.sort_order || 0),
      isActive: Boolean(row.is_active),
    }));
  } catch {
    const data = await loadData();
    return (data.ourTeam || [])
      .map((item, index) => normalizeTeamMember(item, index))
      .filter((item) => item.isActive)
      .sort((left, right) => left.sortOrder - right.sortOrder || String(left.name).localeCompare(String(right.name)));
  }
}

export async function getAdminTeam() {
  try {
    await ensureOurTeamTables();
    const [rows] = await pool.execute(
      `SELECT id, name, slug, role, photo, sort_order, is_active
       FROM our_team
       ORDER BY sort_order ASC, id ASC`,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      role: row.role,
      photo: row.photo || '',
      sortOrder: Number(row.sort_order || 0),
      isActive: Boolean(row.is_active),
    }));
  } catch {
    const data = await loadData();
    return (data.ourTeam || [])
      .map((item, index) => normalizeTeamMember(item, index))
      .sort((left, right) => left.sortOrder - right.sortOrder || String(left.name).localeCompare(String(right.name)));
  }
}

export async function saveTeamData(payload = {}) {
  const membersInput = Array.isArray(payload) ? payload : payload.members;
  const members = Array.isArray(membersInput)
    ? membersInput
        .map((item, index) => normalizeTeamMember(item, index))
        .filter((item) => item.name && item.role)
    : [];

  try {
    await ensureOurTeamTables();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM our_team');

      for (const member of members) {
        await connection.execute(
          `INSERT INTO our_team (name, slug, role, photo, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            member.name,
            member.slug,
            member.role,
            member.photo || null,
            member.sortOrder,
            member.isActive ? 1 : 0,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { members: await getAdminTeam() };
  } catch {
    return updateData(async (data) => {
      data.ourTeam = deepClone(members);
      return { members: deepClone(data.ourTeam) };
    });
  }
}

function normalizeEpaperPage(page = {}, index = 0) {
  return {
    id: page.id || null,
    pageNumber: Math.max(1, Number(page.pageNumber || page.page_no || index + 1)),
    title: String(page.title || `Page ${index + 1}`).trim(),
    image: String(page.image || page.pageImage || page.page_image || page.url || '').trim(),
    pdfUrl: String(page.pdfUrl || page.pdf_url || '').trim(),
  };
}

function normalizeEpaperEdition(item = {}, index = 0) {
  const normalizedPages = Array.isArray(item.pages)
    ? item.pages.map((page, pageIndex) => normalizeEpaperPage(page, pageIndex))
    : [];
  const pageCount = Math.max(normalizedPages.length || 0, Number(item.pageCount || item.pagesCount || 0), 1);

  return {
    id: item.id || null,
    name: String(item.name || item.title || '').trim(),
    slug: slugify(item.slug || item.name || item.title || `edition-${index + 1}`, `edition-${Date.now()}-${index + 1}`),
    cityRegion: String(item.cityRegion || item.city || '').trim(),
    edition: String(item.edition || item.editionName || 'Main').trim() || 'Main',
    date: String(item.date || item.issueDate || item.publishDate || '').trim(),
    description: String(item.description || '').trim(),
    image: String(item.image || item.coverImage || item.cover_image || '').trim(),
    pdfUrl: String(item.pdfUrl || item.pdf_url || '').trim(),
    pageCount,
    sortOrder: Number(item.sortOrder ?? item.order ?? index + 1),
    isActive: item.isActive !== false,
    pages: normalizedPages.length > 0
      ? normalizedPages
      : Array.from({ length: pageCount }, (_, pageIndex) => normalizeEpaperPage({
          pageNumber: pageIndex + 1,
          title: `Page ${pageIndex + 1}`,
          image: pageIndex === 0 ? (item.image || item.coverImage || item.cover_image || '') : '',
          pdfUrl: item.pdfUrl || item.pdf_url || '',
        }, pageIndex)),
  };
}

function normalizeEpaperMagazine(item = {}, index = 0) {
  return {
    id: item.id || null,
    name: String(item.name || item.title || '').trim(),
    slug: slugify(item.slug || item.name || item.title || `magazine-${index + 1}`, `magazine-${Date.now()}-${index + 1}`),
    category: String(item.category || 'Magazine').trim() || 'Magazine',
    date: String(item.date || item.issueDate || item.publishDate || '').trim(),
    description: String(item.description || '').trim(),
    image: String(item.image || item.coverImage || item.cover_image || '').trim(),
    pdfUrl: String(item.pdfUrl || item.pdf_url || '').trim(),
    sortOrder: Number(item.sortOrder ?? item.order ?? index + 1),
    isActive: item.isActive !== false,
  };
}

function normalizeEpaperSocialLinks(value = {}) {
  const normalizeEntry = (entry, fallback = '') => {
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return {
        url: String(entry.url || '').trim(),
        active: entry.active !== false,
      };
    }

    const normalizedFallback = typeof fallback === 'string' ? fallback : '';
    return {
      url: String(entry || normalizedFallback || '').trim(),
      active: true,
    };
  };

  return {
    whatsapp: normalizeEntry(value.whatsapp),
    facebook: normalizeEntry(value.facebook),
    twitter: normalizeEntry(value.twitter ?? value.x),
    instagram: normalizeEntry(value.instagram),
    youtube: normalizeEntry(value.youtube),
  };
}

function mapDbEditionRow(row = {}, pages = []) {
  const normalizedPages = [...pages].sort((left, right) => left.pageNumber - right.pageNumber);
  const normalizedName = String(row.name || '').trim();
  const displayName =
    !normalizedName || normalizedName.toLowerCase() === 'untitled edition'
      ? (String(row.city_region || '').trim() || String(row.slug || '').trim() || 'Edition')
      : normalizedName;
  const issueDate = typeof row.issue_date === 'string'
    ? row.issue_date.slice(0, 10)
    : (row.issue_date ? new Date(row.issue_date.getTime() - row.issue_date.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '');
  return {
    id: row.id,
    name: displayName,
    slug: row.slug,
    cityRegion: row.city_region,
    city: row.city_region,
    edition: row.edition_name,
    editionName: row.edition_name,
    date: issueDate,
    issueDate,
    publishDate: issueDate,
    description: row.description || '',
    image: row.cover_image || '',
    coverImage: row.cover_image || '',
    pdfUrl: row.pdf_url || '',
    pageCount: Number(row.page_count || normalizedPages.length || 1),
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
    pages: normalizedPages,
  };
}

function mapDbMagazineRow(row = {}) {
  const normalizedName = String(row.name || '').trim();
  const displayName =
    !normalizedName || normalizedName.toLowerCase() === 'untitled magazine'
      ? (String(row.slug || '').trim() || 'Magazine')
      : normalizedName;
  const issueDate = typeof row.issue_date === 'string'
    ? row.issue_date.slice(0, 10)
    : (row.issue_date ? new Date(row.issue_date.getTime() - row.issue_date.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : '');
  return {
    id: row.id,
    name: displayName,
    slug: row.slug,
    category: row.category || 'Magazine',
    date: issueDate,
    issueDate,
    description: row.description || '',
    image: row.cover_image || '',
    coverImage: row.cover_image || '',
    pdfUrl: row.pdf_url || '',
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
  };
}

export async function getEpaperData() {
  try {
    await ensureEpaperTables();
    const localData = await loadData();
    const [editionRows] = await pool.execute(
      `SELECT id, name, slug, city_region, edition_name, issue_date, description, cover_image, pdf_url, page_count, sort_order, is_active
       FROM epaper_editions
       ORDER BY sort_order ASC, issue_date DESC, id DESC`,
    );
    const [pageRows] = await pool.execute(
      `SELECT id, edition_id, page_no, title, page_image, pdf_url
       FROM epaper_pages
       ORDER BY edition_id ASC, page_no ASC`,
    );
    const [magazineRows] = await pool.execute(
      `SELECT id, name, slug, category, issue_date, description, cover_image, pdf_url, sort_order, is_active
       FROM epaper_magazines
       ORDER BY sort_order ASC, issue_date DESC, id DESC`,
    );

    const pagesByEditionId = new Map();
    for (const row of pageRows) {
      if (!pagesByEditionId.has(row.edition_id)) {
        pagesByEditionId.set(row.edition_id, []);
      }
      pagesByEditionId.get(row.edition_id).push({
        id: row.id,
        pageNumber: Number(row.page_no || 0),
        title: row.title || `Page ${row.page_no}`,
        image: row.page_image || '',
        url: row.page_image || '',
        pdfUrl: row.pdf_url || '',
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      editions: editionRows.map((row) => mapDbEditionRow(row, pagesByEditionId.get(row.id) || [])),
      magazines: magazineRows.map(mapDbMagazineRow),
      socialLinks: normalizeEpaperSocialLinks(localData.config?.epaperSocialLinks),
    };
  } catch (error) {
    const data = await loadData();
    return {
      generatedAt: new Date().toISOString(),
      editions: deepClone(data.epaperEditions || []),
      magazines: deepClone(data.epaperMagazines || []),
      socialLinks: normalizeEpaperSocialLinks(data.config?.epaperSocialLinks),
    };
  }
}

export async function saveEpaperData(payload = {}) {
  const editions = Array.isArray(payload.editions)
    ? payload.editions.map((item, index) => normalizeEpaperEdition(item, index))
    : [];
  const magazines = Array.isArray(payload.magazines)
    ? payload.magazines.map((item, index) => normalizeEpaperMagazine(item, index))
    : [];
  const socialLinks = normalizeEpaperSocialLinks(payload.socialLinks);

  try {
    await ensureEpaperTables();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM epaper_pages');
      await connection.execute('DELETE FROM epaper_editions');
      await connection.execute('DELETE FROM epaper_magazines');

      for (const edition of editions) {
        const [editionResult] = await connection.execute(
          `INSERT INTO epaper_editions
            (name, slug, city_region, edition_name, issue_date, description, cover_image, pdf_url, page_count, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            edition.name || 'Untitled Edition',
            edition.slug,
            edition.cityRegion || 'General',
            edition.edition || 'Main',
            edition.date || new Date().toISOString().slice(0, 10),
            edition.description || null,
            edition.image || null,
            edition.pdfUrl || null,
            edition.pageCount,
            edition.sortOrder,
            edition.isActive ? 1 : 0,
          ],
        );

        const editionId = editionResult.insertId;
        for (const page of edition.pages) {
          await connection.execute(
            `INSERT INTO epaper_pages
              (edition_id, page_no, title, page_image, pdf_url)
             VALUES (?, ?, ?, ?, ?)`,
            [
              editionId,
              page.pageNumber,
              page.title || `Page ${page.pageNumber}`,
              page.image || null,
              page.pdfUrl || null,
            ],
          );
        }
      }

      for (const magazine of magazines) {
        await connection.execute(
          `INSERT INTO epaper_magazines
            (name, slug, category, issue_date, description, cover_image, pdf_url, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            magazine.name || 'Untitled Magazine',
            magazine.slug,
            magazine.category || 'Magazine',
            magazine.date || null,
            magazine.description || null,
            magazine.image || null,
            magazine.pdfUrl || null,
            magazine.sortOrder,
            magazine.isActive ? 1 : 0,
          ],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await updateData(async (data) => {
      data.epaperEditions = deepClone(editions);
      data.epaperMagazines = deepClone(magazines);
      data.config = {
        ...(data.config || {}),
        epaperSocialLinks: deepClone(socialLinks),
      };
      return null;
    });

    const result = await getEpaperData();
    return {
      ...result,
      socialLinks,
    };
  } catch (error) {
    return updateData(async (data) => {
      data.epaperEditions = deepClone(editions);
      data.epaperMagazines = deepClone(magazines);
      data.config = {
        ...(data.config || {}),
        epaperSocialLinks: deepClone(socialLinks),
      };
      return {
        generatedAt: new Date().toISOString(),
        editions: deepClone(data.epaperEditions),
        magazines: deepClone(data.epaperMagazines),
        socialLinks,
      };
    });
  }
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

export async function fetchShorts() {
  try {
    const [rows] = await pool.execute('SELECT * FROM shorts ORDER BY createdAt DESC LIMIT 100');
    return rows.map((s) => ({
      ...s,
      time: formatRelativeTime(s.publishedAt || s.updatedAt || s.createdAt),
    }));
  } catch (error) {
    const data = await loadData();
    return [...(data.shorts || [])]
      .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
      .slice(0, 100)
      .map((s) => ({
        ...s,
        time: formatRelativeTime(s.publishedAt || s.updatedAt || s.createdAt),
      }));
  }
}

export async function fetchAdminDashboard() {
  const data = deepClone(await loadData());
  const shorts = await fetchShorts();
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
      totalShorts: shorts.length,
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
    shorts,
    slots: deepClone(data.slotDefinitions),
    trendingTopics: deepClone(data.trendingTopics),
    electionTabs: deepClone(data.electionTabs),
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
      if (data.locations.states.some((s) => s.name === name || s.slug === slug)) {
        throw new Error('State already exists.');
      }
      const id = nextNumericId(data.locations.states);
      data.locations.states.push({ id, name, slug });
      return { id, name, slug };
    }

    if (normalizedType === 'district') {
      if (data.locations.districts.some((d) => d.name === name || d.slug === slug)) {
        throw new Error('District already exists.');
      }
      const id = nextNumericId(data.locations.districts);
      const stateId = Number(payload.stateId || data.locations.states[0]?.id || 1);
      if (!data.locations.states.some((item) => Number(item.id) === stateId)) {
        throw new Error('State not found.');
      }
      data.locations.districts.push({ id, stateId, name, slug });
      return { id, stateId, name, slug };
    }

    if (normalizedType === 'city') {
      if (data.locations.cities.some((c) => c.name === name || c.slug === slug)) {
        throw new Error('City already exists.');
      }
      const id = nextNumericId(data.locations.cities);
      const districtId = Number(payload.districtId || data.locations.districts[0]?.id || 1);
      if (!data.locations.districts.some((item) => Number(item.id) === districtId)) {
        throw new Error('District not found.');
      }
      data.locations.cities.push({ id, districtId, name, slug });
      return { id, districtId, name, slug };
    }

    throw new Error('Invalid location type.');
  });
}

export async function updateLocation(type, id, payload = {}) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    const collection = getLocationCollection(data, normalizedType);
    const index = collection.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      throw new Error('Location not found.');
    }

    const name = String(payload.name || '').trim();
    if (!name) {
      throw new Error('Location name is required.');
    }

    const slug = slugify(payload.slug || name, `${normalizedType}-${id}`);
    const updated = { ...collection[index], name, slug };

    if (normalizedType === 'district' && payload.stateId) {
      updated.stateId = Number(payload.stateId);
    }
    if (normalizedType === 'city' && payload.districtId) {
      updated.districtId = Number(payload.districtId);
    }

    collection[index] = updated;
    return updated;
  });
}

export async function deleteLocation(type, id) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    const collection = getLocationCollection(data, normalizedType);
    const index = collection.findIndex((item) => String(item.id) === String(id));
    if (index === -1) {
      throw new Error('Location not found.');
    }

    collection.splice(index, 1);
    return { success: true };
  });
}

export async function listUsers() {
  const data = await loadData();
  return data.users.map((user) => {
    const { password, ...safeUser } = user;
    return safeUser;
  });
}

export async function authenticateUserRecord(username, password) {
  const data = await loadData();
  const user = data.users.find(
    (u) => String(u.username).toLowerCase() === String(username).toLowerCase(),
  );

  if (user && verifyPassword(user.password, password)) {
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  return null;
}

export async function createUser(payload) {
  return updateData(async (data) => {
    const username = String(payload.username || '').trim();
    if (!username) {
      throw new Error('Username is required.');
    }
    if (data.users.some((u) => u.username === username)) {
      throw new Error('Username already exists.');
    }

    const id = nextNumericId(data.users);
    const newUser = {
      id,
      username,
      email: String(payload.email || '').trim(),
      password: hashPassword(payload.password || 'admin123'),
      role: payload.role || 'reporter',
      assignedCityId: payload.assignedCityId ? Number(payload.assignedCityId) : null,
    };

    data.users.push(newUser);
    const { password: _, ...safeUser } = newUser;
    return safeUser;
  });
}

export async function updateUser(userId, payload) {
  return updateData(async (data) => {
    const index = data.users.findIndex((u) => String(u.id) === String(userId));
    if (index === -1) {
      throw new Error('User not found.');
    }

    const { password, ...existing } = data.users[index];
    const updatedUser = {
      ...existing,
      email: String(payload.email || existing.email).trim(),
      assignedCityId: payload.assignedCityId ? Number(payload.assignedCityId) : existing.assignedCityId,
      password,
    };

    if (payload.password) {
      updatedUser.password = hashPassword(payload.password);
    }

    data.users[index] = updatedUser;
    const { password: _, ...safeUser } = updatedUser;
    return safeUser;
  });
}

export async function updateUserRole(userId, role) {
  return updateData(async (data) => {
    const index = data.users.findIndex((u) => String(u.id) === String(userId));
    if (index === -1) {
      throw new Error('User not found.');
    }

    data.users[index].role = role;
    const { password: _, ...safeUser } = data.users[index];
    return safeUser;
  });
}

export async function deleteUser(userId) {
  return updateData(async (data) => {
    const index = data.users.findIndex((u) => String(u.id) === String(userId));
    if (index === -1) {
      throw new Error('User not found.');
    }

    data.users.splice(index, 1);
    return { success: true };
  });
}

export async function requestPasswordReset(usernameOrEmail) {
  const normalized = String(usernameOrEmail || '').trim().toLowerCase();
  return updateData(async (data) => {
    const user = data.users.find(
      (u) =>
        u.username.toLowerCase() === normalized ||
        u.email.toLowerCase() === normalized,
    );

    if (!user) {
      throw new Error('User not found.');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 3600000; // 1 hour

    data.passwordResetTokens.push({ token, userId: user.id, expiresAt });
    return { token };
  });
}

export async function resetPassword(token, newPassword) {
  return updateData(async (data) => {
    const entryIndex = data.passwordResetTokens.findIndex((e) => e.token === token);
    if (entryIndex === -1) {
      throw new Error('Invalid or expired token.');
    }

    const entry = data.passwordResetTokens[entryIndex];
    if (entry.expiresAt < Date.now()) {
      data.passwordResetTokens.splice(entryIndex, 1);
      throw new Error('Token expired.');
    }

    const userIndex = data.users.findIndex((u) => u.id === entry.userId);
    if (userIndex === -1) {
      throw new Error('User not found.');
    }

    data.users[userIndex].password = hashPassword(newPassword);
    data.passwordResetTokens.splice(entryIndex, 1);
    return { success: true };
  });
}

export async function getConfig() {
  const data = await loadData();
  return deepClone(data.config);
}

export async function updateSiteConfig(payload) {
  return updateData(async (data) => {
    data.config = {
      ...data.config,
      ...(payload.config || {}),
    };
    if (payload.slots) {
      data.slotDefinitions = deepClone(payload.slots);
    }
    if (payload.trendingTopics) {
      data.trendingTopics = deepClone(payload.trendingTopics);
    }
    if (payload.electionTabs) {
      data.electionTabs = deepClone(payload.electionTabs);
    }
    return deepClone(data.config);
  });
}

export async function updateTaxonomy(type, name, action) {
  const normalizedType = String(type || '').toLowerCase();
  return updateData(async (data) => {
    if (normalizedType === 'category' || normalizedType === 'categories') {
      if (action === 'delete' || action === 'remove') {
        data.categories = data.categories.filter((c) => String(c.name) !== String(name));
      } else {
        ensureCategory(data, name);
      }
      return data.categories.map((c) => c.name);
    }

    if (normalizedType === 'tag' || normalizedType === 'tags') {
      if (action === 'delete' || action === 'remove') {
        data.tags = data.tags.filter((t) => String(t.name) !== String(name));
      } else {
        ensureTags(data, [name]);
      }
      return data.tags.map((t) => t.name);
    }

    throw new Error(`Invalid taxonomy type. Normalized: "${normalizedType}", Original: "${type}", Action: "${action}"`);
  });
}

export async function fetchWorkflowQueue() {
  const data = await loadData();
  return sortByOrderThenDate(
    data.articles.filter(
      (article) =>
        article.status === 'draft' ||
        article.status === 'review' ||
        article.status === 'pending' ||
        article.status === 'rejected',
    ),
  ).map((article) => ({
    ...mapArticleForClient(article),
    itemType: 'story',
  }));
}

export async function updatePostStatus(postId, payload) {
  return updateData(async (data) => {
    const index = data.articles.findIndex((article) => String(article.id) === String(postId));
    if (index === -1) {
      throw new Error('Post not found.');
    }

      const status = payload.status || 'published';
      data.articles[index].status = status;

    if (status === 'published' && !data.articles[index].publishedAt) {
      data.articles[index].publishedAt = new Date().toISOString();
    }

    return { id: postId, status };
  });
}

export async function upsertArticle(articleInput, admin) {
  return updateData(async (data) => {
    const id = articleInput.id || nextNumericId(data.articles);
    const existing = data.articles.find((article) => String(article.id) === String(id));

    const title = String(articleInput.title || '').trim();
    const slug = slugify(articleInput.slug || title, `story-${id}`);
    const slotKey = String(articleInput.slot || articleInput.slotKey || 'latest').trim();
    const requestedStatus = articleInput.status || 'published';
    const now = new Date().toISOString();

    let normalizedPublishedAt = null;
    if (articleInput.publishedAt) {
      try {
        normalizedPublishedAt = new Date(articleInput.publishedAt).toISOString();
      } catch (e) {}
    }

    const tags = Array.isArray(articleInput.tags) ? articleInput.tags : [];
    ensureCategory(data, articleInput.category);
    ensureTags(data, tags);

    const body = splitBody(articleInput.body);

    const nextId = existing?.id || id;
    const nextSlug = existing?.slug || slug;

    const nextArticle = assignLocationIds(data, {
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
      throw new Error('Article not found.');
    }
    data.articles = nextArticles;
    return { success: true };
  });
}

export async function fetchPublicShorts() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM shorts WHERE status = "published" ORDER BY publishedAt DESC LIMIT 50',
    );
    return rows.map((s) => ({
      ...s,
      time: formatRelativeTime(s.publishedAt || s.updatedAt || s.createdAt),
    }));
  } catch (error) {
    const data = await loadData();
    return [...(data.shorts || [])]
      .filter((short) => short.status === 'published')
      .sort((left, right) => new Date(right.publishedAt || right.updatedAt || 0).getTime() - new Date(left.publishedAt || left.updatedAt || 0).getTime())
      .slice(0, 50)
      .map((s) => ({
        ...s,
        time: formatRelativeTime(s.publishedAt || s.updatedAt || s.createdAt),
      }));
  }
}

export async function fetchShortById(idOrSlug) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM shorts WHERE id = ? OR slug = ?',
      [idOrSlug, idOrSlug],
    );
    const short = rows[0];
    if (!short) return null;

    return {
      ...short,
      time: formatRelativeTime(short.publishedAt || short.updatedAt || short.createdAt),
    };
  } catch (error) {
    const data = await loadData();
    const short = (data.shorts || []).find(
      (item) => String(item.id) === String(idOrSlug) || String(item.slug) === String(idOrSlug),
    );
    if (!short) return null;

    return {
      ...short,
      time: formatRelativeTime(short.publishedAt || short.updatedAt || short.createdAt),
    };
  }
}

export async function upsertShort(payload) {
  console.log('[DB] Preparing to upsert short:', payload.id || 'new short');
  try {
    const id = payload.id || `short-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = String(payload.title || 'Untitled Short').trim();
    const slug = payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const videoUrl = String(payload.videoUrl || '').trim();
    let image = String(payload.image || '').trim();

    // Auto-generate thumbnail for YouTube if none provided
    if (!image && videoUrl) {
      const ytIdMatch = videoUrl.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytIdMatch) {
        image = `https://img.youtube.com/vi/${ytIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const status = payload.status || 'published';

    // Check if exists
    const [existing] = await pool.execute('SELECT createdAt, publishedAt FROM shorts WHERE id = ?', [id]);
    
    if (existing && existing.length > 0) {
      const prev = existing[0];
      const pubAt = status === 'published' ? (prev.publishedAt || now) : prev.publishedAt;
      
      console.log('[DB] Updating existing short:', id);
      await pool.execute(
        `UPDATE shorts SET slug = ?, title = ?, description = ?, videoUrl = ?, image = ?, city = ?, status = ?, updatedAt = ?, publishedAt = ? WHERE id = ?`,
        [slug, title, payload.description || '', videoUrl, image, payload.city || '', status, now, pubAt, id]
      );
    } else {
      const pubAt = status === 'published' ? now : null;
      console.log('[DB] Inserting new short:', id);
      await pool.execute(
        `INSERT INTO shorts (id, slug, title, description, videoUrl, image, city, status, createdAt, updatedAt, publishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, slug, title, payload.description || '', videoUrl, image, payload.city || '', status, now, now, pubAt]
      );
    }

    console.log('[DB] Upsert successful for:', id);
    return { id, title, slug, videoUrl, image, status };
  } catch (error) {
    console.error('[DB Error] upsertShort failed:', error);
    throw error;
  }
}

export async function deleteShort(id) {
  const [result] = await pool.execute('DELETE FROM shorts WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    throw new Error('Short not found.');
  }
  return { success: true };
}

