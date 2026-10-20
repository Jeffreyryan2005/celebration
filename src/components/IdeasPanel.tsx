'use client';

import { useState, memo, useCallback } from 'react';
import { EventPlan } from '@/types';
import { logger } from '@/lib/logger';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

/**
 * Ideas Panel — AI-generated and manual personalized event ideas
 */
const IdeasPanel = memo(function IdeasPanel({ plan, updatePlan }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newIdea, setNewIdea] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ideas', event: plan.event }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        updatePlan((prev) => ({
          ...prev,
          ideas: [...prev.ideas, ...json.data.filter((d: unknown): d is string => typeof d === 'string')],
        }));
      }
    } catch (err) {
      logger.error('Ideas generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [plan.event, updatePlan]);

  const handleAddManual = useCallback(() => {
    if (!newIdea.trim()) return;
    updatePlan((prev) => ({ ...prev, ideas: [...prev.ideas, newIdea.trim()] }));
    setNewIdea('');
  }, [newIdea, updatePlan]);

  const handleDelete = useCallback(
    (index: number) => {
      updatePlan((prev) => ({
        ...prev,
        ideas: prev.ideas.filter((_, i) => i !== index),
      }));
    },
    [updatePlan]
  );

  const handleCopy = useCallback(async (idea: string, index: number) => {
    await navigator.clipboard.writeText(idea);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const IDEA_ICONS = ['🎨', '🎵', '🍽️', '💃', '🎤', '📸', '🎁', '✨', '🌸', '🎭', '🎪', '🌟'];

  return (
    <div className="space-y-6" role="region" aria-label="Event ideas">
      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {isGenerating ? '⏳ Generating Ideas…' : '✨ AI Generate Ideas'}
        </button>
      </div>

      {/* Manual Add */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label htmlFor="manual-idea" className="block text-sm font-medium text-gray-700 mb-2">
          Add your own idea
        </label>
        <div className="flex gap-2">
          <input
            id="manual-idea"
            type="text"
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
            placeholder="e.g., Set up a photo booth with custom props…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleAddManual}
            disabled={!newIdea.trim()}
            aria-label="Add idea"
            className="bg-purple-100 text-purple-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Ideas Grid */}
      {plan.ideas.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">{plan.ideas.length} ideas collected</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Event ideas list">
            {plan.ideas.map((idea, index) => (
              <div
                key={index}
                role="listitem"
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group"
              >
                <span className="text-2xl block mb-3" aria-hidden="true">
                  {IDEA_ICONS[index % IDEA_ICONS.length]}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{idea}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopy(idea, index)}
                    aria-label={`Copy idea ${index + 1} to clipboard`}
                    className="text-xs text-gray-500 hover:text-purple-600 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 rounded px-2 py-1 bg-gray-50 hover:bg-purple-50"
                  >
                    {copiedIndex === index ? '✓ Copied!' : '📋 Copy'}
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    aria-label={`Remove idea ${index + 1}`}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 rounded px-2 py-1 bg-gray-50 hover:bg-red-50"
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-dashed border-gray-200">
          <span className="text-5xl block mb-4" aria-hidden="true">💡</span>
          <p className="text-gray-500 mb-2">No ideas yet! Let AI inspire you.</p>
          <p className="text-xs text-gray-400">
            Click "AI Generate Ideas" for themed suggestions based on your {plan.event.type} details.
          </p>
        </div>
      )}
    </div>
  );
});

export default IdeasPanel;
