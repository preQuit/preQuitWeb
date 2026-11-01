'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import { GlassButton } from '@/src/presentation/components/GlassButton';
import { GlassField } from '@/src/presentation/components/GlassField';

const Row = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-3">
    <div>
      <h2 className="font-display text-[15px] font-semibold tracking-wide text-paper">{title}</h2>
      <p className="text-[12px] text-muted">{hint}</p>
    </div>
    <div className="surface flex flex-wrap items-end gap-5 rounded-card p-5">{children}</div>
  </section>
);

const Caption = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-start gap-2">
    {children}
    <span className="text-[10px] font-semibold tracking-[0.14em] text-faint uppercase">{label}</span>
  </div>
);

const Page = () => {
  const [value, setValue] = useState('nova@example.com');

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-10 px-8 py-14">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-cobalt-bright uppercase">
          PreQuit · component specimen
        </p>
        <h1 className="display-title mt-2 text-4xl text-paper">Pure Dark · Cobalt · Lime</h1>
        <p className="mt-2 max-w-prose text-[13px] text-muted">
          The mobile app&apos;s language on the web: pure black ground, flat surfaces built from plain
          white veils, square controls and rounded containers. 70% black, 20% cobalt, 10% lime.
        </p>
      </header>

      <Row title="Primary button" hint="Solid acid lime with an ink label — the only lime fill in the system.">
        <Caption label="default"><GlassButton tone="primary">Sign In</GlassButton></Caption>
        <Caption label="hover"><GlassButton tone="primary" className="btn-hover">Sign In</GlassButton></Caption>
        <Caption label="disabled"><GlassButton tone="primary" disabled>Sign In</GlassButton></Caption>
      </Row>

      <Row title="Secondary button" hint="Solid cobalt. The everyday action, one step below primary.">
        <Caption label="default"><GlassButton tone="secondary">Standard Login</GlassButton></Caption>
        <Caption label="hover"><GlassButton tone="secondary" className="btn-hover">Standard Login</GlassButton></Caption>
        <Caption label="disabled"><GlassButton tone="secondary" disabled>Standard Login</GlassButton></Caption>
      </Row>

      <Row title="Input" hint="Flat #0d0d0d well, one hairline, square corners. Cobalt on focus.">
        <div className="w-60"><GlassField label="User Name:" value={value} onChange={e => setValue(e.target.value)} /></div>
        <div className="w-60"><GlassField label="Focused:" defaultValue="focus ring" autoFocus /></div>
        <div className="w-60"><GlassField label="Invalid:" defaultValue="bad@" invalid /></div>
        <div className="w-60"><GlassField label="Disabled:" defaultValue="locked" disabled /></div>
        <div className="w-60">
          <GlassField label="With icon:" placeholder="Search PreQuit" adornment={<Search size={14} className="text-faint" />} />
        </div>
      </Row>

      <Row title="Other tones" hint="outline and quiet — chrome-free, for cancel and dismiss.">
        <Caption label="outline"><GlassButton tone="outline">Cancel</GlassButton></Caption>
        <Caption label="quiet"><GlassButton tone="quiet">Dismiss</GlassButton></Caption>
        <Caption label="outline disabled"><GlassButton tone="outline" disabled>Cancel</GlassButton></Caption>
      </Row>

      <Row title="Control scale" hint='size="control" — the dense metric, for toolbars and chrome.'>
        <Caption label="primary"><GlassButton tone="primary" size="control">Apply</GlassButton></Caption>
        <Caption label="secondary"><GlassButton tone="secondary" size="control">Browse…</GlassButton></Caption>
        <div className="w-52"><GlassField size="control" label="Dense field:" defaultValue="toolbar scale" /></div>
      </Row>

      <Row title="Panel + active nav chip" hint="surface-raised for dialogs, nav-active for the selected rail item.">
        <div className="surface-raised w-64 rounded-card p-4">
          <p className="text-[13px] font-semibold text-paper">Raised panel</p>
          <p className="mt-1 text-[12px] text-muted">Opaque #0c0c0c, never translucent.</p>
        </div>
        <div className="nav-active flex h-9 items-center rounded-control px-4 text-[13px] font-semibold text-paper">
          Home
        </div>
      </Row>
    </main>
  );
};

export default Page;
