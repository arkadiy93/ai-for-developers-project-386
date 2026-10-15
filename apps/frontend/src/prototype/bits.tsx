// PROTOTYPE: small shared pieces for the screens prototype. Not production code.
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function Skeleton({ className = 'h-16' }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-lg ${className}`} />;
}

export function ErrorBox({ what }: { what: string }) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-2 rounded-lg border p-4">
      <p className="font-medium">Couldn't load {what}.</p>
      <p className="text-muted-foreground text-sm">Check your connection and try again.</p>
      <Button variant="outline" size="sm">
        Retry
      </Button>
    </div>
  );
}

export function EmptyBox({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground max-w-sm text-sm">{hint}</p>
      {action}
    </div>
  );
}

export function SlotTakenBanner({ onPickAnother }: { onPickAnother: () => void }) {
  return (
    <div className="border-destructive/40 bg-destructive/5 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm">
      <span>Sorry, that time was just booked by someone else.</span>
      <Button variant="outline" size="sm" onClick={onPickAnother}>
        Pick another time
      </Button>
    </div>
  );
}

export function Field({
  label,
  type = 'text',
  defaultValue,
  textarea,
}: {
  label: string;
  type?: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  const cls = 'border-input w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm';
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea className={cls} rows={3} defaultValue={defaultValue} />
      ) : (
        <input className={cls} type={type} defaultValue={defaultValue} />
      )}
    </label>
  );
}

export function DurationSelect({ defaultValue = 30 }: { defaultValue?: number }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Duration</span>
      <select
        className="border-input rounded-lg border bg-transparent px-2.5 py-1.5"
        defaultValue={defaultValue}
      >
        {Array.from({ length: 16 }, (_, i) => (i + 1) * 15).map((m) => (
          <option key={m} value={m}>
            {m} min
          </option>
        ))}
      </select>
    </label>
  );
}

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background flex w-full max-w-md flex-col gap-4 rounded-xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function UtcNote() {
  return <span className="text-muted-foreground text-xs">All times are UTC.</span>;
}
