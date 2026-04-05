import pool from './db.js';

function normalizeClientId(value) {
  return String(value || '').trim();
}

function normalizeCity(value) {
  return String(value || '').trim();
}

export async function listFollowedCities(clientId) {
  const normalizedClientId = normalizeClientId(clientId);
  if (!normalizedClientId) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT city_name
     FROM city_follows
     WHERE client_id = ?
     ORDER BY followed_at DESC, id DESC`,
    [normalizedClientId],
  );

  return rows.map((row) => normalizeCity(row.city_name)).filter(Boolean);
}

export async function followCity(clientId, city) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedCity = normalizeCity(city);

  if (!normalizedClientId || !normalizedCity) {
    throw new Error('clientId and city are required.');
  }

  await pool.execute(
    `INSERT INTO city_follows (client_id, city_name)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE followed_at = CURRENT_TIMESTAMP`,
    [normalizedClientId, normalizedCity],
  );

  return {
    clientId: normalizedClientId,
    city: normalizedCity,
    followed: true,
  };
}

export async function unfollowCity(clientId, city) {
  const normalizedClientId = normalizeClientId(clientId);
  const normalizedCity = normalizeCity(city);

  if (!normalizedClientId || !normalizedCity) {
    throw new Error('clientId and city are required.');
  }

  await pool.execute(
    `DELETE FROM city_follows
     WHERE client_id = ? AND LOWER(city_name) = LOWER(?)`,
    [normalizedClientId, normalizedCity],
  );

  return {
    clientId: normalizedClientId,
    city: normalizedCity,
    followed: false,
  };
}
