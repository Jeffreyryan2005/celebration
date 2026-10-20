/**
 * @jest-environment node
 */
import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

describe('POST /api/generate route', () => {
  it('returns 400 when request body is invalid JSON or empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('returns 400 when schema validation fails (missing event or wrong type)', async () => {
    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify({ type: 'unsupported_type', event: {} }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Validation error');
  });

  it('generates budget allocations using fallback when offline/mocked', async () => {
    const payload = {
      type: 'budget',
      event: {
        id: 'evt-g1',
        name: 'Spring Gala',
        type: 'corporate',
        guestCount: 150,
        totalBudget: 25000,
      },
    };

    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('generates timeline milestones using fallback when offline/mocked', async () => {
    const payload = {
      type: 'timeline',
      event: {
        id: 'evt-g2',
        name: 'Family Reunion',
        type: 'anniversary',
        guestCount: 40,
        totalBudget: 5000,
      },
    };

    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('generates personalized ideas using fallback when offline/mocked', async () => {
    const payload = {
      type: 'ideas',
      event: {
        id: 'evt-g3',
        name: 'Tech Hackathon',
        type: 'community',
        guestCount: 200,
        totalBudget: 10000,
        theme: 'Cyberpunk Futurism',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });
});
