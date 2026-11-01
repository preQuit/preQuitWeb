export const instant = false;

import type { ReactNode } from 'react';

import { ScreenHeader } from '@/src/presentation/components/ScreenHeader';
import { ConversationList } from '@/src/presentation/screens/ChatsScreen';

export interface ChatsLayoutProps {
  readonly children: ReactNode;
}

/**
 * Shared by `/chats` and `/chats/[conversationId]`: at `lg+` the
 * conversation list becomes a persistent ~360px master pane next to
 * whichever detail pane is routed into `children`, so opening a thread
 * doesn't navigate away from the list — the standard desktop chat layout.
 * Below `lg` this renders nothing extra; each page stays full width and
 * single-pane, same as before.
 */
const ChatsLayout = ({ children }: ChatsLayoutProps) => (
  <div className="mx-auto flex w-full max-w-5xl flex-1 lg:min-h-dvh">
    <aside className="hidden w-[360px] shrink-0 flex-col lg:flex lg:border-r lg:border-line">
      <ScreenHeader title="Chats" />
      <ConversationList />
    </aside>
    <div className="flex-1">{children}</div>
  </div>
);

export default ChatsLayout;
