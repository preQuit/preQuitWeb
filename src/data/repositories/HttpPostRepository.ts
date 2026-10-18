import type { Comment, CommentPayload } from '../../domain/entities/Comment';
import type { Post, PostPayload } from '../../domain/entities/Post';
import { AppError, ErrorCode } from '../../domain/errors/AppError';
import type { PostRepository } from '../../domain/repositories/PostRepository';
import type { PageOptions } from '../../domain/repositories/common';
import type { HttpClient } from '../http/HttpClient';
import { toComment, toCommentList } from '../mappers/CommentMapper';
import { toPost } from '../mappers/PostMapper';

export class HttpPostRepository implements PostRepository {
  constructor(private readonly http: HttpClient) {}

  async byId(postId: string, options: PageOptions = {}): Promise<Post | null> {
    const dto = await this.http.get<PostPayload>(`/posts/${postId}`, options);
    return dto ? toPost(dto) : null;
  }

  like(postId: string): Promise<unknown> {
    return this.http.post(`/posts/${postId}/likes`);
  }

  unlike(postId: string): Promise<unknown> {
    return this.http.delete(`/posts/${postId}/likes`);
  }

  save(postId: string): Promise<unknown> {
    return this.http.post(`/posts/${postId}/saves`);
  }

  unsave(postId: string): Promise<unknown> {
    return this.http.delete(`/posts/${postId}/saves`);
  }

  async comments(postId: string, options: PageOptions = {}): Promise<readonly Comment[]> {
    const { limit = 20, before, signal } = options;
    const page = await this.http.getPage<CommentPayload>(`/posts/${postId}/comments`, {
      params: { limit, before },
      ...(signal ? { signal } : {}),
    });
    return toCommentList(page.items);
  }

  async addComment(
    postId: string,
    body: string,
    parentId: string | null = null,
  ): Promise<Comment> {
    const dto = await this.http.post<CommentPayload>(`/posts/${postId}/comments`, {
      body,
      parentId,
    });
    if (!dto) throw new AppError('The comment could not be created.', { code: ErrorCode.UNKNOWN });
    return toComment({ ...dto, postId });
  }
}
