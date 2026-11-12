'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AvatarUploadResult } from '../../application/profile/UpdateAvatarUseCase';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

export interface AvatarUploadViewModel {
  readonly isUploading: boolean;
  readonly error: unknown;
  readonly result: AvatarUploadResult | null;
  upload(file: File): Promise<void>;
}

/**
 * Drives one avatar replacement. The new URL is server-owned — it only exists
 * once the media host has processed the upload — so this invalidates the
 * profile rather than writing an optimistic value it would have to take back.
 */
export const useAvatarUpload = (): AvatarUploadViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => useCases.updateAvatar.execute(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.session });
    },
  });

  return {
    isUploading: mutation.isPending,
    error: mutation.error,
    result: mutation.data ?? null,
    upload: async file => {
      await mutation.mutateAsync(file);
    },
  };
};
