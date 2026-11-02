import type { PostRepository } from '../../domain/repositories/PostRepository';

export class DeletePostUseCase {
  constructor(private readonly posts: PostRepository) {}

  execute(postId: string): Promise<void> {
    return this.posts.remove(postId);
  }
}
