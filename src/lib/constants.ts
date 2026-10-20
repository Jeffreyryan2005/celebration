import { BudgetCategory, EventType } from '@/types';

/**
 * Budget category display config
 */
export const BUDGET_CATEGORIES: Record<BudgetCategory, { label: string; icon: string; color: string }> = {
  venue: { label: 'Venue', icon: '🏛️', color: 'bg-purple-100 text-purple-800' },
  catering: { label: 'Catering', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  decoration: { label: 'Decoration', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
  photography: { label: 'Photography', icon: '📸', color: 'bg-blue-100 text-blue-800' },
  music: { label: 'Music & DJ', icon: '🎵', color: 'bg-green-100 text-green-800' },
  transportation: { label: 'Transportation', icon: '🚗', color: 'bg-yellow-100 text-yellow-800' },
  invitations: { label: 'Invitations', icon: '✉️', color: 'bg-indigo-100 text-indigo-800' },
  attire: { label: 'Attire', icon: '👗', color: 'bg-red-100 text-red-800' },
  gifts: { label: 'Gifts & Favors', icon: '🎁', color: 'bg-teal-100 text-teal-800' },
  miscellaneous: { label: 'Miscellaneous', icon: '📦', color: 'bg-gray-100 text-gray-800' },
};

/**
 * Event type display config
 */
export const EVENT_TYPES: Record<EventType, { label: string; icon: string; description: string }> = {
  wedding: {
    label: 'Wedding',
    icon: '💍',
    description: 'Plan your perfect wedding ceremony and reception',
  },
  birthday: {
    label: 'Birthday',
    icon: '🎂',
    description: 'Create an unforgettable birthday celebration',
  },
  corporate: {
    label: 'Corporate',
    icon: '🏢',
    description: 'Organize professional corporate events and conferences',
  },
  community: {
    label: 'Community',
    icon: '🤝',
    description: 'Bring the community together for meaningful events',
  },
  anniversary: {
    label: 'Anniversary',
    icon: '💝',
    description: 'Celebrate a special milestone together',
  },
  graduation: {
    label: 'Graduation',
    icon: '🎓',
    description: 'Honor an academic achievement in style',
  },
};

/**
 * Default budget allocation percentages by event type
 */
export const DEFAULT_BUDGET_ALLOCATIONS: Record<EventType, Partial<Record<BudgetCategory, number>>> = {
  wedding: {
    venue: 30,
    catering: 35,
    photography: 12,
    decoration: 10,
    music: 5,
    attire: 5,
    invitations: 1,
    miscellaneous: 2,
  },
  birthday: {
    venue: 25,
    catering: 40,
    decoration: 15,
    music: 10,
    photography: 5,
    invitations: 2,
    gifts: 3,
  },
  corporate: {
    venue: 35,
    catering: 30,
    decoration: 10,
    transportation: 10,
    miscellaneous: 15,
  },
  community: {
    venue: 20,
    catering: 35,
    decoration: 15,
    music: 15,
    miscellaneous: 15,
  },
  anniversary: {
    venue: 30,
    catering: 35,
    decoration: 15,
    photography: 10,
    gifts: 5,
    miscellaneous: 5,
  },
  graduation: {
    venue: 25,
    catering: 40,
    decoration: 15,
    photography: 10,
    gifts: 5,
    invitations: 5,
  },
};

export const APP_NAME = 'CelebrationAI';
export const APP_TAGLINE = 'Your Smart Event Planning Assistant';
