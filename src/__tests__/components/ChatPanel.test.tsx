import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatPanel from '@/components/ChatPanel';
import { EventPlan } from '@/types';

// Mock react-markdown and remark-gfm (ESM-only packages)
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});
jest.mock('remark-gfm', () => () => () => {});

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('ChatPanel component', () => {
  const mockPlan: EventPlan = {
    event: {
      id: 'event-c1',
      name: 'Spring Gala',
      type: 'corporate',
      date: '2027-05-15',
      venue: 'Grand Plaza',
      guestCount: 150,
      totalBudget: 25000,
      theme: 'Emerald Night',
      description: 'Corporate celebration',
    },
    budget: [],
    timeline: [],
    vendors: [],
    guests: [],
    ideas: [],
    chatHistory: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'What should we prepare for catering?',
        timestamp: '2026-10-20T10:00:00.000Z',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'For a 150-guest corporate gala, consider plated dinner with vegetarian options.',
        timestamp: '2026-10-20T10:00:05.000Z',
      },
    ],
  };

  const updatePlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat history and conversation messages', () => {
    render(<ChatPanel plan={mockPlan} updatePlan={updatePlan} />);

    expect(screen.getByText('What should we prepare for catering?')).toBeInTheDocument();
    expect(screen.getByText(/consider plated dinner/i)).toBeInTheDocument();
  });

  it('renders quick prompt suggestions when chat is empty', () => {
    const emptyPlan: EventPlan = { ...mockPlan, chatHistory: [] };
    render(<ChatPanel plan={emptyPlan} updatePlan={updatePlan} />);

    expect(screen.getByText('Help me allocate my budget')).toBeInTheDocument();
    expect(screen.getByText('Create a planning timeline')).toBeInTheDocument();
    expect(screen.getByText('Give me theme ideas')).toBeInTheDocument();
  });

  it('allows typing into the message textarea', () => {
    render(<ChatPanel plan={mockPlan} updatePlan={updatePlan} />);

    const textarea = screen.getByPlaceholderText(/ask about budgets/i);
    fireEvent.change(textarea, { target: { value: 'Recommend lighting ideas' } });

    expect(textarea).toHaveValue('Recommend lighting ideas');
  });

  it('disables send button when input is empty', () => {
    render(<ChatPanel plan={mockPlan} updatePlan={updatePlan} />);

    const sendBtn = screen.getByRole('button', { name: /send message/i });
    expect(sendBtn).toBeDisabled();
  });
});
