import { apiUrl } from './api';
import { getClientId } from './cityFollows';

const BOOKMARK_STORAGE_KEY = 'pratham_agenda_saved_stories';
const LIKE_STORAGE_KEY = 'pratham_agenda_liked_stories';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStorageKey(type) {
  return type === 'like' ? LIKE_STORAGE_KEY : BOOKMARK_STORAGE_KEY;
}

function readLocalItems(type, clientId) {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(type));
    const parsed = raw ? JSON.parse(raw) : {};
    const items = Array.isArray(parsed?.[clientId]) ? parsed[clientId] : [];
    return items.map((value) => String(value)).filter(Boolean);
  } catch {
    return [];
  }
}

function writeLocalItems(type, clientId, items) {
  if (!isBrowser()) {
    return;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(type));
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[clientId] = Array.from(new Set(items.map((value) => String(value)).filter(Boolean)));
    window.localStorage.setItem(getStorageKey(type), JSON.stringify(parsed));
  } catch {
    // Ignore storage write failures and keep the UI responsive.
  }
}

function notifyStoryActionUpdate() {
  if (isBrowser()) {
    window.dispatchEvent(new Event('story-actions-updated'));
  }
}

export async function getBookmarkedStoryIds() {
  const clientId = getClientId();
  try {
    const response = await fetch(apiUrl(`/api/saved-stories?clientId=${encodeURIComponent(clientId)}`));
    if (!response.ok) {
      throw new Error('Could not load saved stories.');
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items.map((value) => String(value)) : [];
  } catch {
    return readLocalItems('bookmark', clientId);
  }
}

export async function getLikedStoryIds() {
  const clientId = getClientId();
  try {
    const response = await fetch(apiUrl(`/api/liked-stories?clientId=${encodeURIComponent(clientId)}`));
    if (!response.ok) {
      throw new Error('Could not load liked stories.');
    }

    const data = await response.json();
    return Array.isArray(data.items) ? data.items.map((value) => String(value)) : [];
  } catch {
    return readLocalItems('like', clientId);
  }
}

export async function toggleBookmarkedStory(storyId, isActive) {
  const clientId = getClientId();
  const normalizedStoryId = String(storyId || '').trim();
  const method = isActive ? 'DELETE' : 'POST';

  try {
    const response = await fetch(apiUrl('/api/saved-stories'), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, storyId: normalizedStoryId }),
    });

    if (!response.ok) {
      throw new Error('Could not update saved story.');
    }

    const data = await response.json();
    notifyStoryActionUpdate();
    return Boolean(data.saved);
  } catch {
    const currentItems = readLocalItems('bookmark', clientId);
    const nextItems = isActive
      ? currentItems.filter((item) => item !== normalizedStoryId)
      : [...currentItems, normalizedStoryId];
    writeLocalItems('bookmark', clientId, nextItems);
    notifyStoryActionUpdate();
    return !isActive;
  }
}

export async function toggleLikedStory(storyId, isActive) {
  const clientId = getClientId();
  const normalizedStoryId = String(storyId || '').trim();
  const method = isActive ? 'DELETE' : 'POST';

  try {
    const response = await fetch(apiUrl('/api/liked-stories'), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, storyId: normalizedStoryId }),
    });

    if (!response.ok) {
      throw new Error('Could not update liked story.');
    }

    const data = await response.json();
    notifyStoryActionUpdate();
    return Boolean(data.liked);
  } catch {
    const currentItems = readLocalItems('like', clientId);
    const nextItems = isActive
      ? currentItems.filter((item) => item !== normalizedStoryId)
      : [...currentItems, normalizedStoryId];
    writeLocalItems('like', clientId, nextItems);
    notifyStoryActionUpdate();
    return !isActive;
  }
}
