import { useState } from 'react';
import { EventTypeStep } from '@/components/EventTypeStep';
import { StepIndicator } from '@/components/StepIndicator';
import type { EventType } from '@/lib/api';

export function BookPage() {
  const [eventType, setEventType] = useState<EventType>();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">Book a call</h1>
      <StepIndicator current={1} />
      <EventTypeStep selectedId={eventType?.id} onSelect={setEventType} />
    </main>
  );
}
