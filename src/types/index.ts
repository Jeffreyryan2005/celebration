/**
 * Core type definitions for the Celebration & Event Planner
 */

export type EventType = 'wedding' | 'birthday' | 'corporate' | 'community' | 'anniversary' | 'graduation';

export type BudgetCategory =
  | 'venue'
  | 'catering'
  | 'decoration'
  | 'photography'
  | 'music'
  | 'transportation'
  | 'invitations'
  | 'attire'
  | 'gifts'
  | 'miscellaneous';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimated: number;
  actual: number;
  notes: string;
  paid: boolean;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string or relative like "3 months before"
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export interface VendorItem {
  id: string;
  category: BudgetCategory;
  name: string;
  contact: string;
  website: string;
  price: number;
  status: 'researching' | 'contacted' | 'quoted' | 'booked' | 'confirmed' | 'rejected';
  notes: string;
  rating: number; // 1-5
}

export interface GuestItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  dietaryRestrictions: string;
  plusOne: boolean;
  tableNumber?: number;
}

export interface EventDetails {
  id: string;
  name: string;
  type: EventType;
  date: string; // ISO date string
  venue: string;
  guestCount: number;
  totalBudget: number;
  theme: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface EventPlan {
  event: EventDetails;
  budget: BudgetItem[];
  timeline: TimelineItem[];
  vendors: VendorItem[];
  guests: GuestItem[];
  ideas: string[];
  chatHistory: ChatMessage[];
}

export interface BudgetSummary {
  total: number;
  spent: number;
  remaining: number;
  byCategory: Record<BudgetCategory, { estimated: number; actual: number }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
