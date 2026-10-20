/**
 * Extended storage tests — localStorage operations, plan CRUD
 */
import { formatCurrency, daysUntilEvent, createEmptyPlan, savePlan, loadPlans } from '@/lib/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('formatCurrency: edge cases', () => {
  it('formats decimal amounts by rounding to nearest dollar', () => {
    expect(formatCurrency(1234.99)).toBe('$1,235');
  });

  it('formats small amounts', () => {
    expect(formatCurrency(1)).toBe('$1');
  });

  it('formats exactly $100', () => {
    expect(formatCurrency(100)).toBe('$100');
  });
});

describe('daysUntilEvent: more scenarios', () => {
  it('returns approximately 365 for an event 1 year out', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = daysUntilEvent(future.toISOString());
    expect(result).toBeGreaterThanOrEqual(364);
    expect(result).toBeLessThanOrEqual(366);
  });

  it('returns approximately 7 for a week away', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    const result = daysUntilEvent(future.toISOString());
    expect(result).toBeGreaterThanOrEqual(6);
    expect(result).toBeLessThanOrEqual(7);
  });
});

describe('createEmptyPlan: all event types', () => {
  const types = ['wedding', 'birthday', 'corporate', 'community', 'anniversary', 'graduation'] as const;

  types.forEach((type) => {
    it(`creates a valid ${type} plan`, () => {
      const plan = createEmptyPlan({ type, name: `Test ${type}` });
      expect(plan.event.type).toBe(type);
      expect(plan.event.id).toBeTruthy();
      expect(plan.budget).toEqual([]);
      expect(plan.timeline).toEqual([]);
    });
  });

  it('stores custom guestCount', () => {
    const plan = createEmptyPlan({ type: 'wedding', name: 'Test', guestCount: 200 });
    expect(plan.event.guestCount).toBe(200);
  });

  it('stores custom totalBudget', () => {
    const plan = createEmptyPlan({ type: 'birthday', name: 'Test', totalBudget: 5000 });
    expect(plan.event.totalBudget).toBe(5000);
  });

  it('stores theme when provided', () => {
    const plan = createEmptyPlan({ type: 'birthday', name: 'Test', theme: 'Garden' });
    expect(plan.event.theme).toBe('Garden');
  });
});

describe('savePlan and loadPlans: localStorage persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('saves and reloads a plan', () => {
    const plan = createEmptyPlan({ type: 'wedding', name: 'Persist Test' });
    savePlan(plan);
    const loaded = loadPlans();
    const found = loaded.find((p) => p.event.id === plan.event.id);
    expect(found).toBeDefined();
    expect(found?.event.name).toBe('Persist Test');
  });

  it('returns empty array when localStorage is empty', () => {
    const plans = loadPlans();
    expect(Array.isArray(plans)).toBe(true);
  });

  it('saves multiple plans without overwriting', () => {
    const plan1 = createEmptyPlan({ type: 'wedding', name: 'Plan Alpha' });
    const plan2 = createEmptyPlan({ type: 'birthday', name: 'Plan Beta' });
    savePlan(plan1);
    savePlan(plan2);
    const loaded = loadPlans();
    expect(loaded.length).toBeGreaterThanOrEqual(2);
  });

  it('updates existing plan when saved again with same id', () => {
    const plan = createEmptyPlan({ type: 'corporate', name: 'Original Name' });
    savePlan(plan);
    const updated = { ...plan, event: { ...plan.event, name: 'Updated Name' } };
    savePlan(updated);
    const loaded = loadPlans();
    const found = loaded.find((p) => p.event.id === plan.event.id);
    expect(found?.event.name).toBe('Updated Name');
  });
});
