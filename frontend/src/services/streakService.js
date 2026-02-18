/**
 * streakService.js
 * ----------------
 * Thin API wrapper for streak endpoints.
 * All functions return the parsed JSON body on success, or throw on error.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

/**
 * GET /api/user/streak
 * Fetches the current user's streak from the backend.
 *
 * @param {string} idToken - Firebase ID token for Authorization header.
 * @returns {Promise<{ user_id: string, count: number, last_updated: string|null }>}
 */
export async function fetchStreak(idToken) {
  const res = await fetch(`${API_BASE}/user/streak`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch streak: ${res.status}`);
  }

  return res.json();
}

/**
 * PATCH /api/user/streak
 * Attempts to increment the streak. The backend is idempotent — if it has
 * already been incremented within the last 24 hours, the current count is
 * returned unchanged.
 *
 * @param {string} idToken - Firebase ID token for Authorization header.
 * @returns {Promise<{ user_id: string, count: number, last_updated: string }>}
 */
export async function incrementStreak(idToken) {
  const res = await fetch(`${API_BASE}/user/streak`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to increment streak: ${res.status}`);
  }

  return res.json();
}
