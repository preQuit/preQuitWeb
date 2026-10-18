import type { Topic } from '../../domain/entities/Topic';
import type { SearchRepository, SearchResults } from '../../domain/repositories/SearchRepository';
import type { PageOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toSearchResults, type SearchDto } from '../mappers/SearchMapper';
import { toTopicList, type TopicEntry } from '../mappers/TopicMapper';

interface TrendingDto {
  readonly topics?: readonly TopicEntry[];
  readonly hashtags?: readonly { readonly tag: string; readonly postCount: number }[];
}

export class HttpSearchRepository implements SearchRepository {
  constructor(private readonly http: HttpClient) {}

  async search(query: string, options: PageOptions = {}): Promise<SearchResults> {
    const { limit = 20, signal } = options;
    const dto = await this.http.get<SearchDto>('/search', {
      params: { q: query, limit },
      ...(signal ? { signal } : {}),
    });
    return toSearchResults(dto);
  }

  async trendingTopics(options: PageOptions = {}): Promise<readonly Topic[]> {
    const { limit = 20, signal } = options;
    const dto = await this.http.get<TrendingDto>('/search/trending', {
      authenticated: false,
      params: { limit },
      ...(signal ? { signal } : {}),
    });
    return toTopicList(dto?.topics ?? []);
  }
}
