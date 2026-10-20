import {
  sanitizeString,
  EventTypeEnum,
  BudgetCategoryEnum,
  EventDetailsSchema,
  ChatMessageSchema,
  ChatRequestSchema,
  GenerateRequestSchema,
  BudgetItemSchema,
  TimelineItemSchema,
} from '@/lib/validators';

describe('Validators: sanitizeString', () => {
  it('strips HTML script tags', () => {
    const input = 'Hello <script>alert("xss")</script>world';
    expect(sanitizeString(input)).toBe('Hello alert("xss")world');
  });

  it('strips complex nested HTML tags', () => {
    const input = '<div class="alert"><p><b>Bold</b> text</p></div>';
    expect(sanitizeString(input)).toBe('Bold text');
  });

  it('trims leading and trailing whitespace', () => {
    const input = '   Surrounded by spaces   ';
    expect(sanitizeString(input)).toBe('Surrounded by spaces');
  });

  it('handles empty or null string gracefully', () => {
    expect(sanitizeString('')).toBe('');
  });
});

describe('Validators: EventTypeEnum', () => {
  it('accepts valid event types', () => {
    const valid = ['wedding', 'birthday', 'corporate', 'community', 'anniversary', 'graduation'];
    valid.forEach((t) => {
      expect(EventTypeEnum.safeParse(t).success).toBe(true);
    });
  });

  it('rejects invalid event types', () => {
    expect(EventTypeEnum.safeParse('invalid_party').success).toBe(false);
    expect(EventTypeEnum.safeParse(123).success).toBe(false);
  });
});

describe('Validators: BudgetCategoryEnum', () => {
  it('accepts all 10 core event categories', () => {
    const valid = [
      'venue', 'catering', 'decoration', 'photography', 'music',
      'transportation', 'invitations', 'attire', 'gifts', 'miscellaneous'
    ];
    valid.forEach((cat) => {
      expect(BudgetCategoryEnum.safeParse(cat).success).toBe(true);
    });
  });

  it('rejects non-existent categories', () => {
    expect(BudgetCategoryEnum.safeParse('spaceships').success).toBe(false);
  });
});

describe('Validators: EventDetailsSchema', () => {
  it('validates a complete event details object', () => {
    const validEvent = {
      id: 'event-123',
      name: "Emma's Sweet 16",
      type: 'birthday',
      date: '2026-11-20',
      venue: 'Skyline Terrace',
      guestCount: 75,
      totalBudget: 8500,
      theme: 'Neon Glow',
      description: 'An unforgettable birthday celebration',
    };
    const result = EventDetailsSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Emma's Sweet 16");
      expect(result.data.guestCount).toBe(75);
    }
  });

  it('sanitizes malicious input in name and theme', () => {
    const dirtyEvent = {
      id: 'event-456',
      name: '<script>evil()</script>Sarah & Tom Wedding',
      type: 'wedding',
      theme: '<b>Boho</b> Chic',
    };
    const result = EventDetailsSchema.safeParse(dirtyEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('evil()Sarah & Tom Wedding');
      expect(result.data.theme).toBe('Boho Chic');
    }
  });

  it('fails if id or name is missing', () => {
    expect(EventDetailsSchema.safeParse({ name: 'No ID' }).success).toBe(false);
    expect(EventDetailsSchema.safeParse({ id: '123', name: '' }).success).toBe(false);
  });
});

describe('Validators: ChatRequestSchema', () => {
  it('validates valid chat payload', () => {
    const payload = {
      messages: [
        {
          role: 'user',
          parts: [{ text: 'How much should I spend on catering?' }],
        },
      ],
      event: {
        id: 'evt-1',
        name: 'Community Fair',
        type: 'community',
      },
    };
    expect(ChatRequestSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects empty messages list', () => {
    expect(ChatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
  });

  it('rejects overly long message', () => {
    const longText = 'a'.repeat(4500);
    const payload = {
      messages: [{ role: 'user', parts: [{ text: longText }] }],
    };
    expect(ChatRequestSchema.safeParse(payload).success).toBe(false);
  });
});

describe('Validators: GenerateRequestSchema', () => {
  const baseEvent = {
    id: 'e-1',
    name: 'Summer Gala',
    type: 'corporate' as const,
    guestCount: 120,
    totalBudget: 25000,
  };

  it('accepts timeline, budget, and ideas types', () => {
    ['timeline', 'budget', 'ideas'].forEach((t) => {
      const res = GenerateRequestSchema.safeParse({ type: t, event: baseEvent });
      expect(res.success).toBe(true);
    });
  });

  it('rejects unsupported generation type', () => {
    const res = GenerateRequestSchema.safeParse({ type: 'music_playlist', event: baseEvent });
    expect(res.success).toBe(false);
  });
});

describe('Validators: BudgetItemSchema & TimelineItemSchema', () => {
  it('validates budget item schema', () => {
    const item = {
      category: 'catering',
      name: 'Buffet Service',
      estimated: 3500,
      actual: 3200,
      paid: true,
    };
    expect(BudgetItemSchema.safeParse(item).success).toBe(true);
  });

  it('validates timeline item schema', () => {
    const task = {
      title: 'Book DJ',
      description: 'Find top local wedding DJ',
      dueDate: '3 months before',
      priority: 'high',
      completed: false,
    };
    expect(TimelineItemSchema.safeParse(task).success).toBe(true);
  });
});
