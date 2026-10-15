// PROTOTYPE wiring: renders the variant picked by ?variant= (throwaway branch only).
import { PrototypeSwitcher } from '@/prototype/PrototypeSwitcher';
import { usePrototypeParams } from '@/prototype/params';
import { VariantA, VariantB, VariantC } from './BookPage.prototype';

const variants = [
  { key: 'A', name: 'Step-by-step wizard' },
  { key: 'B', name: 'One page, all visible' },
  { key: 'C', name: 'Week calendar grid' },
];

export function BookPage() {
  const { variant, state } = usePrototypeParams(variants);
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 pb-20">
      <h1 className="text-2xl font-semibold">Book a call</h1>
      <div key={variant + state}>
        {variant === 'A' && <VariantA state={state} />}
        {variant === 'B' && <VariantB state={state} />}
        {variant === 'C' && <VariantC state={state} />}
      </div>
      <PrototypeSwitcher
        variants={variants}
        states={['ready', 'loading', 'empty', 'error', 'slot-taken']}
      />
    </main>
  );
}
