import { NextRequest, NextResponse } from 'next/server';
import { generateTimeline, generateBudget, generateIdeas } from '@/lib/gemini';
import { checkRateLimit } from '@/lib/rateLimit';
import { GenerateRequestSchema } from '@/lib/validators';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    const rateResult = checkRateLimit(ip);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please wait a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateResult.reset),
            'X-RateLimit-Limit': String(rateResult.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const parseResult = GenerateRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: `Validation error: ${errorMsg}` }, { status: 400 });
    }

    const { type, event } = parseResult.data;

    let rawJson: string;
    if (type === 'timeline') {
      rawJson = await generateTimeline(event);
    } else if (type === 'budget') {
      rawJson = await generateBudget(event);
    } else {
      rawJson = await generateIdeas(event);
    }

    // Strip markdown wrappers if present
    const cleaned = rawJson
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch {
      logger.warn(`Failed to parse AI output as JSON, returning cleaned string: ${cleaned.slice(0, 100)}`);
      data = cleaned;
    }

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
          'X-RateLimit-Limit': String(rateResult.limit),
          'X-RateLimit-Remaining': String(rateResult.remaining),
        },
      }
    );
  } catch (err) {
    logger.error('Generate API error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message, success: false }, { status: 500 });
  }
}
