/**
 * Unit tests for centralized API client service (src/lib/api.ts)
 */
import {
  generateEventData,
  fetchGeneratedBudget,
  fetchGeneratedTimeline,
  fetchGeneratedIdeas,
} from '@/lib/api';
import { EventDetails } from '@/types';

const mockEvent: EventDetails = {
  id: 'e-api-1',
  name: 'Golden Anniversary',
  type: 'anniversary',
  date: '2027-09-20',
  venue: 'Lakeside Ballroom',
  guestCount: 100,
  totalBudget: 15000,
  theme: '50 Years of Love',
  description: 'Golden jubilee',
};

describe('api client service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates event data successfully on 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [{ title: 'Milestone 1' }] }),
    } as Response);

    const result = await generateEventData('timeline', mockEvent);
    expect(result).toEqual([{ title: 'Milestone 1' }]);
    expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ type: 'timeline', event: mockEvent }),
    }));
  });

  it('throws descriptive error on non-ok HTTP status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Rate limit reached' }),
    } as Response);

    await expect(generateEventData('budget', mockEvent)).rejects.toThrow('Rate limit reached');
  });

  it('throws error when response success flag is false', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false, error: 'Internal failure' }),
    } as Response);

    await expect(generateEventData('ideas', mockEvent)).rejects.toThrow('Internal failure');
  });

  it('fetchGeneratedBudget invokes generateEventData with budget type', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [{ name: 'Venue Deposit', estimated: 5000 }] }),
    } as Response);

    const data = await fetchGeneratedBudget(mockEvent);
    expect(data[0].name).toBe('Venue Deposit');
  });

  it('fetchGeneratedTimeline invokes generateEventData with timeline type', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [{ title: 'Book Florist' }] }),
    } as Response);

    const data = await fetchGeneratedTimeline(mockEvent);
    expect(data[0].title).toBe('Book Florist');
  });

  it('fetchGeneratedIdeas invokes generateEventData with ideas type', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: ['Photo Booth with Vintage Props'] }),
    } as Response);

    const data = await fetchGeneratedIdeas(mockEvent);
    expect(data[0]).toContain('Photo Booth');
  });
});
