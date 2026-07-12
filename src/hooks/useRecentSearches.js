import { useState, useCallback } from 'react';

const STORAGE_KEY = 'shieldroute_recent_searches';
const MAX_RECENTS = 8;

/**
 * Reads the stored list from localStorage.
 * Each entry: { id, displayName, name, state, country, typeLabel, typeIcon }
 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // storage quota exceeded — fail silently
  }
}

export function useRecentSearches() {
  const [recents, setRecents] = useState(() => readStorage());

  /** Add a new entry to the top of the list (dedupes by displayName). */
  const addRecent = useCallback((entry) => {
    setRecents(prev => {
      // Remove any existing entry with the same displayName (case-insensitive)
      const filtered = prev.filter(
        r => r.displayName.toLowerCase() !== entry.displayName.toLowerCase()
      );
      // Prepend and cap at MAX_RECENTS
      const next = [entry, ...filtered].slice(0, MAX_RECENTS);
      writeStorage(next);
      return next;
    });
  }, []);

  /** Remove a single entry by id. */
  const removeRecent = useCallback((id) => {
    setRecents(prev => {
      const next = prev.filter(r => r.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  /** Wipe all recents. */
  const clearRecents = useCallback(() => {
    writeStorage([]);
    setRecents([]);
  }, []);

  return { recents, addRecent, removeRecent, clearRecents };
}
