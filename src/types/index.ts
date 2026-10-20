/**
 * CelebrationAI Core Type Definitions
 * Enterprise-grade TypeScript interfaces and types for event lifecycle management.
 */

/**
 * Supported celebration and event types
 */
export type EventType =
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'community'
  | 'anniversary'
  | 'graduation';

/**
 * Standardized financial expense categories for events
 */
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

/**
 * Individual expense item in an event budget
 */
export interface BudgetItem {
  /** Unique item identifier */
  id: string;
  /** Budget category allocation */
  category: BudgetCategory;
  /** Description or name of the expense */
  name: string;
  /** Projected or estimated cost in USD */
  estimated: number;
  /** Actual realized cost in USD */
  actual: number;
  /** Vendor notes, terms, or practical guidance */
  notes: string;
  /** Whether payment has been disbursed */
  paid: boolean;
}

/**
 * Milestone or action task in an event timeline
 */
export interface TimelineItem {
  /** Unique milestone identifier */
  id: string;
  /** Actionable title of the task */
  title: string;
  /** Detailed instructions or subtasks */
  description: string;
  /** Due date (relative e.g. '3 months before' or ISO date) */
  dueDate: string;
  /** Completion flag */
  completed: boolean;
  /** Task urgency/priority level */
  priority: 'high' | 'medium' | 'low';
  /** Associated planning category */
  category: string;
}

/**
 * External vendor or supplier profile
 */
export interface VendorItem {
  /** Unique vendor identifier */
  id: string;
  /** Service category */
  category: BudgetCategory;
  /** Company or individual vendor name */
  name: string;
  /** Primary contact (email, phone) */
  contact: string;
  /** Portfolio or official website URL */
  website: string;
  /** Quoted or contracted price */
  price: number;
  /** Current procurement workflow status */
  status: 'researching' | 'contacted' | 'quoted' | 'booked' | 'confirmed' | 'rejected';
  /** Meeting notes, contract terms, or special requirements */
  notes: string;
  /** Internal evaluation rating (1 to 5 stars) */
  rating: number;
}

/**
 * Attendee / RSVP tracking entry
 */
export interface GuestItem {
  /** Unique guest identifier */
  id: string;
  /** Full name of attendee */
  name: string;
  /** Contact email */
  email: string;
  /** Contact phone */
  phone: string;
  /** Current attendance status */
  rsvpStatus: 'pending' | 'confirmed' | 'declined' | 'maybe';
  /** Specific dietary preferences or allergy warnings */
  dietaryRestrictions: string;
  /** Whether the guest is permitted a plus-one */
  plusOne: boolean;
  /** Assigned table or seating zone */
  tableNumber?: number;
}

/**
 * Metadata and top-level properties of an event
 */
export interface EventDetails {
  /** Unique event identifier */
  id: string;
  /** Title of the celebration */
  name: string;
  /** Event classification persona */
  type: EventType;
  /** Scheduled date of event (ISO format YYYY-MM-DD) */
  date: string;
  /** Venue location or facility name */
  venue: string;
  /** Anticipated number of attendees */
  guestCount: number;
  /** Total maximum financial budget in USD */
  totalBudget: number;
  /** Visual or decorative theme concept */
  theme: string;
  /** Contextual overview or vision for the event */
  description: string;
  /** Creation timestamp */
  createdAt?: string;
  /** Last updated timestamp */
  updatedAt?: string;
}

/**
 * Interactive assistant message record
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message author role */
  role: 'user' | 'assistant';
  /** Markdown text content */
  content: string;
  /** ISO timestamp when message was created */
  timestamp: string;
  /** Whether response is actively streaming token-by-token */
  isStreaming?: boolean;
}

/**
 * Complete root event plan aggregate
 */
export interface EventPlan {
  /** Top-level event parameters */
  event: EventDetails;
  /** Line-item budget allocations */
  budget: BudgetItem[];
  /** Chronological planning checklist */
  timeline: TimelineItem[];
  /** Vendor CRM directory */
  vendors: VendorItem[];
  /** Attendee and RSVP roster */
  guests: GuestItem[];
  /** AI-curated creative concepts and themes */
  ideas: string[];
  /** Conversation history with CelebrationAI */
  chatHistory: ChatMessage[];
}

/**
 * Computed financial metrics across budget categories
 */
export interface BudgetSummary {
  /** Total budget cap */
  total: number;
  /** Sum of actual expenditures */
  spent: number;
  /** Unallocated or remaining funds */
  remaining: number;
  /** Category-by-category aggregates */
  byCategory: Record<BudgetCategory, { estimated: number; actual: number }>;
}

/**
 * Standardized API response envelope
 */
export interface ApiResponse<T> {
  /** Payload on successful execution */
  data?: T;
  /** Error message on failure */
  error?: string;
  /** Execution status flag */
  success: boolean;
}
