export const instant = false;

import { redirect } from 'next/navigation';

import { ROUTES } from '@/src/presentation/navigation/routes';

// /home was the search screen before the C1 naming-inversion fix — redirect
// so bookmarks and in-flight links from before the rename still resolve.
const Page = () => redirect(ROUTES.SEARCH);

export default Page;
