import type { Post } from '../entities/Post';

export interface UploadTicket {
  readonly mediaId: string;
  readonly uploadUrl: string;
  readonly method: string;
  readonly contentType: string;
  readonly fields: Readonly<Record<string, string>>;
  readonly expiresAt: string;
}

export interface NewPostDraft {
  readonly description: string;
  readonly media: readonly { readonly mediaId: string; readonly altText: string | null }[];
  readonly visibility: 'public' | 'followers';
  readonly topicIds?: readonly string[];
}

/**
 * Publishing is three steps because the image never passes through our API:
 * reserve a ticket, upload straight to the media host, then tell the API the
 * upload landed. Only then can the post reference the asset.
 */
export interface ComposerRepository {
  requestUploadTickets(
    items: readonly { mimeType: string; byteSize: number }[],
  ): Promise<readonly UploadTicket[]>;
  uploadToTicket(ticket: UploadTicket, file: File): Promise<string>;
  confirmUpload(mediaId: string, publicId: string): Promise<unknown>;
  createPost(draft: NewPostDraft): Promise<Post>;
}
