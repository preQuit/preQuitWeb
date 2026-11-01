import { io, type Socket } from 'socket.io-client';

import type { SessionRepository } from '../../domain/repositories/SessionRepository';
import type {
  RealtimeClient,
  RealtimeConnectionStatus,
  RealtimeEventMap,
  RealtimeUnsubscribe,
} from './RealtimeClient';

const RECONNECTION_DELAY_MS = 1_000;
const RECONNECTION_DELAY_MAX_MS = 10_000;
// No push channel exists for "the access token just rotated"; AxiosHttpClient owns that
// refresh and isn't ours to instrument, so this is a cheap net that catches it within
// one interval instead of leaving a dead connection re-authenticating with a stale token.
const TOKEN_WATCH_MS = 15_000;

const REALTIME_EVENTS = ['message:new', 'message:read', 'notification:new'] as const;

export interface SocketIoRealtimeClientOptions {
  readonly url: string;
  readonly session: SessionRepository;
}

export class SocketIoRealtimeClient implements RealtimeClient {
  private socket: Socket | null = null;
  private refCount = 0;
  private activeConversationId: string | null = null;
  private readonly joinedRooms = new Set<string>();
  private statusValue: RealtimeConnectionStatus = 'idle';
  private readonly statusListeners = new Set<(status: RealtimeConnectionStatus) => void>();
  private readonly eventListeners = new Map<string, Set<(payload: unknown) => void>>();
  private tokenWatcher: ReturnType<typeof setInterval> | null = null;
  private lastKnownToken: string | null = null;
  private boundOnVisible: (() => void) | null = null;
  private boundOnOnline: (() => void) | null = null;
  private boundOnOffline: (() => void) | null = null;

  constructor(private readonly options: SocketIoRealtimeClientOptions) {}

  connect(): void {
    this.refCount += 1;
    if (this.socket) return;

    this.setStatus('connecting');
    this.lastKnownToken = this.options.session.accessToken();

    const socket = io(this.options.url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: RECONNECTION_DELAY_MS,
      reconnectionDelayMax: RECONNECTION_DELAY_MAX_MS,
      auth: callback => callback({ token: this.options.session.accessToken() ?? '' }),
    });
    this.socket = socket;
    this.wireSocketEvents(socket);
    this.startTokenWatcher();
    this.attachBrowserListeners();
  }

  disconnect(): void {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) this.teardown();
  }

  forceDisconnect(): void {
    this.refCount = 0;
    this.teardown();
  }

  joinConversation(conversationId: string): void {
    this.joinedRooms.add(conversationId);
    this.socket?.emit('conversation:join', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.joinedRooms.delete(conversationId);
    this.socket?.emit('conversation:leave', conversationId);
  }

  setActiveConversation(conversationId: string | null): void {
    this.activeConversationId = conversationId;
  }

  getActiveConversation(): string | null {
    return this.activeConversationId;
  }

  status(): RealtimeConnectionStatus {
    return this.statusValue;
  }

  onStatusChange(listener: (status: RealtimeConnectionStatus) => void): RealtimeUnsubscribe {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  on<K extends keyof RealtimeEventMap>(
    event: K,
    listener: (payload: RealtimeEventMap[K]) => void,
  ): RealtimeUnsubscribe {
    const set = this.eventListeners.get(event) ?? new Set<(payload: unknown) => void>();
    set.add(listener as (payload: unknown) => void);
    this.eventListeners.set(event, set);
    return () => {
      set.delete(listener as (payload: unknown) => void);
    };
  }

  private teardown(): void {
    this.stopTokenWatcher();
    this.detachBrowserListeners();
    this.joinedRooms.clear();
    this.activeConversationId = null;
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
    this.setStatus('idle');
  }

  private wireSocketEvents(socket: Socket): void {
    socket.on('connect', () => {
      this.setStatus('online');
      this.lastKnownToken = this.options.session.accessToken();
      for (const roomId of this.joinedRooms) socket.emit('conversation:join', roomId);
    });
    socket.on('disconnect', () => this.setStatus('offline'));
    socket.on('connect_error', () => this.setStatus('degraded'));

    for (const event of REALTIME_EVENTS) {
      socket.on(event, (payload: unknown) => {
        this.eventListeners.get(event)?.forEach(listener => listener(payload));
      });
    }
  }

  // The gateway only verifies the JWT during the handshake (SocketIoRealtimeGateway#io.use)
  // and never re-checks it afterwards, so a live connection never truly goes stale. What
  // goes stale is a socket's next *reconnect* attempt: `auth` below is a callback invoked
  // fresh on every connection attempt, so once a reconnect happens it always carries the
  // current token. This watcher exists only to force that reconnect proactively when the
  // socket has stayed open long enough for the token to rotate underneath it.
  private startTokenWatcher(): void {
    this.tokenWatcher = setInterval(() => {
      const current = this.options.session.accessToken();
      if (current === this.lastKnownToken) return;
      this.lastKnownToken = current;
      this.socket?.disconnect();
      this.socket?.connect();
    }, TOKEN_WATCH_MS);
  }

  private stopTokenWatcher(): void {
    if (this.tokenWatcher) clearInterval(this.tokenWatcher);
    this.tokenWatcher = null;
  }

  private attachBrowserListeners(): void {
    if (typeof window === 'undefined') return;

    this.boundOnVisible = () => {
      if (document.visibilityState === 'visible' && this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    };
    this.boundOnOnline = () => {
      if (this.socket && !this.socket.connected) this.socket.connect();
    };
    this.boundOnOffline = () => this.setStatus('offline');

    document.addEventListener('visibilitychange', this.boundOnVisible);
    window.addEventListener('online', this.boundOnOnline);
    window.addEventListener('offline', this.boundOnOffline);
  }

  private detachBrowserListeners(): void {
    if (typeof window === 'undefined') return;
    if (this.boundOnVisible) document.removeEventListener('visibilitychange', this.boundOnVisible);
    if (this.boundOnOnline) window.removeEventListener('online', this.boundOnOnline);
    if (this.boundOnOffline) window.removeEventListener('offline', this.boundOnOffline);
    this.boundOnVisible = null;
    this.boundOnOnline = null;
    this.boundOnOffline = null;
  }

  private setStatus(next: RealtimeConnectionStatus): void {
    if (this.statusValue === next) return;
    this.statusValue = next;
    this.statusListeners.forEach(listener => listener(next));
  }
}
