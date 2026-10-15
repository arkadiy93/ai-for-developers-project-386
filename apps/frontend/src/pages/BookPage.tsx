import { useState } from 'react';
import { EventTypeStep } from '@/components/EventTypeStep';
import { StepIndicator } from '@/components/StepIndicator';
import { TimeStep } from '@/components/TimeStep';
import type { EventType } from '@/lib/api';

type Wizard =
  | { step: 1; eventType?: EventType }
  | { step: 2; eventType: EventType }
  | { step: 3; eventType: EventType; start: string };

export function BookPage() {
  const [wizard, setWizard] = useState<Wizard>({ step: 1 });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">Book a call</h1>
      <StepIndicator current={wizard.step} />
      {wizard.step === 1 && (
        <EventTypeStep
          selectedId={wizard.eventType?.id}
          onSelect={(eventType) => setWizard({ step: 2, eventType })}
        />
      )}
      {wizard.step === 2 && (
        <TimeStep
          eventType={wizard.eventType}
          onChangeEventType={() => setWizard({ step: 1, eventType: wizard.eventType })}
          onSelect={(start) => setWizard({ step: 3, eventType: wizard.eventType, start })}
        />
      )}
    </main>
  );
}
