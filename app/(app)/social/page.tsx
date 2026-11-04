export const instant = false;

import { redirect } from 'next/navigation';

import { ROUTES } from '@/src/presentation/navigation/routes';

// /social was the feed screen before the C1 naming-inversion fix — redirect
// so bookmarks and in-flight links from before the rename still resolve.
const Page = () => redirect(ROUTES.FEED);

export default Page;
