/**
 * Centralized API Client Service
 * Provides typed, robust request wrappers for AI generation and chat streaming.
 */

import { EventDetails, BudgetItem, TimelineItem } from '@/types';

/**
 * Request options for AI generation endpoints
 */
export interface GenerateOptions {
  type: 'budget' | 'timeline' | 'ideas';
  event: EventDetails;
  signal?: AbortSignal;
}

/**
 * Invoke the AI generation API with error handling and typing
 */
export async function generateEventData<T = unknown>(
  type: 'budget' | 'timeline' | 'ideas',
  event: EventDetails,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, event }),
    signal,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Operation failed');
  }

  return json.data as T;
}

/**
 * Convenience helper to generate a budget plan
 */
export async function fetchGeneratedBudget(event: EventDetails): Promise<Partial<BudgetItem>[]> {
  return generateEventData<Partial<BudgetItem>[]>('budget', event);
}

/**
 * Convenience helper to generate a milestone timeline
 */
export async function fetchGeneratedTimeline(event: EventDetails): Promise<Partial<TimelineItem>[]> {
  return generateEventData<Partial<TimelineItem>[]>('timeline', event);
}

/**
 * Convenience helper to generate creative ideas
 */
export async function fetchGeneratedIdeas(event: EventDetails): Promise<string[]> {
  return generateEventData<string[]>('ideas', event);
}
