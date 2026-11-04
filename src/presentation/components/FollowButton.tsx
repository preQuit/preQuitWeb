'use client';

import { useState } from 'react';

import type { User } from '../../domain/entities/User';
import { RelationshipState, type RelationshipStateValue } from '../../domain/repositories/SocialRepository';
import { useFollowAction } from '../hooks/useFollowAction';
import type { ControlSize } from './controlSize';
import { GlassButton, type ButtonTone } from './GlassButton';

export interface FollowButtonProps {
  readonly user: User | null;
  readonly size?: ControlSize;
  readonly className?: string;
}

const LABELS: Readonly<Record<RelationshipStateValue, string>> = {
  [RelationshipState.NONE]: 'Follow',
  [RelationshipState.REQUESTED]: 'Requested',
  [RelationshipState.FOLLOWING]: 'Following',
  [RelationshipState.MUTUAL]: 'Friends',
  [RelationshipState.BLOCKED]: 'Blocked',
  [RelationshipState.BLOCKED_BY]: '',
};

const RESTING_TONES: Readonly<Record<RelationshipStateValue, ButtonTone>> = {
  [RelationshipState.NONE]: 'secondary',
  [RelationshipState.REQUESTED]: 'outline',
  [RelationshipState.FOLLOWING]: 'outline',
  [RelationshipState.MUTUAL]: 'outline',
  [RelationshipState.BLOCKED]: 'outline',
  [RelationshipState.BLOCKED_BY]: 'outline',
};

/**
 * The one relationship-aware button in the app. It never infers state itself
 * — useFollowAction reads `viewer.relationship` straight off the User the
 * backend returned — it only decides label, tone and the confirm step.
 */
export const FollowButton = ({ user, size = 'action', className = '' }: FollowButtonProps) => {
  const { relationship, isHidden, isBusy, isConfirmingUnfollow, cancelUnfollowConfirm, act } =
    useFollowAction(user);
  const [hovering, setHovering] = useState(false);

  if (isHidden || !relationship) return null;

  const isFollowing = relationship === RelationshipState.FOLLOWING;
  const isMutual = relationship === RelationshipState.MUTUAL;
  const confirming = isMutual && isConfirmingUnfollow;

  const label = confirming ? 'Unfollow?' : isFollowing && hovering ? 'Unfollow' : LABELS[relationship];
  const tone: ButtonTone = confirming ? 'secondary' : RESTING_TONES[relationship];

  return (
    <GlassButton
      type="button"
      tone={tone}
      size={size}
      disabled={isBusy}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => {
        setHovering(false);
        cancelUnfollowConfirm();
      }}
      onClick={act}
      className={className}
    >
      {label}
    </GlassButton>
  );
};
