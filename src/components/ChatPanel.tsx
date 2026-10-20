'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { EventPlan, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

const QUICK_PROMPTS = [
  'Help me allocate my budget',
  'Create a planning timeline',
  'Suggest vendor checklist',
  'Give me theme ideas',
  'What should I prioritize first?',
  'Tips to reduce costs',
];

/**
 * AI Chat Panel — real-time streaming conversation with Gemini
 */
const ChatPanel = memo(function ChatPanel({ plan, updatePlan }: Props) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messages = plan.chatHistory;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      };

      const assistantMsgId = uuidv4();
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      // Add user message + empty assistant message
      updatePlan((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, userMsg, assistantMsg],
      }));

      setInput('');
      setIsLoading(true);

      // Build Gemini message history
      const history = [...messages, userMsg].map((m) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content }] as [{ text: string }],
      }));

      try {
        abortControllerRef.current = new AbortController();
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history, event: plan.event }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to get response');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullContent += chunk;

            // Update assistant message content in real-time
            updatePlan((prev) => ({
              ...prev,
              chatHistory: prev.chatHistory.map((m) =>
                m.id === assistantMsgId ? { ...m, content: fullContent, isStreaming: true } : m
              ),
            }));
          }
        }

        // Finalize: remove streaming flag
        updatePlan((prev) => ({
          ...prev,
          chatHistory: prev.chatHistory.map((m) =>
            m.id === assistantMsgId ? { ...m, content: fullContent, isStreaming: false } : m
          ),
        }));
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        updatePlan((prev) => ({
          ...prev,
          chatHistory: prev.chatHistory.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: `❌ Error: ${errorMessage}`, isStreaming: false }
              : m
          ),
        }));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
        inputRef.current?.focus();
      }
    },
    [isLoading, messages, plan.event, updatePlan]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4"
        aria-live="polite"
        aria-label="Chat conversation"
        role="log"
      >
        {/* Welcome message if no history */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4" aria-hidden="true">🤖</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Your AI Event Planning Assistant</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              I know all about your{' '}
              <strong className="text-purple-600">{plan.event.name}</strong>. Ask me anything about
              budgets, timelines, vendors, or ideas!
            </p>
            <div
              className="flex flex-wrap gap-2 justify-center"
              role="list"
              aria-label="Quick prompt suggestions"
            >
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  role="listitem"
                  onClick={() => sendMessage(prompt)}
                  className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-full text-sm hover:bg-purple-100 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 message-enter ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
                msg.role === 'assistant' ? 'bg-purple-100' : 'bg-pink-100'
              }`}
              aria-hidden="true"
            >
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-purple">
                  <ReactMarkdown>{msg.content || ' '}</ReactMarkdown>
                  {msg.isStreaming && (
                    <span className="inline-flex gap-1 ml-1" aria-label="AI is typing" role="status">
                      <span className="typing-dot w-1.5 h-1.5 bg-purple-400 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-purple-400 rounded-full inline-block" />
                      <span className="typing-dot w-1.5 h-1.5 bg-purple-400 rounded-full inline-block" />
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              )}
              <time
                className={`text-xs mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}
                dateTime={msg.timestamp}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-3 items-end">
          <label htmlFor="chat-input" className="sr-only">
            Message CelebrationAI
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about budgets, timelines, vendors, or ideas… (Enter to send)"
            rows={2}
            disabled={isLoading}
            aria-disabled={isLoading}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-60 transition-shadow"
          />
          {isLoading ? (
            <button
              onClick={handleStop}
              aria-label="Stop generating"
              className="bg-red-500 text-white px-4 py-3 rounded-xl hover:bg-red-600 transition-colors font-medium text-sm whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-500"
            >
              ⏹ Stop
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              aria-label="Send message"
              aria-disabled={!input.trim()}
              className="bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              Send →
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Shift+Enter for new line · Powered by Google Gemini
        </p>
      </div>
    </div>
  );
});

export default ChatPanel;
