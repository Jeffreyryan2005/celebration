import { formatCurrency, daysUntilEvent, createEmptyPlan } from '@/lib/storage';

describe('formatCurrency', () => {
  it('formats USD amounts correctly', () => {
    expect(formatCurrency(10000)).toBe('$10,000');
    expect(formatCurrency(500)).toBe('$500');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles large amounts', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000');
  });
});

describe('daysUntilEvent', () => {
  it('returns 0 for empty date', () => {
    expect(daysUntilEvent('')).toBe(0);
  });

  it('returns positive days for future events', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const result = daysUntilEvent(future.toISOString());
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(30);
  });

  it('returns negative days for past events', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const result = daysUntilEvent(past.toISOString());
    expect(result).toBeLessThan(0);
  });
});

describe('createEmptyPlan', () => {
  it('creates a plan with default values', () => {
    const plan = createEmptyPlan({ type: 'wedding', name: 'Test Wedding' });
    expect(plan.event.type).toBe('wedding');
    expect(plan.event.name).toBe('Test Wedding');
    expect(plan.budget).toEqual([]);
    expect(plan.timeline).toEqual([]);
    expect(plan.vendors).toEqual([]);
    expect(plan.ideas).toEqual([]);
    expect(plan.chatHistory).toEqual([]);
    expect(plan.event.id).toBeTruthy();
  });

  it('uses default values for missing fields', () => {
    const plan = createEmptyPlan({});
    expect(plan.event.name).toBe('My Event');
    expect(plan.event.type).toBe('birthday');
    expect(plan.event.guestCount).toBe(50);
    expect(plan.event.totalBudget).toBe(10000);
  });

  it('generates unique IDs', () => {
    const plan1 = createEmptyPlan({ name: 'Event 1' });
    const plan2 = createEmptyPlan({ name: 'Event 2' });
    expect(plan1.event.id).not.toBe(plan2.event.id);
  });
});
