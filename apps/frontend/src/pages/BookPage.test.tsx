import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  deepDive,
  intro,
  json,
  pending,
  serverError,
  stubApi,
  workshop,
  workshopSlots,
} from '@/test/api';
import { renderAt } from '@/test/render';

describe('booking page, step 1: event type', () => {
  it('lists every event type with its name, description and duration', async () => {
    stubApi({ 'GET /api/event-types': () => json([deepDive, intro, workshop]) });
    renderAt('/book');

    const list = await screen.findByRole('list', { name: 'Event types' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Deep dive');
    expect(items[1]).toHaveTextContent('Intro call');
    expect(items[2]).toHaveTextContent('Workshop');
    expect(within(items[0]).getByText('Walk through your project in detail.')).toBeInTheDocument();
    expect(within(items[0]).getByText('1 h 30 min')).toBeInTheDocument();
    expect(within(items[1]).getByText('15 min')).toBeInTheDocument();
    expect(within(items[2]).getByText('1 h')).toBeInTheDocument();
  });

  it('shows the four wizard steps with step 1 active', async () => {
    stubApi({ 'GET /api/event-types': () => json([intro]) });
    renderAt('/book');

    const steps = await screen.findByRole('list', { name: 'Booking steps' });
    expect(
      within(steps)
        .getAllByRole('listitem')
        .map((step) => step.textContent),
    ).toEqual(['1. Event type', '2. Time', '3. Your details', '4. Done']);
    expect(within(steps).getByText('1. Event type')).toHaveAttribute('aria-current', 'step');
  });

  it('explains that there is nothing to book when there are no event types', async () => {
    stubApi({ 'GET /api/event-types': () => json([]) });
    renderAt('/book');

    expect(await screen.findByText('No calls to book yet.')).toBeInTheDocument();
    expect(
      screen.getByText("The Owner hasn't set up any event types. Check back later."),
    ).toBeInTheDocument();
  });

  it('shows placeholders while the event types load', async () => {
    stubApi({ 'GET /api/event-types': pending });
    renderAt('/book');

    expect(await screen.findByRole('status', { name: 'Loading event types' })).toBeInTheDocument();
  });

  it('shows an error with Retry when loading fails, and loads again on Retry', async () => {
    let fail = true;
    stubApi({
      'GET /api/event-types': () => (fail ? json(serverError, 500) : json([intro])),
    });
    renderAt('/book');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load event types.");
    fail = false;
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('button', { name: /Intro call/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('booking page, step 2: time', () => {
  const slotsRoute = `GET /api/event-types/${workshop.id}/slots`;

  async function pickWorkshop() {
    renderAt('/book');
    await userEvent.click(await screen.findByRole('button', { name: /Workshop/ }));
  }

  it('moves to step 2 for the chosen event type, saying times are UTC', async () => {
    stubApi({
      'GET /api/event-types': () => json([intro, workshop]),
      [slotsRoute]: () => json(workshopSlots),
    });
    await pickWorkshop();

    expect(
      await screen.findByRole('heading', { name: 'Pick a time for Workshop (1 h)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('All times are UTC.')).toBeInTheDocument();
    expect(screen.getByText('2. Time')).toHaveAttribute('aria-current', 'step');
  });

  it('shows the days with their free counts, disables full days and preselects the first free one', async () => {
    stubApi({
      'GET /api/event-types': () => json([workshop]),
      [slotsRoute]: () => json(workshopSlots),
    });
    await pickWorkshop();

    const days = within(await screen.findByRole('list', { name: 'Days' })).getAllByRole('button');
    expect(days.map((day) => day.textContent)).toEqual([
      'Thu, Oct 150 free',
      'Fri, Oct 162 free',
      'Sat, Oct 171 free',
    ]);
    expect(days[0]).toBeDisabled();
    expect(days[1]).toBeEnabled();
    expect(days[1]).toHaveAttribute('aria-pressed', 'true');
    expect(days[2]).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows every start of the selected day, with unavailable ones disabled', async () => {
    stubApi({
      'GET /api/event-types': () => json([workshop]),
      [slotsRoute]: () => json(workshopSlots),
    });
    await pickWorkshop();

    const grid = await screen.findByRole('list', { name: 'Start times' });
    const starts = within(grid).getAllByRole('button');
    expect(starts.map((start) => start.textContent)).toEqual(['09:00', '09:15', '09:30']);
    expect(starts[0]).toBeEnabled();
    expect(starts[1]).toBeDisabled();
    expect(starts[2]).toBeEnabled();

    await userEvent.click(screen.getByRole('button', { name: /Sat, Oct 17/ }));

    const after = within(screen.getByRole('list', { name: 'Start times' })).getAllByRole('button');
    expect(after.map((start) => start.textContent)).toEqual(['09:00', '09:15']);
    expect(after[0]).toBeDisabled();
    expect(after[1]).toBeEnabled();
  });

  it('moves to step 3 when an available start is clicked', async () => {
    stubApi({
      'GET /api/event-types': () => json([workshop]),
      [slotsRoute]: () => json(workshopSlots),
    });
    await pickWorkshop();

    await userEvent.click(await screen.findByRole('button', { name: '09:30' }));

    expect(screen.getByText('3. Your details')).toHaveAttribute('aria-current', 'step');
  });

  it('goes back to step 1 with the event type still selected on "Change event type"', async () => {
    stubApi({
      'GET /api/event-types': () => json([intro, workshop]),
      [slotsRoute]: () => json(workshopSlots),
    });
    await pickWorkshop();

    await userEvent.click(await screen.findByRole('button', { name: 'Change event type' }));

    expect(await screen.findByRole('button', { name: /Workshop/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Intro call/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByText('1. Event type')).toHaveAttribute('aria-current', 'step');
  });

  it('shows placeholders while the free times load', async () => {
    stubApi({ 'GET /api/event-types': () => json([workshop]), [slotsRoute]: pending });
    await pickWorkshop();

    expect(await screen.findByRole('status', { name: 'Loading free times' })).toBeInTheDocument();
  });

  it('shows an error with Retry when loading fails, and loads again on Retry', async () => {
    let fail = true;
    stubApi({
      'GET /api/event-types': () => json([workshop]),
      [slotsRoute]: () => (fail ? json(serverError, 500) : json(workshopSlots)),
    });
    await pickWorkshop();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Couldn't load free times.");
    fail = false;
    await userEvent.click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('list', { name: 'Start times' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
