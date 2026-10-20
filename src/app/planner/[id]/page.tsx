'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadPlans, savePlan } from '@/lib/storage';
import { EventPlan } from '@/types';
import ChatPanel from '@/components/ChatPanel';
import BudgetPanel from '@/components/BudgetPanel';
import TimelinePanel from '@/components/TimelinePanel';
import VendorPanel from '@/components/VendorPanel';
import IdeasPanel from '@/components/IdeasPanel';
import EventHeader from '@/components/EventHeader';
import ErrorBoundary from '@/components/ErrorBoundary';

type Tab = 'chat' | 'budget' | 'timeline' | 'vendors' | 'ideas';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat', label: 'AI Assistant', icon: '🤖' },
  { id: 'budget', label: 'Budget Planner', icon: '💰' },
  { id: 'timeline', label: 'Timeline Milestones', icon: '📅' },
  { id: 'vendors', label: 'Vendor Directory', icon: '🏪' },
  { id: 'ideas', label: 'Personalized Ideas', icon: '💡' },
];

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const plans = loadPlans();
    const found = plans.find((p) => p.event.id === id);
    if (!found) {
      router.push('/');
      return;
    }
    setPlan(found);
    setLoading(false);
  }, [id, router]);

  const updatePlan = useCallback(
    (updater: (prev: EventPlan) => EventPlan) => {
      setPlan((prev) => {
        if (!prev) return prev;
        const updated = updater(prev);
        savePlan(updated);
        return updated;
      });
    },
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50" role="status">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-600 font-medium">Loading your celebration plan…</p>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EventHeader plan={plan} updatePlan={updatePlan} />

        {/* Tab Navigation */}
        <nav
          className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm"
          aria-label="Planning sections"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide" role="tablist" aria-label="Event planning tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500 ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-700 bg-purple-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Tab Panels */}
        <main id="main-content" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div
            role="tabpanel"
            id="panel-chat"
            aria-labelledby="tab-chat"
            hidden={activeTab !== 'chat'}
          >
            {activeTab === 'chat' && <ChatPanel plan={plan} updatePlan={updatePlan} />}
          </div>
          <div
            role="tabpanel"
            id="panel-budget"
            aria-labelledby="tab-budget"
            hidden={activeTab !== 'budget'}
          >
            {activeTab === 'budget' && <BudgetPanel plan={plan} updatePlan={updatePlan} />}
          </div>
          <div
            role="tabpanel"
            id="panel-timeline"
            aria-labelledby="tab-timeline"
            hidden={activeTab !== 'timeline'}
          >
            {activeTab === 'timeline' && <TimelinePanel plan={plan} updatePlan={updatePlan} />}
          </div>
          <div
            role="tabpanel"
            id="panel-vendors"
            aria-labelledby="tab-vendors"
            hidden={activeTab !== 'vendors'}
          >
            {activeTab === 'vendors' && <VendorPanel plan={plan} updatePlan={updatePlan} />}
          </div>
          <div
            role="tabpanel"
            id="panel-ideas"
            aria-labelledby="tab-ideas"
            hidden={activeTab !== 'ideas'}
          >
            {activeTab === 'ideas' && <IdeasPanel plan={plan} updatePlan={updatePlan} />}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
