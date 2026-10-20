import { buildSystemPrompt } from '@/lib/gemini';
import { EventDetails } from '@/types';

describe('buildSystemPrompt', () => {
  it('returns a string containing event context when event is provided', () => {
    const event: Partial<EventDetails> = {
      type: 'wedding',
      name: "Sarah & John's Wedding",
      date: '2027-06-15',
      totalBudget: 25000,
      guestCount: 150,
      venue: 'Grand Ballroom',
      theme: 'Garden Elegance',
    };
    const prompt = buildSystemPrompt(event);
    expect(prompt).toContain('wedding');
    expect(prompt).toContain("Sarah & John's Wedding");
    expect(prompt).toContain('25,000');
    expect(prompt).toContain('150');
    expect(prompt).toContain('CelebrationAI');
  });

  it('handles missing event gracefully', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('CelebrationAI');
    expect(prompt).toContain('not yet specified');
  });

  it('mentions all four core capabilities', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Budget Planning');
    expect(prompt).toContain('Timeline');
    expect(prompt).toContain('Vendor');
    expect(prompt).toContain('Ideas');
  });
});
