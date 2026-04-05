import pool from './db.js';

function normalizeClientId(value) {
  return String(value || '').trim();
}

function normalizeStoryId(value) {
  return String(value || '').trim();
}

export async function listSavedStoryIds(clientId) {
  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT story_id
     FROM story_saves
     WHERE client_id = ?
     ORDER BY saved_at DESC, id DESC`,
    [normalizedClientId],
  );

  return rows.map((row) => normalizeStoryId(row.story_id)).filter(Boolean);
}

export async function saveStory(clientId, storyId) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedStoryId = normalizeStoryId(storyId);

  if (!normalizedClientId || !normalizedStoryId) {
    throw new Error('clientId and storyId are required.');
  }

  await pool.execute(
    `INSERT INTO story_saves (client_id, story_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE saved_at = CURRENT_TIMESTAMP`,
    [normalizedClientId, normalizedStoryId],
  );

  return {
    clientId: normalizedClientId,
    storyId: normalizedStoryId,
    saved: true,
  };
}

export async function unsaveStory(clientId, storyId) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedStoryId = normalizeStoryId(storyId);

  if (!normalizedClientId || !normalizedStoryId) {
    throw new Error('clientId and storyId are required.');
  }

  await pool.execute(
    `DELETE FROM story_saves
     WHERE client_id = ? AND story_id = ?`,
    [normalizedClientId, normalizedStoryId],
  );

  return {
    clientId: normalizedClientId,
    storyId: normalizedStoryId,
    saved: false,
  };
}
