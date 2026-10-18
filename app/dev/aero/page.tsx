'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import { AeroButton } from '@/src/presentation/components/AeroButton';
import { AeroInput } from '@/src/presentation/components/AeroInput';

const Row = ({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-3">
    <div>
      <h2 className="font-display text-[15px] font-semibold tracking-wide text-paper">{title}</h2>
      <p className="text-[12px] text-muted">{hint}</p>
    </div>
    <div className="glass aero-sheen flex flex-wrap items-end gap-5 rounded-[8px] p-5">{children}</div>
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
        <p className="text-[11px] font-semibold tracking-[0.2em] text-aero-cyan uppercase">
          PreQuit · component specimen
        </p>
        <h1 className="display-title mt-2 text-4xl text-paper aero-glow-text">Black Aero</h1>
        <p className="mt-2 max-w-prose text-[13px] text-muted">
          Windows Vista/7 Aero on a black ground. Gloss breaks hard at 48%, buttons are raised with a
          light-top / dark-bottom bevel, inputs are sunken. 5px radii, no pills.
        </p>
      </header>

      <Row title="Primary button" hint="Azure Aero fill. Hover lifts brightness and adds the cyan halo.">
        <Caption label="default"><AeroButton tone="primary">Sign In</AeroButton></Caption>
        <Caption label="hover"><AeroButton tone="primary" className="aero-button-hover brightness-122">Sign In</AeroButton></Caption>
        <Caption label="disabled"><AeroButton tone="primary" disabled>Sign In</AeroButton></Caption>
      </Row>

      <Row title="Secondary button" hint="Graphite glass. Same bevel, no accent fill.">
        <Caption label="default"><AeroButton>Standard Login</AeroButton></Caption>
        <Caption label="hover"><AeroButton className="aero-button-hover brightness-122">Standard Login</AeroButton></Caption>
        <Caption label="disabled"><AeroButton disabled>Standard Login</AeroButton></Caption>
      </Row>

      <Row title="Sunken input" hint="Inset shadow with a light bottom edge — the inverse of the button bevel.">
        <div className="w-60"><AeroInput label="User Name:" value={value} onChange={e => setValue(e.target.value)} /></div>
        <div className="w-60"><AeroInput label="Focused:" defaultValue="focus ring" className="" autoFocus /></div>
        <div className="w-60"><AeroInput label="Invalid:" defaultValue="bad@" invalid /></div>
        <div className="w-60"><AeroInput label="Disabled:" defaultValue="locked" disabled /></div>
        <div className="w-60">
          <AeroInput label="With icon:" placeholder="Search PreQuit" adornment={<Search size={14} className="text-faint" />} />
        </div>
      </Row>

      <Row title="Panel + active nav chip" hint="glass-raised for dialogs, aero-active for the selected rail item.">
        <div className="glass-raised aero-sheen w-64 rounded-[8px] p-4">
          <p className="text-[13px] font-semibold text-paper">Raised panel</p>
          <p className="mt-1 text-[12px] text-muted">Rim light plus outer azure bloom.</p>
        </div>
        <div className="aero-active flex h-9 items-center rounded-[5px] px-4 text-[13px] font-semibold text-paper">
          Home
        </div>
      </Row>
    </main>
  );
};

export default Page;
