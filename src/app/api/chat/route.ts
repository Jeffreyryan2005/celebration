import { NextRequest, NextResponse } from 'next/server';
import { streamChatResponse } from '@/lib/gemini';
import { EventDetails } from '@/types';

/**
 * Simple in-memory rate limiter (resets on cold start)
 * For production, use Redis or Upstash
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT_RPM || '20', 10);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, event } = body as {
      messages: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>;
      event?: Partial<EventDetails>;
    };

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request: messages array is required' }, { status: 400 });
    }

    // Sanitize: limit history to last 20 messages to avoid token overflow
    const trimmedMessages = messages.slice(-20);

    // Validate each message
    for (const msg of trimmedMessages) {
      if (!['user', 'model'].includes(msg.role)) {
        return NextResponse.json({ error: 'Invalid message role' }, { status: 400 });
      }
      if (typeof msg.parts?.[0]?.text !== 'string') {
        return NextResponse.json({ error: 'Invalid message format' }, { status: 400 });
      }
      // Sanitize message length
      msg.parts[0].text = msg.parts[0].text.slice(0, 4000);
    }

    const stream = await streamChatResponse(trimmedMessages, event);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
