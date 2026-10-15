// PROTOTYPE: floating variant/state switcher for the screens prototype. Not production code.
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { ScreenState } from './mock';
import { type VariantDef, usePrototypeParams } from './params';

export function PrototypeSwitcher({
  variants,
  states,
}: {
  variants: VariantDef[];
  states: ScreenState[];
}) {
  const navigate = useNavigate();
  const { variant, state } = usePrototypeParams(variants);
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === variant),
  );

  const go = (next: { variant?: string; state?: string }) =>
    void navigate({ to: '.', search: { variant, state, ...next } as never, replace: true });

  const cycle = (dir: 1 | -1) =>
    go({ variant: variants[(index + dir + variants.length) % variants.length].key });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') cycle(-1);
      if (e.key === 'ArrowRight') cycle(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black px-4 py-2 text-sm text-white shadow-2xl">
      <button onClick={() => cycle(-1)} aria-label="Previous variant">
        ←
      </button>
      <span className="min-w-48 text-center font-mono">
        {variants[index].key} ({variants[index].name})
      </span>
      <button onClick={() => cycle(1)} aria-label="Next variant">
        →
      </button>
      <select
        className="rounded bg-white/20 px-2 py-0.5"
        value={state}
        onChange={(e) => go({ state: e.target.value })}
      >
        {states.map((s) => (
          <option key={s} value={s} className="text-black">
            state: {s}
          </option>
        ))}
      </select>
    </div>
  );
}
