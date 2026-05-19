'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Loader2, Sparkles, Plus, X } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner' };
import { API_BASE } from '@/lib/api';

interface Meal {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
  complexity: string;
}

interface MealPlanEntry {
  id: string;
  mealId: string;
  mealType: string;
  dayOfWeek: number;
  meal: Meal;
}

interface MealPlan {
  id: string;
  weekStart: string;
  weekEnd: string;
  name: string;
  entries: MealPlanEntry[];
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function MealPlannerPage(): React.JSX.Element {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [showMealPicker, setShowMealPicker] = useState<{ day: number; type: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPlans();
      fetchAllMeals();
    }
  }, [userId, weekStart]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meal-plans/user/${userId}`);
      const json = await res.json();
      setPlans(json.data ?? []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllMeals() {
    try {
      const res = await fetch(`${API_BASE}/meals?limit=100`);
      const json = await res.json();
      setAllMeals(json.data ?? []);
    } catch {
      setAllMeals([]);
    }
  }

  const currentPlan = plans.find((p) => {
    const ws = new Date(p.weekStart);
    return formatDate(ws) === formatDate(weekStart);
  });

  function getEntry(day: number, type: string): MealPlanEntry | undefined {
    return currentPlan?.entries.find((e) => e.dayOfWeek === day && e.mealType === type);
  }

  async function handleCreatePlan() {
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/meal-plans?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: weekStart.toISOString() }),
      });
      if (res.ok) {
        const json = await res.json();
        setPlans((prev) => [...prev, json.data]);
      }
    } catch {
      // error
    } finally {
      setCreating(false);
    }
  }

  async function handleGeneratePlan() {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/meal-plans/generate/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart: weekStart.toISOString() }),
      });
      if (res.ok) {
        fetchPlans();
      }
    } catch {
      // error
    } finally {
      setGenerating(false);
    }
  }

  async function handleSetEntry(day: number, type: string, mealId: string) {
    if (!currentPlan) return;
    try {
      const res = await fetch(`${API_BASE}/meal-plans/entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealPlanId: currentPlan.id,
          mealId,
          mealType: type,
          dayOfWeek: day,
        }),
      });
      if (res.ok) {
        fetchPlans();
        setShowMealPicker(null);
      }
    } catch {
      // error
    }
  }

  async function handleRemoveEntry(entryId: string) {
    try {
      await fetch(`${API_BASE}/meal-plans/entry/${entryId}`, { method: 'DELETE' });
      fetchPlans();
    } catch {
      // error
    }
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Meal Planner
          </h1>
          <p className="mt-1 text-surface-200/60">Weekly meal planning with AI-powered suggestions</p>
        </div>
        <div className="flex items-center gap-3">
          {currentPlan && (
            <>
              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI Generate
              </button>
            </>
          )}
        </div>
      </div>

      <div className="glass-dark rounded-2xl p-4 flex items-center gap-3">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
        />
      </div>

      {userId && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() - 7);
                  setWeekStart(d);
                }}
                className="rounded-xl bg-surface-800/50 p-2 hover:bg-surface-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <button
                onClick={() => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() + 7);
                  setWeekStart(d);
                }}
                className="rounded-xl bg-surface-800/50 p-2 hover:bg-surface-800 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {!currentPlan && (
              <button
                onClick={handleCreatePlan}
                disabled={creating}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Plan
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
            </div>
          ) : (
            <div className="glass-dark rounded-2xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-surface-800/50">
                {DAYS.map((day) => (
                  <div key={day} className="px-3 py-3 text-center text-xs font-medium text-surface-200/60 uppercase tracking-wider border-r border-surface-800/30 last:border-r-0">
                    {day}
                    <div className="mt-1 text-lg font-bold text-surface-100">
                      {weekDates[DAYS.indexOf(day)].getDate()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {weekDates.map((date, dayIndex) => (
                  <div key={dayIndex} className="min-h-[200px] border-r border-surface-800/30 last:border-r-0 p-2">
                    {MEAL_TYPES.map((type) => {
                      const entry = getEntry(dayIndex, type);
                      return (
                        <div key={type} className="mb-2">
                          <div className="text-[10px] uppercase tracking-wider text-surface-200/40 mb-1">
                            {MEAL_LABELS[type]}
                          </div>
                          {entry ? (
                            <div
                              className="group relative rounded-lg bg-primary-500/10 border border-primary-500/20 p-2 cursor-pointer hover:bg-primary-500/15 transition-colors"
                              onClick={() => setShowMealPicker({ day: dayIndex, type })}
                            >
                              <p className="text-xs font-medium text-primary-400 truncate">{entry.meal.title}</p>
                              <p className="text-[10px] text-surface-200/40 mt-0.5">{entry.meal.calories} cal · {entry.meal.preparationTime}min</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveEntry(entry.id); }}
                                className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[10px]"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => currentPlan && setShowMealPicker({ day: dayIndex, type })}
                              disabled={!currentPlan}
                              className="w-full rounded-lg border border-dashed border-surface-800 p-2 text-center text-[10px] text-surface-200/30 hover:border-surface-700 hover:text-surface-200/50 transition-colors disabled:opacity-30"
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showMealPicker && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowMealPicker(null)}>
              <div className="glass-dark rounded-2xl p-6 w-full max-w-lg max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  {DAYS[showMealPicker.day]} — {MEAL_LABELS[showMealPicker.type]}
                </h3>
                {allMeals.length > 0 ? (
                  <div className="space-y-2">
                    {allMeals.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => handleSetEntry(showMealPicker.day, showMealPicker.type, meal.id)}
                        className="w-full text-left rounded-xl bg-surface-900/50 border border-surface-800 p-3 hover:border-primary-500/50 transition-colors"
                      >
                        <p className="text-sm font-medium">{meal.title}</p>
                        <p className="text-xs text-surface-200/40 mt-0.5">{meal.calories} cal · {meal.preparationTime} min · {meal.estimatedCost.toLocaleString()} RWF</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-surface-200/40">No meals found. Create some meals first.</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
