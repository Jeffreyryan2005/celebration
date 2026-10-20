import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetPanel from '@/components/BudgetPanel';
import { EventPlan } from '@/types';

describe('BudgetPanel component', () => {
  const mockPlan: EventPlan = {
    event: {
      id: 'event-b1',
      name: 'Summer Gala',
      type: 'corporate',
      date: '2027-06-01',
      venue: 'Metropolitan Hall',
      guestCount: 200,
      totalBudget: 20000,
      theme: 'Modern Chic',
      description: 'Corporate gala',
    },
    budget: [
      {
        id: 'b-1',
        category: 'venue',
        name: 'Hall Rental',
        estimated: 8000,
        actual: 7500,
        notes: 'Deposit paid',
        paid: true,
      },
      {
        id: 'b-2',
        category: 'catering',
        name: 'Buffet Catering',
        estimated: 6000,
        actual: 0,
        notes: 'Includes drinks',
        paid: false,
      },
    ],
    timeline: [],
    vendors: [],
    guests: [],
    ideas: [],
    chatHistory: [],
  };

  const updatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders budget summary with allocated and spent amounts', () => {
    render(<BudgetPanel plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText(/total budget/i)).toBeInTheDocument();
    expect(screen.getByText(/^allocated$/i)).toBeInTheDocument();
    expect(screen.getByText(/^spent$/i)).toBeInTheDocument();
    expect(screen.getByText('Hall Rental')).toBeInTheDocument();
    expect(screen.getByText('Buffet Catering')).toBeInTheDocument();
  });

  it('renders progress bar with accessible ARIA attributes', () => {
    render(<BudgetPanel plan={mockPlan} updatePlan={updatePlan} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow');
  });

  it('allows toggling paid status', () => {
    render(<BudgetPanel plan={mockPlan} updatePlan={updatePlan} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
    fireEvent.click(checkboxes[0]);

    expect(updatePlan).toHaveBeenCalledTimes(1);
  });

  it('allows opening and closing the add item form', () => {
    render(<BudgetPanel plan={mockPlan} updatePlan={updatePlan} />);

    const addBtn = screen.getByRole('button', { name: /\+ add item/i });
    fireEvent.click(addBtn);

    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByLabelText(/item name/i)).not.toBeInTheDocument();
  });

  it('shows overbudget warning when allocation exceeds budget', () => {
    const overPlan: EventPlan = {
      ...mockPlan,
      event: { ...mockPlan.event, totalBudget: 5000 },
      budget: [
        {
          id: 'b-99',
          category: 'venue',
          name: 'Expensive Hall',
          estimated: 7000,
          actual: 0,
          notes: '',
          paid: false,
        },
      ],
    };

    render(<BudgetPanel plan={overPlan} updatePlan={updatePlan} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/budget exceeded/i);
  });
});
