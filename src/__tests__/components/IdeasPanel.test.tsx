import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IdeasPanel from '@/components/IdeasPanel';
import { EventPlan } from '@/types';

describe('IdeasPanel component', () => {
  const mockPlan: EventPlan = {
    event: {
      id: 'event-i1',
      name: 'Silver Jubilee Anniversary',
      type: 'anniversary',
      date: '2027-11-05',
      venue: 'Lakeside Pavilion',
      guestCount: 80,
      totalBudget: 12000,
      theme: 'Silver Elegance',
      description: '25th anniversary celebration',
    },
    budget: [],
    timeline: [],
    vendors: [],
    guests: [],
    ideas: [
      'Interactive Memory Wall with 25 framed photos celebrating milestones.',
      'Signature cocktail called Silver Shimmer with edible glitter.',
    ],
    chatHistory: [],
  };

  const updatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('renders ideas list and generate button', () => {
    render(<IdeasPanel plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText(/Interactive Memory Wall/i)).toBeInTheDocument();
    expect(screen.getByText(/Signature cocktail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ai generate ideas/i })).toBeInTheDocument();
  });

  it('allows adding a custom idea manually', () => {
    render(<IdeasPanel plan={mockPlan} updatePlan={updatePlan} />);

    const input = screen.getByLabelText(/add your own idea/i);
    fireEvent.change(input, { target: { value: 'Live jazz quartet at twilight' } });

    const addBtn = screen.getByRole('button', { name: /add idea/i });
    fireEvent.click(addBtn);

    expect(updatePlan).toHaveBeenCalledTimes(1);
  });

  it('allows deleting an idea', () => {
    render(<IdeasPanel plan={mockPlan} updatePlan={updatePlan} />);

    const deleteBtns = screen.getAllByRole('button', { name: /remove idea/i });
    expect(deleteBtns.length).toBe(2);

    fireEvent.click(deleteBtns[0]);
    expect(updatePlan).toHaveBeenCalledTimes(1);
  });

  it('copies idea to clipboard', async () => {
    render(<IdeasPanel plan={mockPlan} updatePlan={updatePlan} />);

    const copyBtns = screen.getAllByRole('button', { name: /copy idea/i });
    expect(copyBtns.length).toBe(2);

    fireEvent.click(copyBtns[0]);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPlan.ideas[0]);
  });
});
