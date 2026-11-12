import { AppError, ErrorCode } from '../../domain/errors/AppError';

export interface CompressOptions {
  /** Longest edge of the result, in pixels. Never upscales past the source. */
  readonly maxEdge?: number;
  /** Encoder quality, 0..1. Ignored by formats that encode losslessly. */
  readonly quality?: number;
  readonly mimeType?: string;
  /** Centre-crop to a square first — what a round avatar actually needs. */
  readonly square?: boolean;
}

const DEFAULTS: Required<CompressOptions> = {
  maxEdge: 512,
  quality: 0.82,
  mimeType: 'image/jpeg',
  square: true,
};

/** Avatars are shown in a circle no wider than 120px, so 512 covers 2x displays. */
export const AVATAR_COMPRESSION: CompressOptions = {
  maxEdge: 512,
  quality: 0.82,
  mimeType: 'image/jpeg',
  square: true,
};

interface DrawPlan {
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  readonly width: number;
  readonly height: number;
}

const planDraw = (
  sourceWidth: number,
  sourceHeight: number,
  maxEdge: number,
  square: boolean,
): DrawPlan => {
  if (square) {
    const edge = Math.min(sourceWidth, sourceHeight);
    const side = Math.min(maxEdge, edge);
    return {
      sx: Math.round((sourceWidth - edge) / 2),
      sy: Math.round((sourceHeight - edge) / 2),
      sw: edge,
      sh: edge,
      width: side,
      height: side,
    };
  }

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  return {
    sx: 0,
    sy: 0,
    sw: sourceWidth,
    sh: sourceHeight,
    width: Math.max(1, Math.round(sourceWidth * scale)),
    height: Math.max(1, Math.round(sourceHeight * scale)),
  };
};

const extensionFor = (mimeType: string): string => (mimeType === 'image/png' ? 'png' : 'jpg');

const renamed = (name: string, mimeType: string): string => {
  const base = name.replace(/\.[^./\\]+$/, '') || 'image';
  return `${base}.${extensionFor(mimeType)}`;
};

/**
 * Downscales and re-encodes a picked image in the browser, so a 12MP phone
 * photo leaves as a small square instead of being pushed over the wire — and
 * past the API's size ceiling — at full resolution.
 *
 * Kept free of React and of any repository: it takes a File and returns a
 * File, which is what makes it injectable into the avatar use case and
 * testable without a DOM-heavy harness around it.
 */
export const compressImage = async (file: File, options: CompressOptions = {}): Promise<File> => {
  const { maxEdge, quality, mimeType, square } = { ...DEFAULTS, ...options };

  if (!file.type.startsWith('image/')) {
    throw new AppError('That file is not an image.', { code: ErrorCode.VALIDATION_FAILED });
  }

  // `from-image` applies the EXIF rotation phone cameras record rather than
  // bake in, which is what otherwise lands portrait selfies on their side.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new AppError('That image could not be read.', { code: ErrorCode.VALIDATION_FAILED });
  });

  try {
    const plan = planDraw(bitmap.width, bitmap.height, maxEdge, square);
    const canvas = document.createElement('canvas');
    canvas.width = plan.width;
    canvas.height = plan.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new AppError('This browser could not process the image.', { code: ErrorCode.UNKNOWN });
    }
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, plan.sx, plan.sy, plan.sw, plan.sh, 0, 0, plan.width, plan.height);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, mimeType, quality),
    );
    if (!blob) {
      throw new AppError('That image could not be converted.', { code: ErrorCode.VALIDATION_FAILED });
    }

    return new File([blob], renamed(file.name, mimeType), { type: mimeType });
  } finally {
    bitmap.close();
  }
};
