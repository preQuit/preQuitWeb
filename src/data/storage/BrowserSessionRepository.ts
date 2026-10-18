import type { User } from '../../domain/entities/User';
import type {
  SessionRepository,
  SessionWrite,
  StoredSession,
} from '../../domain/repositories/SessionRepository';

const ACCESS_KEY = '@prequit/accessToken';
const REFRESH_KEY = '@prequit/refreshToken';
const USER_KEY = '@prequit/user';

const EMPTY: StoredSession = { accessToken: null, refreshToken: null, user: null };

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const readKey = (key: string): string | null => {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeKey = (key: string, value: string | null): void => {
  const store = storage();
  if (!store) return;
  try {
    if (value === null) store.removeItem(key);
    else store.setItem(key, value);
  } catch {
    return;
  }
};

const parseUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export class BrowserSessionRepository implements SessionRepository {
  private access: string | null = null;
  private refresh: string | null = null;

  accessToken(): string | null {
    if (this.access === null) this.access = readKey(ACCESS_KEY);
    return this.access;
  }

  refreshToken(): string | null {
    if (this.refresh === null) this.refresh = readKey(REFRESH_KEY);
    return this.refresh;
  }

  async read(): Promise<StoredSession> {
    if (!storage()) return EMPTY;
    this.access = readKey(ACCESS_KEY);
    this.refresh = readKey(REFRESH_KEY);
    return {
      accessToken: this.access,
      refreshToken: this.refresh,
      user: parseUser(readKey(USER_KEY)),
    };
  }

  async write(session: SessionWrite): Promise<void> {
    if (session.accessToken !== undefined) {
      this.access = session.accessToken;
      writeKey(ACCESS_KEY, session.accessToken);
    }
    if (session.refreshToken !== undefined) {
      this.refresh = session.refreshToken;
      writeKey(REFRESH_KEY, session.refreshToken);
    }
    if (session.user !== undefined) {
      writeKey(USER_KEY, session.user ? JSON.stringify(session.user) : null);
    }
  }

  async clear(): Promise<void> {
    this.access = null;
    this.refresh = null;
    writeKey(ACCESS_KEY, null);
    writeKey(REFRESH_KEY, null);
    writeKey(USER_KEY, null);
  }
}
