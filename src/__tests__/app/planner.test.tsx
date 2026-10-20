import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlannerPage from '@/app/planner/[id]/page';
import { EventPlan } from '@/types';

const mockPush = jest.fn();
const mockRouter = { push: mockPush };
let mockParamsId = 'test-planner-1';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: mockParamsId }),
  useRouter: () => mockRouter,
}));

// Mock react-markdown for ChatPanel inside planner
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});
jest.mock('remark-gfm', () => () => () => {});
window.HTMLElement.prototype.scrollIntoView = jest.fn();

const mockPlan: EventPlan = {
  event: {
    id: 'test-planner-1',
    name: 'Sophia Sweet 16',
    type: 'birthday',
    date: '2027-04-12',
    venue: 'Crystal Ballroom',
    guestCount: 80,
    totalBudget: 12000,
    theme: 'Glow in the Dark',
    description: '16th birthday party',
  },
  budget: [],
  timeline: [],
  vendors: [],
  guests: [],
  ideas: [],
  chatHistory: [],
};

describe('PlannerPage dynamic route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParamsId = 'test-planner-1';
    localStorage.setItem('celebration-planner-data', JSON.stringify([mockPlan]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads event plan from localStorage and displays tabs and header', async () => {
    render(<PlannerPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Sophia Sweet 16')[0]).toBeInTheDocument();
    });

    // Check tabs
    expect(screen.getByRole('tab', { name: /ai assistant/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /budget planner/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /timeline milestones/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /vendor directory/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /personalized ideas/i })).toBeInTheDocument();
  });

  it('allows switching between tabs', async () => {
    render(<PlannerPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Sophia Sweet 16')[0]).toBeInTheDocument();
    });

    // Switch to Budget tab
    const budgetTab = screen.getByRole('tab', { name: /budget planner/i });
    fireEvent.click(budgetTab);
    expect(budgetTab).toHaveAttribute('aria-selected', 'true');

    // Switch to Timeline tab
    const timelineTab = screen.getByRole('tab', { name: /timeline milestones/i });
    fireEvent.click(timelineTab);
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');

    // Switch to Vendors tab
    const vendorsTab = screen.getByRole('tab', { name: /vendor directory/i });
    fireEvent.click(vendorsTab);
    expect(vendorsTab).toHaveAttribute('aria-selected', 'true');

    // Switch to Ideas tab
    const ideasTab = screen.getByRole('tab', { name: /personalized ideas/i });
    fireEvent.click(ideasTab);
    expect(ideasTab).toHaveAttribute('aria-selected', 'true');
  });

  it('redirects to home if event ID is not found in localStorage', async () => {
    mockParamsId = 'non-existent-id';
    render(<PlannerPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
