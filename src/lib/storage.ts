// localStorage can throw (Safari private mode, storage disabled, quota):
// every access goes through these guards so the app never crashes on it.

export function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function readRawStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the value simply is not persisted.
  }
}

export function removeStorage(...keys: string[]) {
  try {
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
