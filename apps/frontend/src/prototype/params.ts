// PROTOTYPE: reads ?variant= and ?state= for the screens prototype. Not production code.
import { useRouterState } from '@tanstack/react-router';
import type { ScreenState } from './mock';

export type VariantDef = { key: string; name: string };

export function usePrototypeParams(variants: VariantDef[]) {
  const search: Record<string, unknown> = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });
  const variant = typeof search.variant === 'string' ? search.variant : variants[0].key;
  const state = (typeof search.state === 'string' ? search.state : 'ready') as ScreenState;
  return { variant, state };
}
