'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Comment } from '../../domain/entities/Comment';
import { useUseCases } from '../container/DependencyProvider';
import { queryKeys } from '../query/queryKeys';

export interface CommentsViewModel {
  readonly comments: readonly Comment[];
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly error: unknown;
  addComment(body: string): Promise<Comment | null>;
}

export const useComments = (postId: string | null): CommentsViewModel => {
  const useCases = useUseCases();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.comments(postId ?? '');

  const comments = useQuery({
    queryKey,
    queryFn: ({ signal }) => useCases.loadComments.execute(postId ?? '', { signal }),
    enabled: Boolean(postId),
  });

  const addMutation = useMutation({
    mutationFn: (body: string) => useCases.addComment.execute(postId ?? '', body),
    onSuccess: created => {
      if (!created) return;
      queryClient.setQueryData<readonly Comment[]>(queryKey, current => [
        ...(current ?? []),
        created,
      ]);
    },
  });

  return {
    comments: comments.data ?? [],
    isLoading: Boolean(postId) && comments.isPending,
    isSubmitting: addMutation.isPending,
    error: comments.error,
    addComment: body => addMutation.mutateAsync(body),
  };
};
