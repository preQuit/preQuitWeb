import type { Post } from '../../domain/entities/Post';
import type { ComposerRepository } from '../../domain/repositories/ComposerRepository';

export interface PostDraftInput {
  readonly description: string;
  readonly files: readonly File[];
  readonly visibility?: 'public' | 'followers';
}

/**
 * Publishes a post: reserve a ticket per image, upload each to the media host,
 * confirm it, then create the post referencing the confirmed assets. The API
 * rejects a post with no media, so an empty file list fails before any request.
 */
export class CreatePostUseCase {
  constructor(private readonly composer: ComposerRepository) {}

  async execute(input: PostDraftInput): Promise<Post> {
    if (input.files.length === 0) throw new Error('Add at least one image.');

    const tickets = await this.composer.requestUploadTickets(
      input.files.map(file => ({ mimeType: file.type, byteSize: file.size })),
    );

    const media = await Promise.all(
      tickets.map(async (ticket, index) => {
        const file = input.files[index];
        if (!file) throw new Error('Image went missing before upload.');
        const publicId = await this.composer.uploadToTicket(ticket, file);
        await this.composer.confirmUpload(ticket.mediaId, publicId);
        return { mediaId: ticket.mediaId, altText: null };
      }),
    );

    return this.composer.createPost({
      description: input.description.trim(),
      media,
      visibility: input.visibility ?? 'public',
    });
  }
}
