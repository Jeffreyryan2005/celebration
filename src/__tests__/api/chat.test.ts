/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/gemini', () => {
  const actual = jest.requireActual('@/lib/gemini');
  return {
    ...actual,
    streamChatResponse: jest.fn().mockImplementation(() => {
      const encoder = new TextEncoder();
      return new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('Mocked AI response for event planning'));
          controller.close();
        },
      });
    }),
  };
});

describe('POST /api/chat route', () => {
  it('returns 400 when request body is empty or invalid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: 'invalid-body',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when message payload fails Zod validation', async () => {
    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('streams response successfully for valid messages and event context', async () => {
    const payload = {
      messages: [
        {
          role: 'user',
          parts: [{ text: 'What are unique floral concepts for a spring wedding?' }],
        },
      ],
      event: {
        id: 'evt-c1',
        name: 'Spring Wedding',
        type: 'wedding',
        guestCount: 100,
        totalBudget: 20000,
      },
    };

    const req = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});
