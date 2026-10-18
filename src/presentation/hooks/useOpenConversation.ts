'use client';

import { useMutation } from '@tanstack/react-query';

import { useUseCases } from '../container/DependencyProvider';

export interface OpenConversationViewModel {
  readonly isOpening: boolean;
  open(peerId: string): Promise<string | null>;
}

export const useOpenConversation = (): OpenConversationViewModel => {
  const useCases = useUseCases();

  const mutation = useMutation({
    mutationFn: (peerId: string) => useCases.openConversation.execute(peerId),
  });

  return {
    isOpening: mutation.isPending,
    open: peerId => mutation.mutateAsync(peerId),
  };
};
