import { createPost, type Post, type PostPayload } from '../../domain/entities/Post';
import type { Page } from '../../domain/repositories/common';

export interface RankedEntry {
  readonly post?: PostPayload;
  readonly reason?: Post['reason'];
}

export const toPost = (dto: PostPayload | null): Post => createPost(dto ?? {});

export const toRankedPost = (entry: RankedEntry): Post =>
  createPost({
    ...(entry.post ?? (entry as PostPayload)),
    reason: entry.reason ?? entry.post?.reason ?? null,
  });

export const toPostList = (rows: readonly RankedEntry[]): readonly Post[] => rows.map(toRankedPost);

export const toPostPage = (page: Page<RankedEntry>): Page<Post> => ({
  items: page.items.map(toRankedPost),
  nextCursor: page.nextCursor,
});
