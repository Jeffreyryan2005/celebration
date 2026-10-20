/**
 * Additional Gemini module tests — buildSystemPrompt and fallback generators
 */
import { buildSystemPrompt } from '@/lib/gemini';

describe('buildSystemPrompt: context injection', () => {
  it('includes full event context when all fields are provided', () => {
    const prompt = buildSystemPrompt({
      type: 'wedding',
      name: "Alice & Bob's Wedding",
      date: '2027-06-15',
      totalBudget: 25000,
      guestCount: 150,
      venue: 'The Grand Ballroom',
      theme: 'Garden Elegance',
    });
    expect(prompt).toContain('wedding');
    expect(prompt).toContain("Alice & Bob's Wedding");
    expect(prompt).toContain('25,000');
    expect(prompt).toContain('150');
    expect(prompt).toContain('The Grand Ballroom');
    expect(prompt).toContain('Garden Elegance');
  });

  it('uses fallback text when event is undefined', () => {
    const prompt = buildSystemPrompt(undefined);
    expect(prompt).toContain('not yet specified');
    expect(prompt).toContain('CelebrationAI');
  });

  it('uses fallback text when event has no type', () => {
    const prompt = buildSystemPrompt({});
    expect(prompt).toContain('not yet specified');
  });

  it('contains all 5 core pillar topics', () => {
    const prompt = buildSystemPrompt({ type: 'birthday', name: 'Test' });
    expect(prompt).toContain('Budget Planning');
    expect(prompt).toContain('Timeline Generation');
    expect(prompt).toContain('Vendor Guidance');
    expect(prompt).toContain('Personalized Ideas');
    expect(prompt).toContain('Practical Problem Solving');
  });

  it('handles birthday event context', () => {
    const prompt = buildSystemPrompt({
      type: 'birthday',
      name: "Emma's 30th",
      guestCount: 50,
      totalBudget: 5000,
    });
    expect(prompt).toContain('birthday');
    expect(prompt).toContain("Emma's 30th");
    expect(prompt).toContain('5,000');
  });

  it('handles community event context', () => {
    const prompt = buildSystemPrompt({
      type: 'community',
      name: 'Summer Festival',
      guestCount: 500,
      totalBudget: 50000,
    });
    expect(prompt).toContain('community');
    expect(prompt).toContain('Summer Festival');
  });

  it('handles corporate event with TBD fields', () => {
    const prompt = buildSystemPrompt({
      type: 'corporate',
      name: 'Annual Gala',
    });
    expect(prompt).toContain('corporate');
    expect(prompt).toContain('TBD');
  });

  it('always returns a string with minimum length', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });
});

describe('buildSystemPrompt: response guidelines', () => {
  it('instructs model to be warm and structured', () => {
    const prompt = buildSystemPrompt({ type: 'anniversary', name: 'Test' });
    expect(prompt).toContain('warm');
    expect(prompt).toContain('structured');
  });

  it('instructs model to use markdown formatting', () => {
    const prompt = buildSystemPrompt({ type: 'graduation', name: 'Test' });
    expect(prompt).toContain('markdown');
  });

  it('mentions inclusivity and accessibility', () => {
    const prompt = buildSystemPrompt({ type: 'wedding', name: 'Test' });
    expect(prompt).toContain('inclusivity');
    expect(prompt).toContain('accessibility');
  });
});
