// PROTOTYPE wiring: renders the variant picked by ?variant= (throwaway branch only).
import { PrototypeSwitcher } from '@/prototype/PrototypeSwitcher';
import { usePrototypeParams } from '@/prototype/params';
import { VariantA, VariantB, VariantC } from './AdminPage.prototype';

const variants = [
  { key: 'A', name: 'Tabs with tables' },
  { key: 'B', name: 'Agenda + side panel' },
  { key: 'C', name: '14-day timeline' },
];

export function AdminPage() {
  const { variant, state } = usePrototypeParams(variants);
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 pb-20">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div key={variant + state}>
        {variant === 'A' && <VariantA state={state} />}
        {variant === 'B' && <VariantB state={state} />}
        {variant === 'C' && <VariantC state={state} />}
      </div>
      <PrototypeSwitcher variants={variants} states={['ready', 'loading', 'empty', 'error']} />
    </main>
  );
}
