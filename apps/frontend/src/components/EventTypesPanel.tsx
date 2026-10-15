import { useId, useState } from 'react';
import { LoadError } from '@/components/LoadError';
import { NewEventTypeForm } from '@/components/NewEventTypeForm';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/duration';
import { useEventTypes } from '@/lib/use-event-types';

/** The Admin side panel where the Owner manages Event Types. */
export function EventTypesPanel() {
  const headingId = useId();
  const { state, reload } = useEventTypes();
  const [creating, setCreating] = useState(false);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-lg font-semibold">
        Event types
      </h2>

      {state.status === 'loading' && (
        <div role="status" aria-label="Loading event types" className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <LoadError message="Couldn't load event types." onRetry={reload} />
      )}

      {state.status === 'ready' && (
        <>
          {state.data.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              None yet. Guests see an empty booking page.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {state.data.map((eventType) => (
                <li
                  key={eventType.id}
                  className="bg-card ring-foreground/10 flex items-baseline justify-between gap-2 rounded-xl p-3 text-sm ring-1"
                >
                  <span className="font-medium">{eventType.name}</span>
                  <span className="text-muted-foreground shrink-0">
                    {formatDuration(eventType.durationMinutes)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {creating ? (
            <NewEventTypeForm
              onCreated={() => {
                setCreating(false);
                reload();
              }}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="text-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-ring/50 rounded-xl border border-dashed p-3 text-sm outline-none focus-visible:ring-3"
            >
              + New event type
            </button>
          )}
        </>
      )}
    </section>
  );
}
