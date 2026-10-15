import { type FormEvent, type ReactNode, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { api, type EventTypeInput } from '@/lib/api';
import { durations, formatDuration } from '@/lib/duration';

type Field = keyof EventTypeInput;
type FieldErrors = Partial<Record<Field, string>>;

const fields: Field[] = ['name', 'description', 'durationMinutes'];
const failed = "Couldn't create the event type. Please try again.";

// Paths are JSON pointers into the body, for example `/name`. Undefined if any isn't a form field.
function toFieldErrors(details: { path: string; message: string }[]): FieldErrors | undefined {
  const errors: FieldErrors = {};
  for (const { path, message } of details) {
    const field = fields.find((f) => path === `/${f}`);
    if (!field) return undefined;
    errors[field] = message;
  }
  return errors;
}

interface NewEventTypeFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

/** The inline form behind the "+ New event type" card. */
export function NewEventTypeForm({ onCreated, onCancel }: NewEventTypeFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    setFormError(undefined);
    try {
      const { data, error } = await api.POST('/event-types', {
        body: { name, description, durationMinutes },
      });
      if (data) {
        onCreated();
        return;
      }
      const errors = error?.details?.length ? toFieldErrors(error.details) : undefined;
      if (errors) {
        setFieldErrors(errors);
      } else {
        setFormError(failed);
      }
    } catch {
      setFormError(failed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="New event type"
      className="ring-foreground/10 flex flex-col gap-3 rounded-xl p-3 ring-1"
    >
      <Field label="Name" error={fieldErrors.name}>
        {(props) => (
          <Input
            {...props}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
          />
        )}
      </Field>
      <Field label="Description" error={fieldErrors.description}>
        {(props) => (
          <Textarea
            {...props}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        )}
      </Field>
      <Field label="Duration" error={fieldErrors.durationMinutes}>
        {(props) => (
          <NativeSelect
            {...props}
            className="w-full"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
          >
            {durations.map((minutes) => (
              <NativeSelectOption key={minutes} value={minutes}>
                {formatDuration(minutes)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </Field>
      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          Create
        </Button>
      </div>
    </form>
  );
}

interface ControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
