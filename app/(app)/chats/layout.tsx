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
  // h-dvh with overflow-hidden, not min-h-dvh: the two panes must scroll
  // independently. Letting the row grow past the viewport makes the whole
  // page the scroll container, so scrolling a long thread drags the
  // conversation list up with it.
  <div className="flex h-dvh w-full overflow-hidden">
    <aside className="hidden w-[360px] shrink-0 flex-col overflow-y-auto lg:flex lg:border-r lg:border-line">
      <ScreenHeader title="Chats" />
      <ConversationList />
    </aside>
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
  </div>
);

export default ChatsLayout;
