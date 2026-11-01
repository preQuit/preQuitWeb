'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfilePatch } from '../../domain/repositories/ProfileRepository';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';
import { useMyProfile } from './useProfile';

export interface SocialProfileEditorViewModel {
  readonly profile: ReturnType<typeof useMyProfile>['profile'];
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: unknown;
  save(patch: ProfilePatch): Promise<void>;
}

/**
 * UpdateProfileUseCase and HttpProfileRepository already exist and are wired
 * into the container — this phase only adds the first UI call site for them,
 * it does not touch the profile repository itself.
 */
export const useSocialProfileEditor = (): SocialProfileEditorViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const { profile, isLoading } = useMyProfile();

  const saveMutation = useMutation({
    mutationFn: (patch: ProfilePatch) => useCases.updateProfile.execute(patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myProfile });
    },
  });

  return {
    profile,
    isLoading,
    isSaving: saveMutation.isPending,
    error: saveMutation.error,
    save: async patch => {
      await saveMutation.mutateAsync(patch);
    },
  };
};
