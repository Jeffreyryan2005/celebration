'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EVENT_TYPES, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { createEmptyPlan, savePlan } from '@/lib/storage';
import { EventType } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<EventType | null>(null);
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    venue: '',
    guestCount: '50',
    totalBudget: '10000',
    theme: '',
  });

  const handleStart = () => {
    if (!selectedType) return;
    setStep('details');
  };

  const handleCreate = () => {
    if (!selectedType || !formData.name) return;
    const plan = createEmptyPlan({
      type: selectedType,
      name: formData.name,
      date: formData.date,
      venue: formData.venue,
      guestCount: parseInt(formData.guestCount, 10) || 50,
      totalBudget: parseInt(formData.totalBudget, 10) || 10000,
      theme: formData.theme,
    });
    savePlan(plan);
    router.push(`/planner/${plan.event.id}`);
  };

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🎉</span>
            <div>
              <h1 className="text-xl font-bold text-purple-700">{APP_NAME}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{APP_TAGLINE}</p>
            </div>
          </div>
          <nav aria-label="Main navigation">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded-md hover:bg-purple-50"
            >
              Features
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span>✨</span>
          <span>Powered by Google Gemini AI</span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Plan Your Perfect{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Celebration
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
          AI-powered assistance for weddings, birthdays, corporate events & more.
          Get smart budgets, timelines, vendor checklists, and personalized ideas — all in one place.
        </p>

        {/* Event Type Selector */}
        {step === 'select' && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-6" id="event-type-label">
              What are you planning?
            </h3>
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
              role="radiogroup"
              aria-labelledby="event-type-label"
            >
              {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(
                ([type, config]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    role="radio"
                    aria-checked={selectedType === type}
                    className={`p-6 rounded-2xl border-2 text-center transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-purple-500 ${
                      selectedType === type
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <span className="text-4xl block mb-2" aria-hidden="true">
                      {config.icon}
                    </span>
                    <span className="font-semibold text-gray-800 block">{config.label}</span>
                    <span className="text-xs text-gray-500 mt-1 block">{config.description}</span>
                  </button>
                )
              )}
            </div>
            <button
              onClick={handleStart}
              disabled={!selectedType}
              aria-disabled={!selectedType}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-10 py-4 rounded-full text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              Get Started →
            </button>
          </div>
        )}

        {/* Details Form */}
        {step === 'details' && selectedType && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 text-left">
            <button
              onClick={() => setStep('select')}
              className="text-sm text-purple-600 hover:text-purple-800 mb-6 flex items-center gap-1 transition-colors"
              aria-label="Go back to event type selection"
            >
              ← Back
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {EVENT_TYPES[selectedType].icon} Tell us about your{' '}
              {EVENT_TYPES[selectedType].label.toLowerCase()}
            </h3>
            <p className="text-gray-500 mb-6">Fill in the details to get personalized AI planning.</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name <span aria-hidden="true">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <input
                  id="event-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder={`e.g., ${selectedType === 'wedding' ? "Sarah & John's Wedding" : selectedType === 'birthday' ? "Emma's 30th Birthday" : 'Annual Community Fair'}`}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  aria-required="true"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="guest-count" className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Count
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.guestCount}
                    onChange={(e) => setFormData((p) => ({ ...p, guestCount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    id="total-budget"
                    type="number"
                    min="0"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData((p) => ({ ...p, totalBudget: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                  Venue (optional)
                </label>
                <input
                  id="venue"
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData((p) => ({ ...p, venue: e.target.value }))}
                  placeholder="e.g., The Grand Ballroom, Central Park"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                  Theme (optional)
                </label>
                <input
                  id="theme"
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData((p) => ({ ...p, theme: e.target.value }))}
                  placeholder="e.g., Garden Elegance, Rustic Vintage, Tropical Paradise"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!formData.name.trim()}
              aria-disabled={!formData.name.trim()}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:shadow-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              🚀 Create My Event Plan
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to plan a perfect event
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: '💰',
              title: 'Smart Budget Planner',
              desc: 'AI allocates your budget across all categories with real-time tracking and spending alerts.',
            },
            {
              icon: '📅',
              title: 'Dynamic Timeline',
              desc: 'Get a personalized milestone checklist from booking the venue to the big day.',
            },
            {
              icon: '✅',
              title: 'Vendor Checklists',
              desc: 'Track catering, photography, music, transportation and more with status updates.',
            },
            {
              icon: '💡',
              title: 'Personalized Ideas',
              desc: 'AI generates theme concepts, décor ideas, and unique touches tailored to your event.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-4xl block mb-4" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>
            <strong className="text-purple-600">{APP_NAME}</strong> — Built with Google Gemini AI for
            PromptWars Virtual Challenge 5
          </p>
          <p className="mt-2">Plan smarter. Celebrate bigger. ✨</p>
        </div>
      </footer>
    </main>
  );
}
