import type { Post } from '../../domain/entities/Post';
import type {
  ComposerRepository,
  NewPostDraft,
  UploadTicket,
} from '../../domain/repositories/ComposerRepository';
import type { HttpClient } from '../http/HttpClient';
import { toPost } from '../mappers/PostMapper';
import { AppError } from '../../domain/errors/AppError';

export class HttpComposerRepository implements ComposerRepository {
  constructor(private readonly http: HttpClient) {}

  async requestUploadTickets(
    items: readonly { mimeType: string; byteSize: number }[],
  ): Promise<readonly UploadTicket[]> {
    const tickets = await this.http.post<UploadTicket[]>(
      '/media/upload-tickets',
      { purpose: 'post', items },
      { authenticated: true },
    );
    return tickets ?? [];
  }

  /**
   * Posts the file to the media host with the signed fields the ticket carries.
   * This request deliberately does not go through HttpClient — it is a
   * third-party endpoint and must not receive our Authorization header.
   */
  async uploadToTicket(ticket: UploadTicket, file: File): Promise<string> {
    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.fields)) form.append(key, value);
    form.append('file', file);

    const response = await fetch(ticket.uploadUrl, { method: ticket.method || 'POST', body: form });
    if (!response.ok) {
      throw new AppError(`Image upload failed (${response.status}).`);
    }
    const body = (await response.json()) as { public_id?: string };
    if (!body.public_id) throw new AppError('Image upload returned no id.');
    return body.public_id;
  }

  confirmUpload(mediaId: string, publicId: string): Promise<unknown> {
    return this.http.post(`/media/${mediaId}/confirm`, { publicId }, { authenticated: true });
  }

  async createPost(draft: NewPostDraft): Promise<Post> {
    const created = await this.http.post<Parameters<typeof toPost>[0]>('/posts', draft, {
      authenticated: true,
    });
    if (!created) throw new AppError('Post was not created.');
    return toPost(created);
  }
}
