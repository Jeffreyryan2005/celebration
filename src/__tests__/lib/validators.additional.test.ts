/**
 * Extended validators tests — boundary conditions and edge cases
 */
import {
  sanitizeString,
  EventDetailsSchema,
  ChatRequestSchema,
  GenerateRequestSchema,
  BudgetItemSchema,
  TimelineItemSchema,
  EventTypeEnum,
} from '@/lib/validators';

describe('sanitizeString: advanced edge cases', () => {
  it('preserves normal text untouched', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
  });

  it('handles numbers converted to string', () => {
    expect(sanitizeString('12345')).toBe('12345');
  });

  it('strips onclick attributes (event injection)', () => {
    const input = '<button onclick="alert(1)">Click Me</button>';
    expect(sanitizeString(input)).not.toContain('onclick');
    expect(sanitizeString(input)).not.toContain('<button');
  });

  it('strips img onerror XSS vector', () => {
    const input = '<img src="x" onerror="evil()">';
    expect(sanitizeString(input)).not.toContain('<img');
  });

  it('handles nested malicious tags', () => {
    const input = '<div><p><script>alert(1)</script>Safe Text</p></div>';
    const result = sanitizeString(input);
    expect(result).toContain('Safe Text');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<div>');
  });

  it('handles unicode and special characters gracefully', () => {
    const input = '🎉 Celebration! naïve café résumé';
    expect(sanitizeString(input)).toBe('🎉 Celebration! naïve café résumé');
  });

  it('handles ampersands in event names', () => {
    const result = sanitizeString('Sarah & Tom');
    expect(result).toBe('Sarah & Tom');
  });

  it('trims multiline whitespace', () => {
    const result = sanitizeString('  Hello  ');
    expect(result).toBe('Hello');
  });
});

describe('EventDetailsSchema: boundary validation', () => {
  it('accepts minimum required fields (id + name + type)', () => {
    const result = EventDetailsSchema.safeParse({
      id: 'e1',
      name: 'Test',
      type: 'birthday',
    });
    expect(result.success).toBe(true);
  });

  it('rejects guestCount of 0', () => {
    const result = EventDetailsSchema.safeParse({
      id: 'e1',
      name: 'Test',
      type: 'wedding',
      guestCount: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative totalBudget', () => {
    const result = EventDetailsSchema.safeParse({
      id: 'e1',
      name: 'Test',
      type: 'birthday',
      totalBudget: -100,
    });
    expect(result.success).toBe(false);
  });

  it('accepts all supported event types', () => {
    const types = ['wedding', 'birthday', 'corporate', 'community', 'anniversary', 'graduation'];
    for (const type of types) {
      const result = EventDetailsSchema.safeParse({ id: 'e1', name: 'Test', type });
      expect(result.success).toBe(true);
    }
  });

  it('sanitizes description field as well', () => {
    const result = EventDetailsSchema.safeParse({
      id: 'e1',
      name: 'Test',
      type: 'birthday',
      description: '<script>evil()</script>Clean description',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).not.toContain('<script>');
    }
  });
});

describe('BudgetItemSchema: boundary validation', () => {
  it('rejects negative estimated amount', () => {
    const result = BudgetItemSchema.safeParse({
      category: 'catering',
      name: 'Dinner',
      estimated: -500,
    });
    expect(result.success).toBe(false);
  });

  it('accepts item without actual amount', () => {
    const result = BudgetItemSchema.safeParse({
      category: 'venue',
      name: 'Event Hall',
      estimated: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown category', () => {
    const result = BudgetItemSchema.safeParse({
      category: 'fireworks',
      name: 'Grand Finale',
      estimated: 3000,
    });
    expect(result.success).toBe(false);
  });
});

describe('TimelineItemSchema: boundary validation', () => {
  it('rejects unknown priority value', () => {
    const result = TimelineItemSchema.safeParse({
      title: 'Book Venue',
      priority: 'urgent',
      completed: false,
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid priority values', () => {
    for (const priority of ['high', 'medium', 'low']) {
      const result = TimelineItemSchema.safeParse({
        title: 'Test Task',
        priority,
        completed: false,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts completed=true timeline items', () => {
    const result = TimelineItemSchema.safeParse({
      title: 'Send invitations',
      priority: 'high',
      completed: true,
    });
    expect(result.success).toBe(true);
  });
});

describe('ChatRequestSchema: advanced validation', () => {
  it('accepts model role in messages', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] },
      ],
      event: { id: 'e1', name: 'Test', type: 'birthday' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid role in messages', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'system', parts: [{ text: 'Hello' }] }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects messages with empty text parts', () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: 'user', parts: [{ text: '' }] }],
    });
    expect(result.success).toBe(false);
  });
});

describe('EventTypeEnum: complete coverage', () => {
  it('accepts anniversary type', () => {
    expect(EventTypeEnum.safeParse('anniversary').success).toBe(true);
  });

  it('accepts graduation type', () => {
    expect(EventTypeEnum.safeParse('graduation').success).toBe(true);
  });

  it('rejects empty string', () => {
    expect(EventTypeEnum.safeParse('').success).toBe(false);
  });

  it('rejects null', () => {
    expect(EventTypeEnum.safeParse(null).success).toBe(false);
  });

  it('rejects undefined', () => {
    expect(EventTypeEnum.safeParse(undefined).success).toBe(false);
  });
});
