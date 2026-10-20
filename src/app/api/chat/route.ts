import { NextRequest, NextResponse } from 'next/server';
import { streamChatResponse } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rateLimit';
import { ChatRequestSchema } from '@/lib/validators';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. IP extraction and rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    const rateResult = checkRateLimit(ip);
    if (!rateResult.success) {
      logger.warn(`Rate limit exceeded for IP ${ip}`);
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another message.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateResult.reset),
            'X-RateLimit-Limit': String(rateResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateResult.reset),
          },
        }
      );
    }

    // 2. Body parsing and schema validation
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const parseResult = ChatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const { messages, event } = parseResult.data;

    // 3. Convert messages format for Gemini
    const formattedMessages = messages.map((m) => ({
      role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model',
      parts: m.parts.map((p) => ({ text: p.text })) as [{ text: string }],
    }));

    // 4. Stream response
    const stream = await streamChatResponse(formattedMessages, event);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-transform',
        'Transfer-Encoding': 'chunked',
        'X-RateLimit-Limit': String(rateResult.limit),
        'X-RateLimit-Remaining': String(rateResult.remaining),
      },
    });
  } catch (err) {
    logger.error('Chat API Error:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
