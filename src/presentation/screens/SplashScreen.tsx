'use client';

import Link from 'next/link';

import { SolarSystem } from '../components/SolarSystem';
import { useRedirectWhenSignedIn } from '../navigation/RouteGuard';
import { ROUTES } from '../navigation/routes';

export const SplashScreen = () => {
  const settling = useRedirectWhenSignedIn();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-between gap-10 px-8 py-16">
      <header className="animate-fade flex flex-col items-center gap-1.5 pt-6">
        <h1 className="display-title text-5xl text-paper sm:text-6xl">PreQuit</h1>
        <p className="text-sm tracking-[0.3em] text-white/60 uppercase">Eye of Internet</p>
      </header>

      <SolarSystem />

      <nav
        aria-hidden={settling}
        className={`flex w-full max-w-sm flex-col gap-3.5 transition-opacity duration-500 ${
          settling ? 'pointer-events-none opacity-0' : 'animate-rise opacity-100'
        }`}
      >
        <Link
          href={ROUTES.SIGN_UP}
          className="flex h-13 items-center justify-center bg-paper text-base font-bold text-ink transition-colors hover:bg-white/90"
        >
          Create New Account
        </Link>
        <Link
          href={ROUTES.SIGN_IN}
          className="glass flex h-13 items-center justify-center text-base font-bold text-paper transition-colors hover:bg-white/10"
        >
          Login
        </Link>
      </nav>
    </main>
  );
};
