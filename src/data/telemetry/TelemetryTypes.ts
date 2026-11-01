export type InteractionEventType = 'impression' | 'dwell' | 'skip' | 'tap_through' | 'profile_visit';

export interface TelemetryEventInput {
  readonly postId: string;
  readonly type: InteractionEventType;
  readonly dwellMs?: number;
  readonly surface?: string | null;
}

export interface TelemetryBatchResult {
  readonly accepted: number;
  readonly rejected: number;
}
