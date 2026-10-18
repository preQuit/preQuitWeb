import {
  emptySearchResults,
  type SearchRepository,
  type SearchResults,
} from '../../domain/repositories/SearchRepository';
import type { PageOptions } from '../../domain/repositories/common';

export class SearchContentUseCase {
  constructor(private readonly searchRepository: SearchRepository) {}

  execute(query: string, options?: PageOptions): Promise<SearchResults> {
    const trimmed = query.trim();
    if (!trimmed) return Promise.resolve(emptySearchResults);
    return this.searchRepository.search(trimmed, options);
  }
}
