'use client';

import { useState, type ReactNode } from 'react';

import { ComposerDialog } from '@/src/presentation/components/ComposerDialog';
import { GlassTabBar } from '@/src/presentation/components/GlassTabBar';
import { SideRail } from '@/src/presentation/components/SideRail';

/**
 * Owns the composer state because both navigation surfaces open it and only
 * one of them is mounted at a given viewport width. The dialog lives here, as
 * a sibling of the rail rather than a child, so its fixed positioning resolves
 * against the viewport instead of the rail's backdrop-filter containing block.
 */
export const AppChrome = ({ children }: { readonly children: ReactNode }) => {
  const [composing, setComposing] = useState(false);
  const open = () => setComposing(true);

  return (
    <>
      <SideRail onCompose={open} />
      <div className="md:pl-rail xl:pl-rail-wide">
        <div className="mx-auto w-full max-w-2xl px-4 pb-28 md:pb-10">{children}</div>
      </div>
      <GlassTabBar onCompose={open} />
      <ComposerDialog open={composing} onClose={() => setComposing(false)} />
    </>
  );
};
