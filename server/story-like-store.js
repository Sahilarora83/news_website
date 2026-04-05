import pool from './db.js';

function normalizeClientId(value) {
  return String(value || '').trim();
}

function normalizeStoryId(value) {
  return String(value || '').trim();
}

export async function listLikedStoryIds(clientId) {
  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT story_id
     FROM story_likes
     WHERE client_id = ?
     ORDER BY liked_at DESC, id DESC`,
    [normalizedClientId],
  );

  return rows.map((row) => normalizeStoryId(row.story_id)).filter(Boolean);
}

export async function likeStory(clientId, storyId) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedStoryId = normalizeStoryId(storyId);

  if (!normalizedClientId || !normalizedStoryId) {
    throw new Error('clientId and storyId are required.');
  }

  await pool.execute(
    `INSERT INTO story_likes (client_id, story_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE liked_at = CURRENT_TIMESTAMP`,
    [normalizedClientId, normalizedStoryId],
  );

  return {
    clientId: normalizedClientId,
    storyId: normalizedStoryId,
    liked: true,
  };
}

export async function unlikeStory(clientId, storyId) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedStoryId = normalizeStoryId(storyId);

  if (!normalizedClientId || !normalizedStoryId) {
    throw new Error('clientId and storyId are required.');
  }

  await pool.execute(
    `DELETE FROM story_likes
     WHERE client_id = ? AND story_id = ?`,
    [normalizedClientId, normalizedStoryId],
  );

  return {
    clientId: normalizedClientId,
    storyId: normalizedStoryId,
    liked: false,
  };
}
