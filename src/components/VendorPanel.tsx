'use client';

import { useState, memo, useCallback } from 'react';
import { EventPlan, VendorItem, BudgetCategory } from '@/types';
import { BUDGET_CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  plan: EventPlan;
  updatePlan: (updater: (prev: EventPlan) => EventPlan) => void;
}

const STATUS_COLORS: Record<VendorItem['status'], string> = {
  researching: 'bg-gray-100 text-gray-600',
  contacted: 'bg-blue-100 text-blue-600',
  quoted: 'bg-yellow-100 text-yellow-700',
  booked: 'bg-purple-100 text-purple-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const STATUSES: VendorItem['status'][] = ['researching', 'contacted', 'quoted', 'booked', 'confirmed', 'rejected'];

/**
 * Vendor Panel — track vendors across categories with status management
 */
const VendorPanel = memo(function VendorPanel({ plan, updatePlan }: Props) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<BudgetCategory | 'all'>('all');
  const [newVendor, setNewVendor] = useState<Partial<VendorItem>>({
    category: 'catering',
    name: '',
    contact: '',
    website: '',
    price: 0,
    status: 'researching',
    notes: '',
    rating: 0,
  });

  const handleAdd = useCallback(() => {
    if (!newVendor.name?.trim()) return;
    const vendor: VendorItem = {
      id: uuidv4(),
      category: newVendor.category as BudgetCategory,
      name: newVendor.name.trim(),
      contact: newVendor.contact || '',
      website: newVendor.website || '',
      price: Number(newVendor.price) || 0,
      status: newVendor.status as VendorItem['status'],
      notes: newVendor.notes || '',
      rating: Number(newVendor.rating) || 0,
    };
    updatePlan((prev) => ({ ...prev, vendors: [...prev.vendors, vendor] }));
    setNewVendor({ category: 'catering', name: '', contact: '', website: '', price: 0, status: 'researching', notes: '', rating: 0 });
    setShowAddForm(false);
  }, [newVendor, updatePlan]);

  const handleStatusChange = useCallback(
    (id: string, status: VendorItem['status']) => {
      updatePlan((prev) => ({
        ...prev,
        vendors: prev.vendors.map((v) => (v.id === id ? { ...v, status } : v)),
      }));
    },
    [updatePlan]
  );

  const handleDelete = useCallback(
    (id: string) => {
      updatePlan((prev) => ({ ...prev, vendors: prev.vendors.filter((v) => v.id !== id) }));
    },
    [updatePlan]
  );

  const filtered =
    filterCategory === 'all' ? plan.vendors : plan.vendors.filter((v) => v.category === filterCategory);

  const confirmed = plan.vendors.filter((v) => v.status === 'confirmed').length;

  return (
    <div className="space-y-6" role="region" aria-label="Vendor checklist">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-gray-800">{plan.vendors.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Vendors</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{confirmed}</p>
          <p className="text-xs text-gray-500 mt-1">Confirmed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-orange-600">{plan.vendors.length - confirmed}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap items-center">
        <button
          onClick={() => setShowAddForm((p) => !p)}
          className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Vendor'}
        </button>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as BudgetCategory | 'all')}
          aria-label="Filter vendors by category"
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(BUDGET_CATEGORIES).map(([key, val]) => (
            <option key={key} value={key}>{val.icon} {val.label}</option>
          ))}
        </select>
      </div>

      {/* Add Vendor Form */}
      {showAddForm && (
        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
          <h3 className="font-semibold text-gray-800 mb-4">Add Vendor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vendor-name" className="block text-xs font-medium text-gray-600 mb-1">Vendor Name *</label>
              <input id="vendor-name" type="text" required value={newVendor.name || ''} onChange={(e) => setNewVendor((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., City Caterers" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="vendor-cat" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select id="vendor-cat" value={newVendor.category} onChange={(e) => setNewVendor((p) => ({ ...p, category: e.target.value as BudgetCategory }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                {Object.entries(BUDGET_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="vendor-contact" className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
              <input id="vendor-contact" type="text" value={newVendor.contact || ''} onChange={(e) => setNewVendor((p) => ({ ...p, contact: e.target.value }))} placeholder="Phone or email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label htmlFor="vendor-price" className="block text-xs font-medium text-gray-600 mb-1">Price Quote ($)</label>
              <input id="vendor-price" type="number" min="0" value={newVendor.price || 0} onChange={(e) => setNewVendor((p) => ({ ...p, price: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <button onClick={handleAdd} disabled={!newVendor.name?.trim()} className="mt-4 bg-purple-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-purple-500">
            Add Vendor
          </button>
        </div>
      )}

      {/* Vendor List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="list" aria-label="Vendor list">
          {filtered.map((vendor) => {
            const cat = BUDGET_CATEGORIES[vendor.category];
            return (
              <div key={vendor.id} role="listitem" className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{vendor.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${cat.color}`}>
                      {cat.icon} {cat.label}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(vendor.id)} aria-label={`Remove ${vendor.name}`} className="text-red-300 hover:text-red-500 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-red-500 rounded">
                    🗑
                  </button>
                </div>
                {vendor.contact && <p className="text-xs text-gray-500 mb-1">📞 {vendor.contact}</p>}
                {vendor.price > 0 && <p className="text-sm font-medium text-gray-700 mb-2">💵 ${vendor.price.toLocaleString()}</p>}
                <div>
                  <label htmlFor={`status-${vendor.id}`} className="sr-only">Status for {vendor.name}</label>
                  <select
                    id={`status-${vendor.id}`}
                    value={vendor.status}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorItem['status'])}
                    className={`w-full text-xs px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium ${STATUS_COLORS[vendor.status]}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s} className="bg-white text-gray-700 capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-dashed border-gray-200">
          <span className="text-5xl block mb-4" aria-hidden="true">🏪</span>
          <p className="text-gray-500">{plan.vendors.length === 0 ? 'No vendors yet. Add your first vendor!' : 'No vendors in this category.'}</p>
        </div>
      )}
    </div>
  );
});

export default VendorPanel;
