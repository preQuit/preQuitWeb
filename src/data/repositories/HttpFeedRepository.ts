import type { Post } from '../../domain/entities/Post';
import {
  FeedSurface,
  type FeedRepository,
  type FeedSurfaceValue,
} from '../../domain/repositories/FeedRepository';
import type { Page, PageOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toPostPage, type RankedEntry } from '../mappers/PostMapper';

const PATHS: Readonly<Record<FeedSurfaceValue, string>> = {
  [FeedSurface.HOME]: '/feed/home',
  [FeedSurface.EXPLORE]: '/feed/explore',
  [FeedSurface.TRENDING]: '/feed/trending',
};

export class HttpFeedRepository implements FeedRepository {
  constructor(private readonly http: HttpClient) {}

  async load(
    surface: FeedSurfaceValue = FeedSurface.HOME,
    options: PageOptions = {},
  ): Promise<Page<Post>> {
    const { limit = 20, before, signal } = options;
    const page = await this.http.getPage<RankedEntry>(PATHS[surface] ?? PATHS[FeedSurface.HOME], {
      authenticated: surface === FeedSurface.HOME,
      params: { limit, before },
      ...(signal ? { signal } : {}),
    });
    return toPostPage(page);
  }
}
