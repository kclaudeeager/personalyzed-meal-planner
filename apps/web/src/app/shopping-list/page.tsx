'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, CheckCircle2, Circle, FileDown, Sparkles } from 'lucide-react';
import { useUserId } from '@/hooks/use-user';
import { API_BASE } from '@/lib/api';

interface ShoppingListItem {
  id: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isChecked: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  totalCost: number;
  weekStart: string | null;
  weekEnd: string | null;
  items: ShoppingListItem[];
}

interface MealPlan {
  id: string;
  weekStart: string;
  name: string;
  entries: unknown[];
}

export default function ShoppingListPage(): React.JSX.Element {
  const { userId, isSignedIn } = useUserId();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    if (userId) {
      fetchLists();
      fetchPlans();
    }
  }, [userId]);

  async function fetchLists() {
    try {
      const res = await fetch(`${API_BASE}/shopping-lists/user/${userId}`);
      const json = await res.json();
      setLists(json.data ?? []);
    } catch {
      setLists([]);
    }
  }

  async function fetchPlans() {
    try {
      const res = await fetch(`${API_BASE}/meal-plans/user/${userId}`);
      const json = await res.json();
      setPlans(json.data ?? []);
    } catch {
      setPlans([]);
    }
  }

  async function handleGenerate() {
    if (!selectedPlanId) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/meals/shopping-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealPlanId: selectedPlanId }),
      });
      if (res.ok) {
        const json = await res.json();
        setLists((prev) => [json.data, ...prev]);
        setSelectedPlanId('');
      }
    } catch {
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggleItem(itemId: string, currentChecked: boolean) {
    try {
      await fetch(`${API_BASE}/shopping-lists/item/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isChecked: !currentChecked }),
      });
      fetchLists();
    } catch {
    }
  }

  async function handleExport(listId: string) {
    try {
      const res = await fetch(`${API_BASE}/shopping-lists/${listId}/export`);
      const json = await res.json();
      const text = json.data;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shopping-list-${listId.slice(0, 8)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Shopping List
        </h1>
        <p className="mt-1 text-surface-200/60">Generate and manage shopping lists from meal plans</p>
      </div>

      {!isSignedIn && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
          Sign in to manage shopping lists.
        </div>
      )}

      {userId && (
        <>
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Generate from Meal Plan
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="">Select a meal plan...</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {new Date(plan.weekStart).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <button
                onClick={handleGenerate}
                disabled={!selectedPlanId || generating}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </button>
            </div>
          </div>

          {lists.length > 0 ? (
            <div className="space-y-4">
              {lists.map((list) => (
                <div key={list.id} className="glass-dark rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                        {list.name}
                      </h3>
                      <p className="text-xs text-surface-200/40 mt-0.5">
                        Total: {list.totalCost.toLocaleString()} RWF · {list.items.length} items
                        {list.weekStart && ` · Week of ${new Date(list.weekStart).toLocaleDateString()}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleExport(list.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-surface-800/50 px-3 py-2 text-xs font-medium text-surface-200/60 hover:bg-surface-800 transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </div>
                  <div className="space-y-1">
                    {list.items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                          item.isChecked ? 'bg-surface-800/30 opacity-50' : 'hover:bg-surface-800/30'
                        }`}
                      >
                        <button onClick={() => handleToggleItem(item.id, item.isChecked)}>
                          {item.isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-primary-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-surface-600" />
                          )}
                        </button>
                        <div className="flex-1">
                          <p className={`text-sm ${item.isChecked ? 'line-through text-surface-200/30' : ''}`}>
                            {item.ingredientName}
                          </p>
                          <p className="text-xs text-surface-200/40">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <span className="text-xs text-surface-200/40">{item.estimatedCost.toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
              <div className="text-center">
                <ShoppingCart className="mx-auto h-12 w-12 text-surface-200/20" />
                <p className="mt-4 text-lg font-medium text-surface-200/40">No shopping lists yet</p>
                <p className="mt-1 text-sm text-surface-200/25">Select a meal plan above to generate a shopping list</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
