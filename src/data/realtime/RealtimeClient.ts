export type RealtimeConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline' | 'degraded';

export interface RawRealtimeId {
  readonly _value: string;
}

export type RawRealtimeRef = string | RawRealtimeId;

export interface RawRealtimeReceipt {
  readonly userId: string;
  readonly state: 'sent' | 'delivered' | 'read';
  readonly at: string;
}

export interface RawRealtimeReaction {
  readonly userId: string;
  readonly emoji: string;
  readonly at: string;
}

export interface RawRealtimeMessage {
  readonly id: RawRealtimeRef;
  readonly conversationId: RawRealtimeRef;
  readonly senderId: RawRealtimeRef;
  readonly kind: string;
  readonly body: string | null;
  readonly media: { readonly mediaId: string } | null;
  readonly replyToId: RawRealtimeRef | null;
  readonly clientNonce: string | null;
  readonly receipts: readonly RawRealtimeReceipt[];
  readonly reactions: readonly RawRealtimeReaction[];
  readonly createdAt: string;
}

export interface RealtimeMessageNewPayload {
  readonly message: RawRealtimeMessage;
}

export interface RealtimeMessageReadPayload {
  readonly conversationId: string;
  readonly userId: string;
}

export interface RawRealtimeNotification {
  readonly kind: string;
  readonly subject: { readonly kind: string; readonly id: string; readonly preview: string | null };
}

export interface RealtimeNotificationNewPayload {
  readonly kind?: string;
  readonly conversationId?: string;
  readonly notification?: RawRealtimeNotification;
}

export interface RealtimeEventMap {
  readonly 'message:new': RealtimeMessageNewPayload;
  readonly 'message:read': RealtimeMessageReadPayload;
  readonly 'notification:new': RealtimeNotificationNewPayload;
}

export type RealtimeUnsubscribe = () => void;

export interface RealtimeClient {
  connect(): void;
  disconnect(): void;
  forceDisconnect(): void;
  joinConversation(conversationId: string): void;
  leaveConversation(conversationId: string): void;
  setActiveConversation(conversationId: string | null): void;
  getActiveConversation(): string | null;
  status(): RealtimeConnectionStatus;
  onStatusChange(listener: (status: RealtimeConnectionStatus) => void): RealtimeUnsubscribe;
  on<K extends keyof RealtimeEventMap>(
    event: K,
    listener: (payload: RealtimeEventMap[K]) => void,
  ): RealtimeUnsubscribe;
}
