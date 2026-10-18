import { createPost, type PostPayload } from '../../domain/entities/Post';
import { createUser, type UserPayload } from '../../domain/entities/User';
import type {
  QueryInterpretation,
  SearchResults,
} from '../../domain/repositories/SearchRepository';
import { emptySearchResults } from '../../domain/repositories/SearchRepository';
import { toTopicList, type TopicEntry } from './TopicMapper';

interface PostEntry extends PostPayload {
  readonly post?: PostPayload;
}

interface PersonEntry extends UserPayload {
  readonly user?: UserPayload;
}

export interface SearchDto {
  readonly interpretation?: QueryInterpretation | null;
  readonly posts?: readonly PostEntry[];
  readonly people?: readonly PersonEntry[];
  readonly topics?: readonly TopicEntry[];
}

export const toSearchResults = (dto: SearchDto | null): SearchResults => {
  if (!dto) return emptySearchResults;
  return {
    interpretation: dto.interpretation ?? null,
    posts: (dto.posts ?? []).map(entry => createPost(entry.post ?? entry)),
    people: (dto.people ?? []).map(entry => createUser(entry.user ?? entry)),
    topics: toTopicList(dto.topics ?? []),
  };
};
