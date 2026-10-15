// PROTOTYPE: three structurally different Guest booking flows on /book. Not production code.
// Question: which screens and states does the Guest flow have? Switch with ?variant=A|B|C&state=...
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  EmptyBox,
  ErrorBox,
  Field,
  Modal,
  Skeleton,
  SlotTakenBanner,
  UtcNote,
} from '@/prototype/bits';
import {
  type EventType,
  type ScreenState,
  fmtDay,
  fmtDuration,
  fmtTime,
  initialBookings,
  initialEventTypes,
  isBusy,
  sameDay,
  slotsFor,
  windowDays,
} from '@/prototype/mock';

type Props = { state: ScreenState };

const eventTypesFor = (state: ScreenState) => (state === 'empty' ? [] : initialEventTypes);

function Confirmation({
  type,
  start,
  onAgain,
}: {
  type: EventType;
  start: Date;
  onAgain: () => void;
}) {
  const end = new Date(start.getTime() + type.durationMinutes * 60000);
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border p-6">
      <p className="text-sm font-medium text-green-700">Booked</p>
      <h2 className="text-xl font-semibold">{type.name}</h2>
      <p>
        {fmtDay(start)}, {fmtTime(start)}–{fmtTime(end)} UTC
      </p>
      <p className="text-muted-foreground text-sm">
        The Owner will see this call in their list. There's nothing else to do.
      </p>
      <Button variant="outline" onClick={onAgain}>
        Book another call
      </Button>
    </div>
  );
}

function GuestForm({
  state,
  onBooked,
  onPickAnother,
  submitLabel = 'Book',
}: {
  state: ScreenState;
  onBooked: () => void;
  onPickAnother: () => void;
  submitLabel?: string;
}) {
  const [taken, setTaken] = useState(false);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (state === 'slot-taken') setTaken(true);
        else onBooked();
      }}
    >
      {taken && <SlotTakenBanner onPickAnother={onPickAnother} />}
      <Field label="Your name" defaultValue="Jamie Park" />
      <Field label="Email" type="email" defaultValue="jamie@example.com" />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}

/* ---------------- A: step-by-step wizard ---------------- */

// Every quarter-hour start in Working Hours where the call still ends by 18:00.
function allStarts(day: Date, durationMinutes: number) {
  const starts: Date[] = [];
  for (let m = 9 * 60; m + durationMinutes <= 18 * 60; m += 15)
    starts.push(new Date(day.getTime() + m * 60000));
  return starts;
}

export function VariantA({ state }: Props) {
  const types = eventTypesFor(state);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [type, setType] = useState<EventType>();
  const [day, setDay] = useState(windowDays[0]);
  const [slot, setSlot] = useState<Date>();
  const steps = ['Call type', 'Time', 'Your details', 'Done'];

  return (
    <div className="flex flex-col gap-6">
      <ol className="flex gap-2 text-sm">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              'rounded-full border px-3 py-1',
              i + 1 === step && 'bg-primary text-primary-foreground',
              i + 1 < step && 'text-muted-foreground line-through',
            )}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">What kind of call?</h2>
          {state === 'loading' && [1, 2, 3].map((i) => <Skeleton key={i} />)}
          {state === 'error' && <ErrorBox what="call types" />}
          {state !== 'loading' && state !== 'error' && types.length === 0 && (
            <EmptyBox
              title="No calls to book yet"
              hint="The Owner hasn't set up any call types. Check back later."
            />
          )}
          {state !== 'loading' &&
            state !== 'error' &&
            types.map((t) => (
              <button
                key={t.id}
                className="hover:bg-muted flex items-start justify-between gap-4 rounded-lg border p-4 text-left"
                onClick={() => {
                  setType(t);
                  setStep(2);
                }}
              >
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-muted-foreground text-sm">{t.description}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-sm">
                  {fmtDuration(t.durationMinutes)}
                </span>
              </button>
            ))}
        </section>
      )}

      {step === 2 && type && (
        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">
              Pick a time for {type.name} ({fmtDuration(type.durationMinutes)})
            </h2>
            <Button variant="link" onClick={() => setStep(1)}>
              Change call type
            </Button>
          </div>
          <UtcNote />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {windowDays.map((d) => {
              const n = slotsFor(d, type.durationMinutes).length;
              return (
                <button
                  key={d.toISOString()}
                  disabled={n === 0}
                  onClick={() => setDay(d)}
                  className={cn(
                    'flex min-w-20 flex-col items-center rounded-lg border px-2 py-2 text-sm disabled:opacity-40',
                    sameDay(d, day) && 'border-primary bg-primary/5',
                  )}
                >
                  <span className="font-medium">{fmtDay(d)}</span>
                  <span className="text-muted-foreground text-xs">{n} free</span>
                </button>
              );
            })}
          </div>
          {state === 'loading' ? (
            <Skeleton className="h-40" />
          ) : state === 'error' ? (
            <ErrorBox what="free times" />
          ) : slotsFor(day, type.durationMinutes).length === 0 ? (
            <EmptyBox title="No free times this day" hint="Try another day." />
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {allStarts(day, type.durationMinutes).map((s) => {
                const free = slotsFor(day, type.durationMinutes).some(
                  (x) => x.getTime() === s.getTime(),
                );
                return (
                  <Button
                    key={s.toISOString()}
                    variant="outline"
                    disabled={!free}
                    title={free ? undefined : 'Not available'}
                    className={cn(!free && 'line-through')}
                    onClick={() => {
                      setSlot(s);
                      setStep(3);
                    }}
                  >
                    {fmtTime(s)}
                  </Button>
                );
              })}
              ))}
            </div>
          )}
        </section>
      )}

      {step === 3 && type && slot && (
        <section className="flex max-w-md flex-col gap-3">
          <h2 className="text-lg font-semibold">Your details</h2>
          <p className="text-muted-foreground text-sm">
            {type.name} · {fmtDay(slot)}, {fmtTime(slot)} UTC ·{' '}
            <button className="underline" onClick={() => setStep(2)}>
              change
            </button>
          </p>
          <GuestForm state={state} onBooked={() => setStep(4)} onPickAnother={() => setStep(2)} />
        </section>
      )}

      {step === 4 && type && slot && (
        <Confirmation type={type} start={slot} onAgain={() => setStep(1)} />
      )}
    </div>
  );
}

/* ---------------- B: one page, everything visible ---------------- */

export function VariantB({ state }: Props) {
  const types = eventTypesFor(state);
  const [type, setType] = useState<EventType | undefined>(types[0]);
  const [day, setDay] = useState(windowDays[0]);
  const [slot, setSlot] = useState<Date>();
  const [done, setDone] = useState(false);

  if (done && type && slot)
    return <Confirmation type={type} start={slot} onAgain={() => setDone(false)} />;
  if (state === 'loading')
    return (
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  if (state === 'error') return <ErrorBox what="call types" />;
  if (types.length === 0)
    return (
      <EmptyBox
        title="No calls to book yet"
        hint="The Owner hasn't set up any call types. Check back later."
      />
    );

  const slots = type ? slotsFor(day, type.durationMinutes) : [];

  return (
    <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
      <aside className="flex flex-col gap-1">
        <h2 className="text-muted-foreground mb-1 text-xs font-semibold uppercase">Call type</h2>
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setType(t);
              setSlot(undefined);
            }}
            className={cn(
              'rounded-lg px-3 py-2 text-left',
              t.id === type?.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            <span className="block font-medium">{t.name}</span>
            <span className="text-xs opacity-80">{fmtDuration(t.durationMinutes)}</span>
          </button>
        ))}
        {type && <p className="text-muted-foreground mt-3 text-sm">{type.description}</p>}
      </aside>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Next 14 days</h2>
          <UtcNote />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {windowDays.map((d) => {
            const n = type ? slotsFor(d, type.durationMinutes).length : 0;
            return (
              <button
                key={d.toISOString()}
                disabled={n === 0}
                onClick={() => {
                  setDay(d);
                  setSlot(undefined);
                }}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center rounded-lg border text-sm disabled:opacity-30',
                  sameDay(d, day) && 'border-primary bg-primary/10',
                )}
              >
                <span className="text-xs">{fmtDay(d).split(' ')[0]}</span>
                <span className="text-lg font-semibold">{d.getUTCDate()}</span>
                <span className="text-muted-foreground text-[10px]">
                  {n ? `${n} free` : 'full'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            <h3 className="text-sm font-medium">{fmtDay(day)}</h3>
            {slots.length === 0 && (
              <p className="text-muted-foreground text-sm">No free times this day.</p>
            )}
            {slots.map((s) => (
              <Button
                key={s.toISOString()}
                variant={slot?.getTime() === s.getTime() ? 'default' : 'outline'}
                onClick={() => setSlot(s)}
              >
                {fmtTime(s)}
              </Button>
            ))}
          </div>
          <div>
            {slot && type ? (
              <div className="flex flex-col gap-3 rounded-lg border p-4">
                <p className="text-sm">
                  <span className="font-medium">{type.name}</span> · {fmtDay(slot)}, {fmtTime(slot)}{' '}
                  UTC
                </p>
                <GuestForm
                  state={state}
                  submitLabel="Confirm booking"
                  onBooked={() => setDone(true)}
                  onPickAnother={() => setSlot(undefined)}
                />
              </div>
            ) : (
              <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                Pick a time to enter your details.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- C: week calendar grid ---------------- */

export function VariantC({ state }: Props) {
  const types = eventTypesFor(state);
  const [type, setType] = useState<EventType | undefined>(types[0]);
  const [week, setWeek] = useState<0 | 1>(0);
  const [slot, setSlot] = useState<Date>();
  const [done, setDone] = useState(false);

  if (state === 'error') return <ErrorBox what="the calendar" />;
  if (state !== 'loading' && types.length === 0)
    return (
      <EmptyBox
        title="No calls to book yet"
        hint="The Owner hasn't set up any call types. Check back later."
      />
    );

  const days = windowDays.slice(week * 7, week * 7 + 7);
  const rows = Array.from({ length: 36 }, (_, i) => 9 * 60 + i * 15);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="border-input rounded-lg border bg-transparent px-2.5 py-1.5 text-sm"
          value={type?.id}
          onChange={(e) => setType(types.find((t) => t.id === e.target.value))}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {fmtDuration(t.durationMinutes)}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <UtcNote />
          <Button variant="outline" size="sm" disabled={week === 0} onClick={() => setWeek(0)}>
            ← This week
          </Button>
          <Button variant="outline" size="sm" disabled={week === 1} onClick={() => setWeek(1)}>
            Next week →
          </Button>
        </div>
      </div>

      {state === 'loading' ? (
        <Skeleton className="h-[32rem]" />
      ) : (
        <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] overflow-hidden rounded-lg border text-xs">
          <div />
          {days.map((d) => (
            <div key={d.toISOString()} className="border-l p-1 text-center font-medium">
              {fmtDay(d)}
            </div>
          ))}
          {rows.map((m) => (
            <Row key={m} minutes={m} days={days} type={type!} onPick={setSlot} />
          ))}
        </div>
      )}

      {slot && type && (
        <Modal
          title={done ? 'Booked' : `Book ${type.name}`}
          onClose={() => (setSlot(undefined), setDone(false))}
        >
          {done ? (
            <Confirmation
              type={type}
              start={slot}
              onAgain={() => (setSlot(undefined), setDone(false))}
            />
          ) : (
            <>
              <p className="text-sm">
                {fmtDay(slot)}, {fmtTime(slot)}–
                {fmtTime(new Date(slot.getTime() + type.durationMinutes * 60000))} UTC
              </p>
              <GuestForm
                state={state}
                onBooked={() => setDone(true)}
                onPickAnother={() => setSlot(undefined)}
              />
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

function Row({
  minutes,
  days,
  type,
  onPick,
}: {
  minutes: number;
  days: Date[];
  type: EventType;
  onPick: (d: Date) => void;
}) {
  const label = minutes % 60 === 0 ? `${String(minutes / 60).padStart(2, '0')}:00` : '';
  return (
    <>
      <div className="text-muted-foreground border-t px-1 text-right leading-5">{label}</div>
      {days.map((d) => {
        const start = new Date(d.getTime() + minutes * 60000);
        const free = slotsFor(d, type.durationMinutes, initialBookings).some(
          (s) => s.getTime() === start.getTime(),
        );
        const busy = isBusy(start);
        return (
          <button
            key={d.toISOString()}
            disabled={!free}
            onClick={() => onPick(start)}
            title={free ? `${fmtTime(start)} UTC` : busy ? 'Booked' : 'Unavailable'}
            className={cn(
              'h-5 border-t border-l',
              free && 'hover:bg-primary/30 bg-green-50',
              busy && 'bg-muted-foreground/30',
            )}
          />
        );
      })}
    </>
  );
}
