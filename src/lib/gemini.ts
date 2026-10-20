import { GoogleGenerativeAI } from '@google/generative-ai';
import { EventDetails, EventType } from '@/types';

/**
 * Initialise the Gemini client (server-side only)
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Build a rich system prompt tailored to the current event context
 */
export function buildSystemPrompt(event?: Partial<EventDetails>): string {
  const eventContext = event
    ? `The user is planning a ${event.type} called "${event.name}" on ${event.date || 'an upcoming date'} with a budget of $${event.totalBudget?.toLocaleString() || 'TBD'} for ${event.guestCount || 'an unknown number of'} guests. The venue is "${event.venue || 'TBD'}" and the theme is "${event.theme || 'TBD'}".`
    : 'The user has not yet specified their event details.';

  return `You are CelebrationAI, an expert AI event planning assistant. You help users organize weddings, birthdays, corporate events, community gatherings, anniversaries, and graduations.

${eventContext}

Your core capabilities:
1. **Budget Planning**: Help allocate budgets across categories (venue, catering, decoration, photography, music, transportation, invitations, attire, gifts, miscellaneous). Always provide specific dollar amounts and percentages.
2. **Timeline Generation**: Create detailed, actionable timelines with milestones (e.g., "6 months before: Book venue", "3 months before: Send invitations").
3. **Vendor Guidance**: Recommend vendor types, what to look for, typical price ranges, and questions to ask vendors.
4. **Personalized Ideas**: Suggest themes, décor concepts, catering menus, entertainment ideas, and unique touches based on the event type and guest preferences.
5. **Problem Solving**: Help troubleshoot planning challenges like budget overruns, vendor cancellations, or last-minute changes.

Response guidelines:
- Be warm, encouraging, and professional
- Provide specific, actionable advice rather than vague suggestions
- When giving budgets, always specify amounts (not just percentages)
- Use bullet points and numbered lists for clarity
- Ask clarifying questions when needed to personalize advice
- Format important information with markdown (bold, bullets, headers)
- Consider cultural sensitivities and inclusivity in your suggestions`;
}

/**
 * Generate a streaming chat response
 */
export async function streamChatResponse(
  messages: Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>,
  event?: Partial<EventDetails>
): Promise<ReadableStream<Uint8Array>> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: buildSystemPrompt(event),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const chat = model.startChat({ history: messages.slice(0, -1) });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
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
        controller.error(err);
      }
    },
  });

  return stream;
}

/**
 * Generate a timeline for an event (non-streaming)
 */
export async function generateTimeline(event: EventDetails): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create a detailed planning timeline for a ${event.type} event called "${event.name}" scheduled for ${event.date} with ${event.guestCount} guests and a budget of $${event.totalBudget?.toLocaleString()}.

Return a JSON array of timeline items, each with:
{
  "title": "Task name",
  "description": "Detailed description of what needs to be done",
  "dueDate": "relative time like '6 months before' or '1 week before'",
  "priority": "high|medium|low",
  "category": "venue|catering|decoration|photography|music|transportation|invitations|attire|gifts|miscellaneous|general"
}

Include at least 15-20 items covering the full planning journey. Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate budget allocations for an event (non-streaming)
 */
export async function generateBudget(event: EventDetails): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create a detailed budget allocation for a ${event.type} with ${event.guestCount} guests and a total budget of $${event.totalBudget?.toLocaleString()}.

Return a JSON array of budget items, each with:
{
  "category": "venue|catering|decoration|photography|music|transportation|invitations|attire|gifts|miscellaneous",
  "name": "Specific line item name",
  "estimated": <number in USD>,
  "notes": "Brief note about this budget item"
}

Ensure the total of all estimated values equals exactly $${event.totalBudget?.toLocaleString()}.
Include 10-15 specific line items. Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate personalized event ideas
 */
export async function generateIdeas(event: EventDetails): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Generate 10 creative, personalized ideas for a ${event.type} event with theme "${event.theme || 'to be decided'}" for ${event.guestCount} guests.

Include ideas for:
- Theme & décor concepts
- Unique entertainment
- Special touches and personal moments
- Catering/menu highlights
- Guest experience enhancements

Return a JSON array of strings, each a concise but vivid idea (1-2 sentences). Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
