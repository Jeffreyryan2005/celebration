'use client';

import { memo } from 'react';
import Link from 'next/link';
import { EventPlan, EventType } from '@/types';
import { EVENT_TYPES } from '@/lib/constants';
import { daysUntilEvent } from '@/lib/storage';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

/**
 * Event header shown at the top of the planner page
 */
const EventHeader = memo(function EventHeader({ plan }: Props) {
  const daysLeft = daysUntilEvent(plan.event.date);
  const eventConfig = EVENT_TYPES[plan.event.type as EventType];

  return (
    <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors text-sm focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-700 rounded"
              aria-label="Back to home"
            >
              ← Home
            </Link>
            <div className="h-5 w-px bg-white/30" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{eventConfig?.icon}</span>
              <div>
                <h1 className="font-bold text-xl leading-tight">{plan.event.name}</h1>
                <p className="text-white/70 text-sm capitalize">
                  {eventConfig?.label} • {plan.event.guestCount} guests
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            {plan.event.date && (
              <div className="text-center" aria-label={`Event date: ${plan.event.date}`}>
                <p className="text-white/70 text-xs uppercase tracking-wide">Event Date</p>
                <p className="font-semibold text-sm">
                  {new Date(plan.event.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
            {daysLeft > 0 && (
              <div
                className="bg-white/20 rounded-xl px-4 py-2 text-center"
                role="timer"
                aria-label={`${daysLeft} days until event`}
              >
                <p className="text-white/70 text-xs uppercase tracking-wide">Days Left</p>
                <p className="font-bold text-2xl">{daysLeft}</p>
              </div>
            )}
            {plan.event.totalBudget > 0 && (
              <div className="text-center">
                <p className="text-white/70 text-xs uppercase tracking-wide">Budget</p>
                <p className="font-semibold text-sm">${plan.event.totalBudget.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default EventHeader;
