import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '@/app/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HomePage landing page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title, hero header, and all event types in step 1', () => {
    render(<HomePage />);

    expect(screen.getAllByText('CelebrationAI')[0]).toBeInTheDocument();
    expect(screen.getByText('Plan Your Perfect')).toBeInTheDocument();
    expect(screen.getByText('Wedding')).toBeInTheDocument();
    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('disables Get Started button until an event type is selected', () => {
    render(<HomePage />);

    const startBtn = screen.getByRole('button', { name: /get started/i });
    expect(startBtn).toBeDisabled();

    // Select Wedding
    const weddingRadio = screen.getByRole('radio', { name: /wedding/i });
    fireEvent.click(weddingRadio);

    expect(startBtn).not.toBeDisabled();
  });

  it('advances to details step when event type is chosen and Get Started is clicked', () => {
    render(<HomePage />);

    const birthdayRadio = screen.getByRole('radio', { name: /birthday/i });
    fireEvent.click(birthdayRadio);

    const startBtn = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(startBtn);

    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total budget/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create my event plan/i })).toBeInTheDocument();
  });

  it('creates event plan and navigates to planner page', () => {
    render(<HomePage />);

    // Step 1: select wedding
    fireEvent.click(screen.getByRole('radio', { name: /wedding/i }));
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    // Step 2: enter name
    const nameInput = screen.getByLabelText(/event name/i);
    fireEvent.change(nameInput, { target: { value: 'Hannah & Sam Wedding' } });

    // Submit
    const createBtn = screen.getByRole('button', { name: /create my event plan/i });
    fireEvent.click(createBtn);

    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/\/planner\//));
  });

  it('allows going back from details step to type selection', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('radio', { name: /corporate/i }));
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));

    const backBtn = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backBtn);

    expect(screen.getByText('What are you planning?')).toBeInTheDocument();
  });
});
