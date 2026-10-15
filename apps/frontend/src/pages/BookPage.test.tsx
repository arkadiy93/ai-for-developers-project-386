import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { deepDive, intro, json, pending, serverError, stubApi, workshop } from '@/test/api';
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

  it('selects an event type when its card is clicked', async () => {
    stubApi({ 'GET /api/event-types': () => json([deepDive, intro]) });
    renderAt('/book');

    const card = await screen.findByRole('button', { name: /Intro call/ });
    expect(card).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(card);

    expect(card).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Deep dive/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
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
