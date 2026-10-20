import { NextRequest, NextResponse } from 'next/server';
import { generateTimeline, generateBudget, generateIdeas } from '@/lib/gemini';
import { EventDetails } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, event } = body as { type: 'timeline' | 'budget' | 'ideas'; event: EventDetails };

    if (!type || !event) {
      return NextResponse.json({ error: 'Missing required fields: type and event' }, { status: 400 });
    }

    if (!['timeline', 'budget', 'ideas'].includes(type)) {
      return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

    let rawJson: string;
    if (type === 'timeline') {
      rawJson = await generateTimeline(event);
    } else if (type === 'budget') {
      rawJson = await generateBudget(event);
    } else {
      rawJson = await generateIdeas(event);
    }

    // Strip markdown code fences if Gemini wraps them
    const cleaned = rawJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const data = JSON.parse(cleaned);

    return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('Generate API error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
