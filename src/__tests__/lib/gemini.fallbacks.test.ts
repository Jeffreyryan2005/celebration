/**
 * Unit tests for Gemini fallback generators: getFallbackBudget, getFallbackTimeline, getFallbackIdeas
 * Ensures 100% test coverage and resilience under quota or network restrictions.
 */
import { getFallbackBudget, getFallbackTimeline, getFallbackIdeas } from '@/lib/gemini';
import { EventDetails } from '@/types';

describe('getFallbackBudget', () => {
  const baseEvent: EventDetails = {
    id: 'evt-test-1',
    name: 'Sample Wedding',
    type: 'wedding',
    date: '2027-08-20',
    venue: 'Sunset Gardens',
    guestCount: 120,
    totalBudget: 30000,
    theme: 'Romantic Sunset',
    description: 'A beautiful evening celebration',
  };

  it('generates budget line items for wedding', () => {
    const budget = getFallbackBudget(baseEvent);
    expect(Array.isArray(budget)).toBe(true);
    expect(budget.length).toBeGreaterThan(0);
    const sum = budget.reduce((acc, item) => acc + (item.estimated || 0), 0);
    // Total sum should match or be within 5% of total budget due to rounding
    expect(sum).toBeGreaterThanOrEqual(28500);
    expect(sum).toBeLessThanOrEqual(31500);
  });

  it('generates budget line items for birthday', () => {
    const birthdayEvent: EventDetails = { ...baseEvent, type: 'birthday', totalBudget: 5000 };
    const budget = getFallbackBudget(birthdayEvent);
    expect(budget.length).toBeGreaterThan(0);
    budget.forEach((item) => {
      expect(item.category).toBeDefined();
      expect(item.estimated).toBeGreaterThan(0);
      expect(item.actual).toBe(0);
    });
  });

  it('generates budget line items for corporate event', () => {
    const corporateEvent: EventDetails = { ...baseEvent, type: 'corporate', totalBudget: 50000 };
    const budget = getFallbackBudget(corporateEvent);
    expect(budget.length).toBeGreaterThan(0);
  });

  it('generates budget line items for community event', () => {
    const communityEvent: EventDetails = { ...baseEvent, type: 'community', totalBudget: 15000 };
    const budget = getFallbackBudget(communityEvent);
    expect(budget.length).toBeGreaterThan(0);
  });

  it('handles default budget when totalBudget is 0 or undefined', () => {
    const zeroEvent = { ...baseEvent, totalBudget: 0 } as EventDetails;
    const budget = getFallbackBudget(zeroEvent);
    expect(budget.length).toBeGreaterThan(0);
  });
});

describe('getFallbackTimeline', () => {
  const baseEvent: EventDetails = {
    id: 'evt-test-2',
    name: 'Emma 21st Birthday',
    type: 'birthday',
    date: '2027-05-10',
    venue: 'Rooftop Lounge',
    guestCount: 60,
    totalBudget: 8000,
    theme: 'Neon Night',
    description: '21st birthday bash',
  };

  it('generates chronologically scheduled timeline milestones', () => {
    const timeline = getFallbackTimeline(baseEvent);
    expect(Array.isArray(timeline)).toBe(true);
    expect(timeline.length).toBe(8);
  });

  it('includes venue, catering, and day-of tasks', () => {
    const timeline = getFallbackTimeline(baseEvent);
    const titles = timeline.map((t) => t.title);
    expect(titles.some((t) => /venue/i.test(t || ''))).toBe(true);
    expect(titles.some((t) => /cater/i.test(t || ''))).toBe(true);
    expect(titles.some((t) => /day-of/i.test(t || ''))).toBe(true);
  });

  it('assigns valid priority to every task', () => {
    const timeline = getFallbackTimeline(baseEvent);
    timeline.forEach((item) => {
      expect(['high', 'medium', 'low']).toContain(item.priority);
      expect(item.description).toBeTruthy();
      expect(item.dueDate).toBeTruthy();
    });
  });
});

describe('getFallbackIdeas', () => {
  const baseEvent: EventDetails = {
    id: 'evt-test-3',
    name: 'Harvest Community Fair',
    type: 'community',
    date: '2027-10-15',
    venue: 'Town Square',
    guestCount: 350,
    totalBudget: 20000,
    theme: 'Autumn Splendor',
    description: 'Annual gathering',
  };

  it('generates 8 creative ideas', () => {
    const ideas = getFallbackIdeas(baseEvent);
    expect(Array.isArray(ideas)).toBe(true);
    expect(ideas.length).toBe(8);
  });

  it('includes the event theme in ideas', () => {
    const ideas = getFallbackIdeas(baseEvent);
    const text = ideas.join(' ');
    expect(text).toContain('Autumn Splendor');
    expect(text).toContain('community');
  });

  it('handles events without specified theme gracefully', () => {
    const noThemeEvent: EventDetails = { ...baseEvent, theme: '' };
    const ideas = getFallbackIdeas(noThemeEvent);
    expect(ideas.length).toBe(8);
    expect(ideas.every((i) => typeof i === 'string' && i.length > 10)).toBe(true);
  });
});
