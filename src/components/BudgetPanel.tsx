'use client';

import { useState, memo, useCallback } from 'react';
import { EventPlan, BudgetItem, BudgetCategory } from '@/types';
import { BUDGET_CATEGORIES } from '@/lib/constants';
import { formatCurrency } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

/**
 * Budget Panel — tracks estimated vs actual spending per category
 */
const BudgetPanel = memo(function BudgetPanel({ plan, updatePlan }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<BudgetItem>>({
    category: 'miscellaneous',
    name: '',
    estimated: 0,
    actual: 0,
    notes: '',
    paid: false,
  });

  const totalEstimated = plan.budget.reduce((s, i) => s + i.estimated, 0);
  const totalActual = plan.budget.reduce((s, i) => s + i.actual, 0);
  const remaining = plan.event.totalBudget - totalEstimated;
  const spentPercent = Math.min(100, Math.round((totalActual / plan.event.totalBudget) * 100));

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'budget', event: plan.event }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const items: BudgetItem[] = json.data.map((d: Partial<BudgetItem>) => ({
          id: uuidv4(),
          category: (d.category as BudgetCategory) || 'miscellaneous',
          name: d.name || 'Item',
          estimated: Number(d.estimated) || 0,
          actual: 0,
          notes: d.notes || '',
          paid: false,
        }));
        updatePlan((prev) => ({ ...prev, budget: items }));
      }
    } catch (err) {
      console.error('Budget generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [plan.event, updatePlan]);

  const handleAddItem = useCallback(() => {
    if (!newItem.name?.trim()) return;
    const item: BudgetItem = {
      id: uuidv4(),
      category: newItem.category as BudgetCategory,
      name: newItem.name.trim(),
      estimated: Number(newItem.estimated) || 0,
      actual: Number(newItem.actual) || 0,
      notes: newItem.notes || '',
      paid: newItem.paid || false,
    };
    updatePlan((prev) => ({ ...prev, budget: [...prev.budget, item] }));
    setNewItem({ category: 'miscellaneous', name: '', estimated: 0, actual: 0, notes: '', paid: false });
    setShowAddForm(false);
  }, [newItem, updatePlan]);

  const handleTogglePaid = useCallback(
    (id: string) => {
      updatePlan((prev) => ({
        ...prev,
        budget: prev.budget.map((i) => (i.id === id ? { ...i, paid: !i.paid } : i)),
      }));
    },
    [updatePlan]
  );

  const handleDelete = useCallback(
    (id: string) => {
      updatePlan((prev) => ({ ...prev, budget: prev.budget.filter((i) => i.id !== id) }));
    },
    [updatePlan]
  );

  return (
    <div className="space-y-6" role="region" aria-label="Budget planner">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: formatCurrency(plan.event.totalBudget), color: 'text-gray-800' },
          { label: 'Allocated', value: formatCurrency(totalEstimated), color: 'text-blue-600' },
          { label: 'Spent', value: formatCurrency(totalActual), color: 'text-orange-600' },
          {
            label: 'Remaining',
            value: formatCurrency(remaining),
            color: remaining >= 0 ? 'text-green-600' : 'text-red-600',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Spending Progress</span>
          <span className="text-sm font-bold text-gray-800">{spentPercent}%</span>
        </div>
        <div
          className="h-3 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={spentPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${spentPercent}% of budget spent`}
        >
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              spentPercent > 90 ? 'bg-red-500' : spentPercent > 70 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
        {remaining < 0 && (
          <p className="text-red-600 text-xs mt-2 font-medium" role="alert">
            ⚠️ Budget exceeded by {formatCurrency(Math.abs(remaining))}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          aria-disabled={isGenerating}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {isGenerating ? '⏳ Generating…' : '✨ AI Generate Budget'}
        </button>
        <button
          onClick={() => setShowAddForm((p) => !p)}
          className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200" role="form" aria-label="Add budget item">
          <h3 className="font-semibold text-gray-800 mb-4">Add Budget Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-name" className="block text-xs font-medium text-gray-600 mb-1">Item Name *</label>
              <input
                id="item-name"
                type="text"
                required
                value={newItem.name || ''}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Grand Ballroom"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="item-category" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select
                id="item-category"
                value={newItem.category || 'miscellaneous'}
                onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value as BudgetCategory }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(BUDGET_CATEGORIES).map(([key, val]) => (
                  <option key={key} value={key}>{val.icon} {val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="item-estimated" className="block text-xs font-medium text-gray-600 mb-1">Estimated ($)</label>
              <input
                id="item-estimated"
                type="number"
                min="0"
                value={newItem.estimated || 0}
                onChange={(e) => setNewItem((p) => ({ ...p, estimated: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="item-actual" className="block text-xs font-medium text-gray-600 mb-1">Actual ($)</label>
              <input
                id="item-actual"
                type="number"
                min="0"
                value={newItem.actual || 0}
                onChange={(e) => setNewItem((p) => ({ ...p, actual: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            onClick={handleAddItem}
            disabled={!newItem.name?.trim()}
            className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            Add Item
          </button>
        </div>
      )}

      {/* Budget Items Table */}
      {plan.budget.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="grid" aria-label="Budget items">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actual</th>
                  <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {plan.budget.map((item) => {
                  const cat = BUDGET_CATEGORIES[item.category];
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.paid ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${cat.color}`}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(item.estimated)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${item.actual > item.estimated ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatCurrency(item.actual)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.paid}
                          onChange={() => handleTogglePaid(item.id)}
                          aria-label={`Mark ${item.name} as ${item.paid ? 'unpaid' : 'paid'}`}
                          className="w-4 h-4 rounded accent-purple-600 focus-visible:ring-2 focus-visible:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="text-red-400 hover:text-red-600 transition-colors text-xs focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                  <td colSpan={2} className="px-4 py-3 text-gray-700">Total</td>
                  <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(totalEstimated)}</td>
                  <td className={`px-4 py-3 text-right ${totalActual > plan.event.totalBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(totalActual)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-dashed border-gray-200">
          <span className="text-5xl block mb-4" aria-hidden="true">💰</span>
          <p className="text-gray-500">No budget items yet. Click "AI Generate Budget" for smart allocations!</p>
        </div>
      )}
    </div>
  );
});

export default BudgetPanel;
