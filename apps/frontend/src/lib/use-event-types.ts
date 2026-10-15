import { useCallback, useEffect, useState } from 'react';
import { api, type EventType } from '@/lib/api';

type State =
  { status: 'loading' } | { status: 'error' } | { status: 'ready'; eventTypes: EventType[] };

/** Loads the Event Types, sorted by name by the server. */
export function useEventTypes() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    api.GET('/event-types').then(
      ({ data }) => {
        if (active) setState(data ? { status: 'ready', eventTypes: data } : { status: 'error' });
      },
      () => {
        if (active) setState({ status: 'error' });
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  // A retry after an error shows the placeholders again; a refresh of a loaded list doesn't.
  const reload = useCallback(() => {
    setState((current) => (current.status === 'error' ? { status: 'loading' } : current));
    setAttempt((n) => n + 1);
  }, []);

  return { state, reload };
}
