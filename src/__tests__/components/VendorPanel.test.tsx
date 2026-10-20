import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorPanel from '@/components/VendorPanel';
import { EventPlan } from '@/types';

describe('VendorPanel component', () => {
  const mockPlan: EventPlan = {
    event: {
      id: 'event-v1',
      name: 'Emma Birthday Bash',
      type: 'birthday',
      date: '2027-04-18',
      venue: 'City Center',
      guestCount: 50,
      totalBudget: 6000,
      theme: 'Retro 80s',
      description: 'Birthday party',
    },
    budget: [],
    timeline: [],
    vendors: [
      {
        id: 'v-1',
        category: 'photography',
        name: 'Flash Photography Co',
        contact: 'flash@example.com',
        website: 'https://flashphotos.example',
        price: 1200,
        status: 'booked',
        notes: 'Includes photo booth',
        rating: 5,
      },
      {
        id: 'v-2',
        category: 'music',
        name: 'DJ Groove Master',
        contact: 'dj@example.com',
        website: '',
        price: 800,
        status: 'contacted',
        notes: 'Waiting for song list',
        rating: 4,
      },
    ],
    guests: [],
    ideas: [],
    chatHistory: [],
  };

  const updatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vendors with status badges and contacts', () => {
    render(<VendorPanel plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText('Flash Photography Co')).toBeInTheDocument();
    expect(screen.getByText('DJ Groove Master')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('1,200') || content.includes('1200'))).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('800'))).toBeInTheDocument();
  });

  it('allows opening and closing the new vendor form', () => {
    render(<VendorPanel plan={mockPlan} updatePlan={updatePlan} />);

    const addBtn = screen.getByRole('button', { name: /\+ add vendor/i });
    fireEvent.click(addBtn);

    expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(screen.queryByLabelText(/vendor name/i)).not.toBeInTheDocument();
  });

  it('allows filtering by vendor category', () => {
    render(<VendorPanel plan={mockPlan} updatePlan={updatePlan} />);

    const filter = screen.getByLabelText(/filter vendors by category/i);
    fireEvent.change(filter, { target: { value: 'photography' } });

    expect(screen.getByText('Flash Photography Co')).toBeInTheDocument();
    expect(screen.queryByText('DJ Groove Master')).not.toBeInTheDocument();
  });

  it('allows deleting a vendor', () => {
    render(<VendorPanel plan={mockPlan} updatePlan={updatePlan} />);

    const deleteBtns = screen.getAllByRole('button', { name: /remove/i });
    expect(deleteBtns.length).toBe(2);

    fireEvent.click(deleteBtns[0]);
    expect(updatePlan).toHaveBeenCalledTimes(1);
  });
});
