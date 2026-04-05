import { apiUrl } from './api';

const CLIENT_ID_KEY = 'pratham_agenda_client_id';

export function getClientId() {
  const existing = localStorage.getItem(CLIENT_ID_KEY);
  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(CLIENT_ID_KEY, nextId);
  return nextId;
}

export async function fetchFollowedCities() {
  const clientId = getClientId();
  const response = await fetch(apiUrl(`/api/followed-cities?clientId=${encodeURIComponent(clientId)}`));
  if (!response.ok) {
    throw new Error('Could not load followed cities.');
  }

  const data = await response.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function followCityRequest(city) {
  const clientId = getClientId();
  const response = await fetch(apiUrl('/api/followed-cities'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, city }),
  });

  if (!response.ok) {
    throw new Error('Could not follow city.');
  }

  return response.json();
}

export async function unfollowCityRequest(city) {
  const clientId = getClientId();
  const response = await fetch(apiUrl('/api/followed-cities'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, city }),
  });

  if (!response.ok) {
    throw new Error('Could not unfollow city.');
  }

  return response.json();
}
