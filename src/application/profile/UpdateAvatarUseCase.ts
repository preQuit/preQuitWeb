import type { CompressOptions } from '../../data/media/compressImage';
import { AVATAR_COMPRESSION } from '../../data/media/compressImage';
import { AppError } from '../../domain/errors/AppError';
import type { ComposerRepository } from '../../domain/repositories/ComposerRepository';
import type { ProfileRepository } from '../../domain/repositories/ProfileRepository';

export type ImageCompressor = (file: File, options?: CompressOptions) => Promise<File>;

export interface AvatarUploadResult {
  readonly mediaId: string;
  /** Byte sizes either side of compression, so the UI can show the saving. */
  readonly originalBytes: number;
  readonly uploadedBytes: number;
}

/**
 * Replaces the signed-in user's avatar.
 *
 * Shrinking happens here rather than at the call site so no screen can upload
 * a full-resolution camera roll image by forgetting to ask — and because the
 * upload ticket is signed against the *compressed* file's size and type, the
 * order of these four steps is load-bearing.
 *
 * The compressor arrives by injection: this class never reaches for a canvas,
 * which keeps it unit-testable with a stub that simply returns its input.
 */
export class UpdateAvatarUseCase {
  constructor(
    private readonly composerRepository: ComposerRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly compress: ImageCompressor,
  ) {}

  async execute(file: File): Promise<AvatarUploadResult> {
    const optimised = await this.compress(file, AVATAR_COMPRESSION);

    const [ticket] = await this.composerRepository.requestUploadTickets(
      [{ mimeType: optimised.type, byteSize: optimised.size }],
      'avatar',
    );
    if (!ticket) throw new AppError('Could not start the upload.');

    const publicId = await this.composerRepository.uploadToTicket(ticket, optimised);
    await this.composerRepository.confirmUpload(ticket.mediaId, publicId);
    await this.profileRepository.setAvatar(ticket.mediaId);

    return {
      mediaId: ticket.mediaId,
      originalBytes: file.size,
      uploadedBytes: optimised.size,
    };
  }
}
