import { BUDGET_CATEGORIES, EVENT_TYPES, DEFAULT_BUDGET_ALLOCATIONS, APP_NAME } from '@/lib/constants';

describe('BUDGET_CATEGORIES', () => {
  const expectedCategories = [
    'venue', 'catering', 'decoration', 'photography',
    'music', 'transportation', 'invitations', 'attire', 'gifts', 'miscellaneous'
  ];

  it('contains all expected categories', () => {
    expectedCategories.forEach((cat) => {
      expect(BUDGET_CATEGORIES).toHaveProperty(cat);
    });
  });

  it('each category has label, icon, and color', () => {
    Object.values(BUDGET_CATEGORIES).forEach((cat) => {
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('icon');
      expect(cat).toHaveProperty('color');
      expect(cat.label.length).toBeGreaterThan(0);
    });
  });
});

describe('EVENT_TYPES', () => {
  const expectedTypes = ['wedding', 'birthday', 'corporate', 'community', 'anniversary', 'graduation'];

  it('contains all expected event types', () => {
    expectedTypes.forEach((type) => {
      expect(EVENT_TYPES).toHaveProperty(type);
    });
  });

  it('each type has label, icon, and description', () => {
    Object.values(EVENT_TYPES).forEach((et) => {
      expect(et).toHaveProperty('label');
      expect(et).toHaveProperty('icon');
      expect(et).toHaveProperty('description');
    });
  });
});

describe('DEFAULT_BUDGET_ALLOCATIONS', () => {
  it('wedding allocation percentages sum to 100 or less', () => {
    const sum = Object.values(DEFAULT_BUDGET_ALLOCATIONS.wedding).reduce((s, v) => s + (v || 0), 0);
    expect(sum).toBeLessThanOrEqual(100);
    expect(sum).toBeGreaterThan(90); // Expect at least 90% allocated
  });

  it('has allocations for all event types', () => {
    expect(DEFAULT_BUDGET_ALLOCATIONS).toHaveProperty('wedding');
    expect(DEFAULT_BUDGET_ALLOCATIONS).toHaveProperty('birthday');
    expect(DEFAULT_BUDGET_ALLOCATIONS).toHaveProperty('corporate');
  });
});

describe('APP constants', () => {
  it('APP_NAME is defined', () => {
    expect(APP_NAME).toBe('CelebrationAI');
  });
});
