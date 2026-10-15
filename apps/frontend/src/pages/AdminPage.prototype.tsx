// PROTOTYPE: three structurally different Admin areas on /admin. Not production code.
// Question: which screens and states does the Admin area have? Switch with ?variant=A|B|C&state=...
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyBox, ErrorBox, Modal, Skeleton, UtcNote } from '@/prototype/bits';
import {
  type Booking,
  type EventType,
  type ScreenState,
  NOW,
  fmtDay,
  fmtDuration,
  fmtTime,
  initialBookings,
  initialEventTypes,
  sameDay,
  windowDays,
} from '@/prototype/mock';

type Props = { state: ScreenState };

function useAdminData(state: ScreenState) {
  const [types, setTypes] = useState<EventType[]>(state === 'empty' ? [] : initialEventTypes);
  const bookings: Booking[] = state === 'empty' ? [] : initialBookings.filter((b) => b.end > NOW);
  const save = (t: EventType) =>
    setTypes((ts) =>
      ts.some((x) => x.id === t.id) ? ts.map((x) => (x.id === t.id ? t : x)) : [...ts, t],
    );
  const remove = (id: string) => setTypes((ts) => ts.filter((t) => t.id !== id));
  return { types, bookings, save, remove };
}

function EventTypeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: EventType;
  onSave: (t: EventType) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: initial?.id ?? crypto.randomUUID(),
          name: String(f.get('name') || 'Untitled'),
          description: String(f.get('description') ?? ''),
          durationMinutes: Number(f.get('duration') ?? 30),
        });
      }}
    >
      <NamedField name="name" label="Name" defaultValue={initial?.name} />
      <NamedField
        name="description"
        label="Description"
        defaultValue={initial?.description}
        textarea
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Duration</span>
        <select
          name="duration"
          className="border-input rounded-lg border bg-transparent px-2.5 py-1.5"
          defaultValue={initial?.durationMinutes ?? 30}
        >
          {Array.from({ length: 16 }, (_, i) => (i + 1) * 15).map((m) => (
            <option key={m} value={m}>
              {fmtDuration(m)}
            </option>
          ))}
        </select>
      </label>
      {initial && (
        <p className="text-muted-foreground text-xs">
          Changes apply to new bookings only. Calls already booked keep their time and name.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save' : 'Create'}</Button>
      </div>
    </form>
  );
}

function NamedField(props: {
  name: string;
  label: string;
  defaultValue?: string;
  textarea?: boolean;
}) {
  const cls = 'border-input w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm';
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{props.label}</span>
      {props.textarea ? (
        <textarea name={props.name} className={cls} rows={3} defaultValue={props.defaultValue} />
      ) : (
        <input name={props.name} className={cls} defaultValue={props.defaultValue} />
      )}
    </label>
  );
}

function DeleteDialog({
  type,
  onConfirm,
  onClose,
}: {
  type: EventType;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={`Delete ${type.name}?`} onClose={onClose}>
      <p className="text-sm">Guests won't be able to book it anymore. Existing Bookings stay.</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}

/** Edit / create / delete dialogs, shared by every variant. */
function useEventTypeDialogs(save: (t: EventType) => void, remove: (id: string) => void) {
  const [editing, setEditing] = useState<EventType | 'new'>();
  const [deleting, setDeleting] = useState<EventType>();
  const dialogs = (
    <>
      {editing && (
        <Modal
          title={editing === 'new' ? 'New event type' : `Edit ${editing.name}`}
          onClose={() => setEditing(undefined)}
        >
          <EventTypeForm
            initial={editing === 'new' ? undefined : editing}
            onSave={(t) => (save(t), setEditing(undefined))}
            onCancel={() => setEditing(undefined)}
          />
        </Modal>
      )}
      {deleting && (
        <DeleteDialog
          type={deleting}
          onConfirm={() => (remove(deleting.id), setDeleting(undefined))}
          onClose={() => setDeleting(undefined)}
        />
      )}
    </>
  );
  return { setEditing, setDeleting, dialogs };
}

/* ---------------- A: tabs, two tables ---------------- */

export function VariantA({ state }: Props) {
  const { types, bookings, save, remove } = useAdminData(state);
  const [tab, setTab] = useState<'bookings' | 'types'>('bookings');
  const { setEditing, setDeleting, dialogs } = useEventTypeDialogs(save, remove);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b">
        {(['bookings', 'types'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm',
              tab === t ? 'border-primary font-medium' : 'border-transparent',
            )}
          >
            {t === 'bookings'
              ? `Upcoming bookings (${bookings.length})`
              : `Event types (${types.length})`}
          </button>
        ))}
      </div>

      {state === 'loading' && <Skeleton className="h-64" />}
      {state === 'error' && <ErrorBox what={tab === 'bookings' ? 'bookings' : 'event types'} />}

      {state !== 'loading' &&
        state !== 'error' &&
        tab === 'bookings' &&
        (bookings.length === 0 ? (
          <EmptyBox
            title="No upcoming bookings"
            hint="When a Guest books a call, it shows up here."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left text-xs uppercase">
              <tr>
                <th className="py-2">When (UTC)</th>
                <th>Call</th>
                <th>Guest</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="py-2">
                    {fmtDay(b.start)}, {fmtTime(b.start)}–{fmtTime(b.end)}
                  </td>
                  <td>{b.eventTypeName}</td>
                  <td>{b.guestName}</td>
                  <td className="text-muted-foreground">{b.guestEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

      {state !== 'loading' && state !== 'error' && tab === 'types' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setEditing('new')}>New event type</Button>
          </div>
          {types.length === 0 ? (
            <EmptyBox
              title="No event types yet"
              hint="Guests can't book anything until you create one."
              action={
                <Button onClick={() => setEditing('new')}>Create your first event type</Button>
              }
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-left text-xs uppercase">
                <tr>
                  <th className="py-2">Name</th>
                  <th>Duration</th>
                  <th>Description</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {types.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2 font-medium">{t.name}</td>
                    <td>{fmtDuration(t.durationMinutes)}</td>
                    <td className="text-muted-foreground max-w-xs truncate">{t.description}</td>
                    <td className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(t)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleting(t)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {dialogs}
    </div>
  );
}

/* ---------------- B: side by side, agenda + inline-editable cards ---------------- */

export function VariantB({ state }: Props) {
  const { types, bookings, save, remove } = useAdminData(state);
  const [open, setOpen] = useState<string>();
  const { setDeleting, dialogs } = useEventTypeDialogs(save, remove);

  if (state === 'loading')
    return (
      <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  if (state === 'error') return <ErrorBox what="the admin data" />;

  const byDay = windowDays
    .map((d) => ({ d, items: bookings.filter((b) => sameDay(b.start, d)) }))
    .filter((g) => g.items.length);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem]">
      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Upcoming bookings</h2>
          <UtcNote />
        </div>
        {byDay.length === 0 && (
          <EmptyBox title="Nothing booked yet" hint="Share the booking page with Guests." />
        )}
        {byDay.map(({ d, items }) => (
          <div key={d.toISOString()}>
            <h3 className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
              {sameDay(d, NOW) ? 'Today' : fmtDay(d)}
            </h3>
            <ul className="flex flex-col gap-1">
              {items.map((b) => (
                <li key={b.id} className="flex gap-4 rounded-lg border px-3 py-2 text-sm">
                  <span className="w-24 shrink-0 font-mono">
                    {fmtTime(b.start)}–{fmtTime(b.end)}
                  </span>
                  <span className="flex-1">
                    <span className="font-medium">{b.eventTypeName}</span> with {b.guestName}
                  </span>
                  <a className="text-muted-foreground" href={`mailto:${b.guestEmail}`}>
                    {b.guestEmail}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <aside className="flex flex-col gap-2">
        <h2 className="font-semibold">Event types</h2>
        {types.length === 0 && (
          <p className="text-muted-foreground text-sm">
            None yet. Guests see an empty booking page.
          </p>
        )}
        {types.map((t) => (
          <div key={t.id} className="rounded-lg border">
            <button
              className="flex w-full justify-between p-3 text-left text-sm"
              onClick={() => setOpen(open === t.id ? undefined : t.id)}
            >
              <span className="font-medium">{t.name}</span>
              <span className="text-muted-foreground">{fmtDuration(t.durationMinutes)}</span>
            </button>
            {open === t.id && (
              <div className="border-t p-3">
                <EventTypeForm
                  initial={t}
                  onSave={(x) => (save(x), setOpen(undefined))}
                  onCancel={() => setOpen(undefined)}
                />
                <Button
                  variant="link"
                  className="text-destructive mt-2 px-0"
                  onClick={() => setDeleting(t)}
                >
                  Delete this event type
                </Button>
              </div>
            )}
          </div>
        ))}
        <div className="rounded-lg border border-dashed">
          <button
            className="w-full p-3 text-left text-sm"
            onClick={() => setOpen(open === 'new' ? undefined : 'new')}
          >
            + New event type
          </button>
          {open === 'new' && (
            <div className="border-t p-3">
              <EventTypeForm
                onSave={(x) => (save(x), setOpen(undefined))}
                onCancel={() => setOpen(undefined)}
              />
            </div>
          )}
        </div>
      </aside>
      {dialogs}
    </div>
  );
}

/* ---------------- C: calendar timeline of bookings, event types as chips ---------------- */

export function VariantC({ state }: Props) {
  const { types, bookings, save, remove } = useAdminData(state);
  const { setEditing, setDeleting, dialogs } = useEventTypeDialogs(save, remove);
  const [selected, setSelected] = useState<Booking>();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-sm">Event types:</span>
        {state === 'loading' && <Skeleton className="h-8 w-64" />}
        {state !== 'loading' &&
          types.map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-3 text-sm"
            >
              {t.name} · {fmtDuration(t.durationMinutes)}
              <Button variant="ghost" size="xs" onClick={() => setEditing(t)}>
                Edit
              </Button>
              <Button variant="ghost" size="xs" onClick={() => setDeleting(t)}>
                ✕
              </Button>
            </span>
          ))}
        <Button size="sm" variant="outline" onClick={() => setEditing('new')}>
          + Add
        </Button>
        <span className="ml-auto">
          <UtcNote />
        </span>
      </div>

      {state === 'loading' && <Skeleton className="h-[28rem]" />}
      {state === 'error' && <ErrorBox what="bookings" />}
      {state !== 'loading' && state !== 'error' && (
        <div className="relative grid grid-cols-[3rem_repeat(14,minmax(4rem,1fr))] overflow-x-auto rounded-lg border text-xs">
          <div />
          {windowDays.map((d) => (
            <div key={d.toISOString()} className="border-l p-1 text-center font-medium">
              {fmtDay(d)}
            </div>
          ))}
          <div className="relative h-[27rem]">
            {Array.from({ length: 9 }, (_, i) => (
              <span
                key={i}
                className="text-muted-foreground absolute right-1"
                style={{ top: `${(i / 9) * 100}%` }}
              >
                {String(9 + i).padStart(2, '0')}
              </span>
            ))}
          </div>
          {windowDays.map((d) => (
            <div key={d.toISOString()} className="relative h-[27rem] border-l">
              {bookings
                .filter((b) => sameDay(b.start, d))
                .map((b) => {
                  const top =
                    ((b.start.getUTCHours() * 60 + b.start.getUTCMinutes() - 540) / 540) * 100;
                  const h = ((b.end.getTime() - b.start.getTime()) / 60000 / 540) * 100;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className="bg-primary/15 border-primary absolute inset-x-0.5 overflow-hidden rounded border-l-2 px-1 text-left"
                      style={{ top: `${top}%`, height: `${h}%` }}
                    >
                      {fmtTime(b.start)} {b.eventTypeName}
                    </button>
                  );
                })}
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background rounded-lg border px-3 py-2 text-sm">
                No upcoming bookings in the next 14 days
              </span>
            </div>
          )}
        </div>
      )}

      {selected && (
        <Modal title={selected.eventTypeName} onClose={() => setSelected(undefined)}>
          <p className="text-sm">
            {fmtDay(selected.start)}, {fmtTime(selected.start)}–{fmtTime(selected.end)} UTC
          </p>
          <p className="text-sm">
            {selected.guestName} · {selected.guestEmail}
          </p>
          <p className="text-muted-foreground text-xs">
            Bookings are final: nothing to change here.
          </p>
        </Modal>
      )}
      {dialogs}
    </div>
  );
}
