'use client';

import { memo, useCallback } from 'react';
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
 * Includes live countdown, budget badge, and export/print tools.
 */
const EventHeader = memo(function EventHeader({ plan }: Props) {
  const daysLeft = daysUntilEvent(plan.event.date);
  const eventConfig = EVENT_TYPES[plan.event.type as EventType];

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.event.name.toLowerCase().replace(/\s+/g, '-')}-plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [plan]);

  return (
    <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-white/80 hover:text-white transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-white rounded px-2 py-1"
              aria-label="Back to home"
            >
              ← Home
            </Link>
            <div className="h-6 w-px bg-white/30" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{eventConfig?.icon || '🎉'}</span>
              <div>
                <h1 className="font-bold text-xl leading-tight">{plan.event.name}</h1>
                <p className="text-white/80 text-xs sm:text-sm capitalize">
                  {eventConfig?.label} • {plan.event.guestCount} guests {plan.event.venue ? `• ${plan.event.venue}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
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
                className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center"
                role="timer"
                aria-label={`${daysLeft} days until event`}
              >
                <p className="text-white/70 text-[10px] uppercase tracking-wide">Days Left</p>
                <p className="font-bold text-lg sm:text-xl">{daysLeft}</p>
              </div>
            )}
            {plan.event.totalBudget > 0 && (
              <div className="text-center">
                <p className="text-white/70 text-xs uppercase tracking-wide">Budget</p>
                <p className="font-semibold text-sm">${plan.event.totalBudget.toLocaleString()}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                title="Print or Save as PDF"
                aria-label="Print event plan or save as PDF"
                className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5"
              >
                <span>🖨️</span>
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
              <button
                onClick={handleExportJson}
                title="Export as JSON file"
                aria-label="Export complete event plan as JSON"
                className="bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1.5"
              >
                <span>💾</span>
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default EventHeader;
