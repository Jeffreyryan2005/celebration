import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelinePanel from '@/components/TimelinePanel';
import { EventPlan } from '@/types';

describe('TimelinePanel component', () => {
  const mockPlan: EventPlan = {
    event: {
      id: 'event-t1',
      name: 'Community Food Festival',
      type: 'community',
      date: '2027-09-12',
      venue: 'Riverside Park',
      guestCount: 500,
      totalBudget: 15000,
      theme: 'Flavors of the World',
      description: 'Annual festival',
    },
    budget: [],
    timeline: [
      {
        id: 't-1',
        title: 'Acquire City Permit',
        description: 'Submit park usage permit application',
        dueDate: '6 months before',
        completed: true,
        priority: 'high',
        category: 'venue',
      },
      {
        id: 't-2',
        title: 'Recruit Volunteers',
        description: 'Post signup sheet for shift leads',
        dueDate: '2 months before',
        completed: false,
        priority: 'medium',
        category: 'general',
      },
    ],
    vendors: [],
    guests: [],
    ideas: [],
    chatHistory: [],
  };

  const updatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders milestones, priority tags, and completion progress', () => {
    render(<TimelinePanel plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText('Acquire City Permit')).toBeInTheDocument();
    expect(screen.getByText('Recruit Volunteers')).toBeInTheDocument();
    expect(screen.getByText(/tasks completed/i)).toBeInTheDocument();
  });

  it('renders progress bar with correct ARIA progressbar role', () => {
    render(<TimelinePanel plan={mockPlan} updatePlan={updatePlan} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('allows toggling milestone completion state', () => {
    render(<TimelinePanel plan={mockPlan} updatePlan={updatePlan} />);

    const toggleButtons = screen.getAllByRole('checkbox');
    expect(toggleButtons.length).toBe(2);

    fireEvent.click(toggleButtons[1]);
    expect(updatePlan).toHaveBeenCalledTimes(1);
  });

  it('allows deleting a milestone', () => {
    render(<TimelinePanel plan={mockPlan} updatePlan={updatePlan} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i });
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    expect(updatePlan).toHaveBeenCalledTimes(1);
  });
});
