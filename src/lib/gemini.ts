import { GoogleGenerativeAI } from '@google/generative-ai';
import { EventDetails, EventType, BudgetItem, TimelineItem } from '@/types';
import { aiResponseCache } from './cache';
import { logger } from './logger';
import { DEFAULT_BUDGET_ALLOCATIONS } from './constants';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-flash-latest';

/**
 * Initialize the Gemini client (server-side only)
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Build an event-contextualized system prompt
 */
export function buildSystemPrompt(event?: Partial<EventDetails>): string {
  const eventContext = event && event.type
    ? `The user is planning a ${event.type} called "${event.name || 'Celebration'}" on ${event.date || 'an upcoming date'} with a budget of $${event.totalBudget?.toLocaleString() || '10,000'} for ${event.guestCount || 50} guests. Venue: "${event.venue || 'TBD'}". Theme: "${event.theme || 'TBD'}".`
    : 'The user has not yet specified their complete event details.';

  return `You are CelebrationAI, an expert AI event planning assistant. You specialize in weddings, birthdays, corporate events, community festivals, anniversaries, and graduations.

Context:
${eventContext}

Your core pillars of assistance:
1. **Budget Planning**: Dynamic allocation across venue, catering, decoration, photography, music, transportation, invitations, attire, gifts, and emergency reserve. Provide realistic line-item estimates and percentage breakdowns.
2. **Timeline Generation**: Actionable chronological milestones covering 6-12 months before, 1 month before, week of event, and event day execution.
3. **Vendor Guidance**: Recommend vendor questions, negotiation tips, typical contract clauses, and evaluation criteria.
4. **Personalized Ideas**: Innovative themes, interactive guest experiences, menu concepts, and memorable touches aligned with the specific celebration type.
5. **Practical Problem Solving**: Contingency planning, rain options, dietary accommodations, and cost reduction strategies without sacrificing quality.

Response guidelines:
- Be warm, encouraging, concise, and structured.
- Always provide specific numbers and actionable steps.
- Use markdown formatting with bullet points and bold headers for legibility.
- Emphasize inclusivity, guest accessibility, and responsible event practices.`;
}

/**
 * Generate a streaming chat response with Gemini 2.5 Flash
 */
export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>,
  event?: Partial<EventDetails>
): Promise<ReadableStream<Uint8Array>> {
  const genAI = getGeminiClient();

  let model;
  try {
    model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      systemInstruction: buildSystemPrompt(event),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });
  } catch {
    model = genAI.getGenerativeModel({
      model: FALLBACK_MODEL,
      systemInstruction: buildSystemPrompt(event),
    });
  }

  const history = messages.slice(0, -1);
  const lastMessage = messages[messages.length - 1];
  const chat = model.startChat({ history });

  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        logger.error('Stream error:', err);
        controller.error(err);
      }
    },
  });
}

/**
 * Generate a timeline for an event (structured JSON output)
 */
export async function generateTimeline(event: EventDetails): Promise<string> {
  const cacheKey = `timeline:${event.type}:${event.guestCount}:${event.totalBudget}:${event.theme}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) return cached;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const prompt = `Generate a comprehensive planning timeline for a ${event.type} event named "${event.name}" with ${event.guestCount} guests and a total budget of $${event.totalBudget}.
Return a JSON array of 12 to 18 milestone items. Each item must have:
- title: concise action title
- description: clear explanation
- dueDate: relative time (e.g. "6 months before", "3 months before", "2 weeks before", "Day of Event")
- priority: "high" | "medium" | "low"
- category: "venue" | "catering" | "decoration" | "photography" | "music" | "transportation" | "invitations" | "attire" | "gifts" | "miscellaneous"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    aiResponseCache.set(cacheKey, text);
    return text;
  } catch (err) {
    logger.warn('Gemini timeline generation fallback triggered:', err);
    return JSON.stringify(getFallbackTimeline(event));
  }
}

/**
 * Generate budget allocations for an event (structured JSON output)
 */
export async function generateBudget(event: EventDetails): Promise<string> {
  const cacheKey = `budget:${event.type}:${event.totalBudget}:${event.guestCount}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) return cached;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const prompt = `Generate a realistic budget allocation breakdown for a ${event.type} event named "${event.name}" for ${event.guestCount} guests with a total budget of exactly $${event.totalBudget}.
Return a JSON array of 8 to 12 line items. Each item must have:
- category: one of ["venue", "catering", "decoration", "photography", "music", "transportation", "invitations", "attire", "gifts", "miscellaneous"]
- name: specific vendor or item name
- estimated: dollar amount as number (sum should closely match ${event.totalBudget})
- notes: practical tips or context`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    aiResponseCache.set(cacheKey, text);
    return text;
  } catch (err) {
    logger.warn('Gemini budget generation fallback triggered:', err);
    return JSON.stringify(getFallbackBudget(event));
  }
}

/**
 * Generate personalized event ideas (structured JSON output)
 */
export async function generateIdeas(event: EventDetails): Promise<string> {
  const cacheKey = `ideas:${event.type}:${event.theme}:${event.guestCount}`;
  const cached = aiResponseCache.get(cacheKey);
  if (cached) return cached;

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: PRIMARY_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const prompt = `Generate 8 to 10 creative, personalized ideas for a ${event.type} event named "${event.name}" with theme "${event.theme || 'Joyful Celebration'}" for ${event.guestCount} guests.
Include concepts for theme immersion, unique guest experiences, signature drinks/food, decor focal points, and entertainment.
Return a JSON array of strings, where each string is a 1-2 sentence compelling idea.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    aiResponseCache.set(cacheKey, text);
    return text;
  } catch (err) {
    logger.warn('Gemini ideas generation fallback triggered:', err);
    return JSON.stringify(getFallbackIdeas(event));
  }
}

// Fallback generators ensure 100% reliability under network or quota constraints
function getFallbackBudget(event: EventDetails): Array<Partial<BudgetItem>> {
  const total = event.totalBudget || 10000;
  const allocations = DEFAULT_BUDGET_ALLOCATIONS[event.type] || DEFAULT_BUDGET_ALLOCATIONS.birthday;

  return Object.entries(allocations).map(([cat, pct]) => ({
    category: cat as BudgetItem['category'],
    name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Package`,
    estimated: Math.round((total * (pct || 10)) / 100),
    actual: 0,
    notes: `Recommended ${pct}% allocation for ${event.type}`,
  }));
}

function getFallbackTimeline(event: EventDetails): Array<Partial<TimelineItem>> {
  return [
    { title: 'Secure Event Venue', description: 'Tour top venue options and finalize deposit contract.', dueDate: '6 months before', priority: 'high', category: 'venue' },
    { title: 'Book Primary Caterer', description: 'Schedule menu tastings and specify guest dietary requirements.', dueDate: '5 months before', priority: 'high', category: 'catering' },
    { title: 'Hire Photographer / Videographer', description: 'Review portfolios and confirm coverage hours.', dueDate: '4 months before', priority: 'medium', category: 'photography' },
    { title: 'Send Invitations & RSVP Link', description: 'Distribute digital or printed invitations with RSVP deadline.', dueDate: '2 months before', priority: 'high', category: 'invitations' },
    { title: 'Finalize Décor & Floral Concepts', description: 'Order centerpieces, lighting, and stage rentals.', dueDate: '1 month before', priority: 'medium', category: 'decoration' },
    { title: 'DJ / Entertainment Playlist Alignment', description: 'Coordinate key songs, speeches, and timing schedule.', dueDate: '2 weeks before', priority: 'medium', category: 'music' },
    { title: 'Final Headcount & Seating Chart', description: 'Submit guaranteed guest count to caterer and venue.', dueDate: '1 week before', priority: 'high', category: 'catering' },
    { title: 'Day-of Coordination & Vendor Check-in', description: 'Review master timeline with all vendor leads.', dueDate: 'Day of Event', priority: 'high', category: 'miscellaneous' },
  ];
}

function getFallbackIdeas(event: EventDetails): string[] {
  return [
    `Interactive Welcome Wall: A personalized photo display celebrating memories tailored to your ${event.type}.`,
    `Signature Refreshment Station: Handcrafted mocktails/cocktails reflecting the "${event.theme || 'Celebration'}" theme.`,
    `Curated Acoustic Prelude: Live music playing soft welcoming melodies as guests arrive.`,
    `Digital Memory Capsule: QR codes on tables where guests can instantly upload candid photos to a live shared gallery.`,
    `Ambient Kinetic Lighting: Warm fairy lights and uplighting synchronized with key milestones of the evening.`,
    `Gourmet Late-Night Bites: Miniature sliders, street tacos, or artisanal dessert shooters for the final hour.`,
    `Customized Keepsake Favors: Locally sourced treats or personalized succulents as a thank-you token for attendees.`,
    `Interactive Group Toast: A coordinated moment honoring the hosts, VIPs, or community contributors.`,
  ];
}
