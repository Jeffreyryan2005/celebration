import { EventPlan, EventDetails } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'celebration-planner-data';

/**
 * Load all event plans from localStorage
 */
export function loadPlans(): EventPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as EventPlan[];
  } catch {
    return [];
  }
}

/**
 * Save a single event plan (upsert by event ID)
 */
export function savePlan(plan: EventPlan): void {
  if (typeof window === 'undefined') return;
  try {
    const plans = loadPlans();
    const idx = plans.findIndex((p) => p.event.id === plan.event.id);
    if (idx >= 0) {
      plans[idx] = { ...plan, event: { ...plan.event, updatedAt: new Date().toISOString() } };
    } else {
      plans.push(plan);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save plan:', err);
  }
}

/**
 * Delete an event plan by ID
 */
export function deletePlan(eventId: string): void {
  if (typeof window === 'undefined') return;
  const plans = loadPlans().filter((p) => p.event.id !== eventId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/**
 * Create a new empty event plan
 */
export function createEmptyPlan(details: Partial<EventDetails>): EventPlan {
  const now = new Date().toISOString();
  return {
    event: {
      id: uuidv4(),
      name: details.name || 'My Event',
      type: details.type || 'birthday',
      date: details.date || '',
      venue: details.venue || '',
      guestCount: details.guestCount || 50,
      totalBudget: details.totalBudget || 10000,
      theme: details.theme || '',
      description: details.description || '',
      createdAt: now,
      updatedAt: now,
    },
    budget: [],
    timeline: [],
    vendors: [],
    guests: [],
    ideas: [],
    chatHistory: [],
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate days until event
 */
export function daysUntilEvent(dateStr: string): number {
  if (!dateStr) return 0;
  const eventDate = new Date(dateStr);
  const today = new Date();
  const diff = eventDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
