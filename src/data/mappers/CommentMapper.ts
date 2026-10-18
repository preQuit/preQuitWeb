import { createComment, type Comment, type CommentPayload } from '../../domain/entities/Comment';

export const toComment = (dto: CommentPayload | null): Comment => createComment(dto ?? {});

export const toCommentList = (rows: readonly CommentPayload[]): readonly Comment[] =>
  rows.map(row => createComment(row));
