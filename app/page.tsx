export const instant = false;

import { RequireGuest } from '@/src/presentation/navigation/RouteGuard';
import { SignInScreen } from '@/src/presentation/screens/SignInScreen';

const Page = () => (
  <RequireGuest>
    <SignInScreen />
  </RequireGuest>
);

export default Page;
