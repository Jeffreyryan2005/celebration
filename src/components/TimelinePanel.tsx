'use client';

import { useState, memo, useCallback } from 'react';
import { EventPlan, TimelineItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

/**
 * Timeline Panel — planning milestones with priority and completion tracking
 */
const TimelinePanel = memo(function TimelinePanel({ plan, updatePlan }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const completed = plan.timeline.filter((t) => t.completed).length;
  const total = plan.timeline.length;
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'timeline', event: plan.event }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const items: TimelineItem[] = json.data.map((d: Partial<TimelineItem>) => ({
          id: uuidv4(),
          title: d.title || 'Task',
          description: d.description || '',
          dueDate: d.dueDate || '',
          completed: false,
          priority: (d.priority as TimelineItem['priority']) || 'medium',
          category: d.category || 'general',
        }));
        updatePlan((prev) => ({ ...prev, timeline: items }));
      }
    } catch (err) {
      console.error('Timeline generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [plan.event, updatePlan]);

  const handleToggle = useCallback(
    (id: string) => {
      updatePlan((prev) => ({
        ...prev,
        timeline: prev.timeline.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      }));
    },
    [updatePlan]
  );

  const handleDelete = useCallback(
    (id: string) => {
      updatePlan((prev) => ({ ...prev, timeline: prev.timeline.filter((t) => t.id !== id) }));
    },
    [updatePlan]
  );

  // Group by priority
  const highPriority = plan.timeline.filter((t) => t.priority === 'high' && !t.completed);
  const mediumPriority = plan.timeline.filter((t) => t.priority === 'medium' && !t.completed);
  const lowPriority = plan.timeline.filter((t) => t.priority === 'low' && !t.completed);
  const completedItems = plan.timeline.filter((t) => t.completed);

  return (
    <div className="space-y-6" role="region" aria-label="Event timeline">
      {/* Progress Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Planning Progress</h2>
            <p className="text-sm text-gray-500">{completed} of {total} tasks completed</p>
          </div>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-purple-200 text-purple-700 font-bold text-lg"
            role="img"
            aria-label={`${progressPct}% planning complete`}
          >
            {progressPct}%
          </div>
        </div>
        <div
          className="h-2 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {isGenerating ? '⏳ Generating…' : '✨ AI Generate Timeline'}
        </button>
      </div>

      {plan.timeline.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-dashed border-gray-200">
          <span className="text-5xl block mb-4" aria-hidden="true">📅</span>
          <p className="text-gray-500">No timeline yet. Click "AI Generate Timeline" to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { label: '🔴 High Priority', items: highPriority, priority: 'high' },
            { label: '🟡 Medium Priority', items: mediumPriority, priority: 'medium' },
            { label: '🟢 Low Priority', items: lowPriority, priority: 'low' },
            { label: '✅ Completed', items: completedItems, priority: 'done' },
          ]
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <div key={group.priority}>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
                  {group.label} ({group.items.length})
                </h3>
                <div className="space-y-3" role="list" aria-label={`${group.label} tasks`}>
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      role="listitem"
                      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-shadow ${
                        item.completed ? 'opacity-60' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggle(item.id)}
                        aria-label={`Mark "${item.title}" as ${item.completed ? 'incomplete' : 'complete'}`}
                        className="mt-1 w-5 h-5 rounded accent-purple-600 flex-shrink-0 focus-visible:ring-2 focus-visible:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-semibold text-gray-800 ${item.completed ? 'line-through' : ''}`}>
                            {item.title}
                          </p>
                          {!item.completed && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                        {item.dueDate && (
                          <p className="text-xs text-purple-600 mt-1 font-medium">📅 {item.dueDate}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete task: ${item.title}`}
                        className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0 text-sm focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
});

export default TimelinePanel;
