const DEVICE_KEY = '@prequit/deviceId';

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const mint = (): string => {
  try {
    return window.crypto.randomUUID();
  } catch {
    return `d-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  }
};

// Identity is per browser profile, not per person: a cleared store simply mints
// a new device and starts that device's daily allowance over.
export const deviceId = (): string | null => {
  const store = storage();
  if (!store) return null;
  try {
    const existing = store.getItem(DEVICE_KEY);
    if (existing) return existing;
    const minted = mint();
    store.setItem(DEVICE_KEY, minted);
    return minted;
  } catch {
    return null;
  }
};

export const todayKey = (): string => {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};
