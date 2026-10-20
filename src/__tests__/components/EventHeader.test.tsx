import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventHeader from '@/components/EventHeader';
import { EventPlan } from '@/types';

describe('EventHeader component', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 45);

  const mockPlan: EventPlan = {
    event: {
      id: 'event-101',
      name: 'Jessica & Michael Wedding',
      type: 'wedding',
      date: futureDate.toISOString().split('T')[0],
      venue: 'The Grand Palace',
      guestCount: 150,
      totalBudget: 35000,
      theme: 'Classic Ivory',
      description: 'Elegant formal wedding',
      createdAt: '2026-10-01T00:00:00.000Z',
    },
    budget: [],
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

  it('renders event name, guest count, venue, and total budget', () => {
    render(<EventHeader plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText('Jessica & Michael Wedding')).toBeInTheDocument();
    expect(screen.getByText(/150 guests/i)).toBeInTheDocument();
    expect(screen.getByText(/The Grand Palace/i)).toBeInTheDocument();
    expect(screen.getByText('$35,000')).toBeInTheDocument();
  });

  it('displays the countdown days timer badge for future events', () => {
    render(<EventHeader plan={mockPlan} updatePlan={updatePlan} />);

    const timer = screen.getByRole('timer');
    expect(timer).toBeInTheDocument();
    expect(timer).toHaveTextContent(/days left/i);
  });

  it('provides a home link and print & export buttons', () => {
    render(<EventHeader plan={mockPlan} updatePlan={updatePlan} />);

    const homeLink = screen.getByRole('link', { name: /back to home/i });
    expect(homeLink).toHaveAttribute('href', '/');

    const printBtn = screen.getByRole('button', { name: /print event plan/i });
    expect(printBtn).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /export complete event plan as json/i });
    expect(exportBtn).toBeInTheDocument();
  });

  it('triggers window.print when print button is clicked', () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
    render(<EventHeader plan={mockPlan} updatePlan={updatePlan} />);

    const printBtn = screen.getByRole('button', { name: /print event plan/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('creates and clicks download link for JSON export', () => {
    render(<EventHeader plan={mockPlan} updatePlan={updatePlan} />);

    const exportBtn = screen.getByRole('button', { name: /export complete event plan as json/i });
    expect(() => fireEvent.click(exportBtn)).not.toThrow();
  });
});
