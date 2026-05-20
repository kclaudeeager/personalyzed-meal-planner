'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Plus, X, Lightbulb } from 'lucide-react';
import { useUserId } from '@/hooks/use-user';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
const MEAL_LABELS: Record<string, string> = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', DINNER: 'Dinner' };
const MEAL_COLORS: Record<string, string> = {
  BREAKFAST: 'border-l-amber-500',
  LUNCH: 'border-l-green-500',
  DINNER: 'border-l-indigo-500',
};
import { API_BASE } from '@/lib/api';

interface Meal {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
  complexity: string;
  mealTypes?: string[];
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

interface Suggestion {
  dayOfWeek: number;
  mealType: string;
  suggestions: Array<{
    meal: Meal;
    reason: string;
  }>;
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
  const { userId } = useUserId();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [allMeals, setAllMeals] = useState<Meal[]>([]);
  const [showMealPicker, setShowMealPicker] = useState<{ day: number; type: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  async function fetchSuggestions() {
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`${API_BASE}/meal-plans/suggestions/${userId}?weekStart=${weekStart.toISOString()}`);
      const json = await res.json();
      setSuggestions(json.data ?? []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  const currentPlan = plans.find((p) => {
    const ws = new Date(p.weekStart);
    return formatDate(ws) === formatDate(weekStart);
  });

  const totalSlots = 21;
  const filledSlots = currentPlan?.entries.length ?? 0;
  const completionPct = Math.round((filledSlots / totalSlots) * 100);

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
        setShowSuggestions(false);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Entry error:', res.status, err);
      }
    } catch (e) {
      console.error('Entry fetch error:', e);
    }
  }

  async function handleRemoveEntry(entryId: string) {
    try {
      await fetch(`${API_BASE}/meal-plans/entry/${entryId}`, { method: 'DELETE' });
      fetchPlans();
    } catch {
    }
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const suggestionLookup: Record<string, Suggestion> = {};
  for (const s of suggestions) {
    suggestionLookup[`${s.dayOfWeek}-${s.mealType}`] = s;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Meal Planner
          </h1>
          <p className="mt-1 text-surface-200/60">Weekly meal planning with smart suggestions</p>
        </div>
        <div className="flex items-center gap-3">
          {currentPlan && (
            <>
              <button
                onClick={fetchSuggestions}
                disabled={loadingSuggestions}
                className="flex items-center gap-2 rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-200/80 transition-all hover:bg-surface-700 hover:text-surface-100 disabled:opacity-50"
              >
                {loadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                Suggest
              </button>
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

      {!userId && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
          Sign in to use the meal planner.
        </div>
      )}

      {userId && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const d = new Date(weekStart);
                  d.setDate(d.getDate() - 7);
                  setWeekStart(d);
                  setShowSuggestions(false);
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
                  setShowSuggestions(false);
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

          {/* Completion bar */}
          {currentPlan && (
            <div className="glass-dark rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-200/60">Week Progress</span>
                <span className="text-sm font-medium text-surface-200/80">{filledSlots}/{totalSlots} meals planned</span>
              </div>
              <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPct === 100 ? 'bg-green-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          )}

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
                      const sug = suggestionLookup[`${dayIndex}-${type}`];
                      const hasSuggestions = sug && sug.suggestions.length > 0;
                      return (
                        <div key={type} className="mb-2">
                          <div className="text-[10px] uppercase tracking-wider text-surface-200/40 mb-1">
                            {MEAL_LABELS[type]}
                          </div>
                          {entry ? (
                            <div
                              className={`group relative rounded-lg bg-primary-500/10 border border-primary-500/20 p-2 border-l-2 ${MEAL_COLORS[type] ?? ''}`}
                            >
                              <a href={`/meals/${entry.meal.id}`}
                                className="block hover:bg-primary-500/15 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-lg transition-colors"
                              >
                                <p className="text-xs font-medium text-primary-400 truncate hover:text-primary-300">{entry.meal.title}</p>
                                <p className="text-[10px] text-surface-200/40 mt-0.5">{entry.meal.calories} cal · {entry.meal.preparationTime}min</p>
                              </a>
                              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-primary-500/10">
                                <button
                                  onClick={() => currentPlan && setShowMealPicker({ day: dayIndex, type })}
                                  className="text-[8px] text-surface-200/40 hover:text-surface-200/70 transition-colors"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRemoveEntry(entry.id); }}
                                  className="ml-auto text-[8px] text-red-400/60 hover:text-red-400 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => currentPlan && setShowMealPicker({ day: dayIndex, type })}
                                disabled={!currentPlan}
                                className={`w-full rounded-lg border border-dashed p-2 text-center text-[10px] transition-colors disabled:opacity-30 ${
                                  hasSuggestions && showSuggestions
                                    ? 'border-accent-500/40 bg-accent-500/5 text-accent-400/60 hover:border-accent-500/60 hover:text-accent-400'
                                    : 'border-surface-800 text-surface-200/30 hover:border-surface-700 hover:text-surface-200/50'
                                }`}
                              >
                                + Add
                              </button>
                              {hasSuggestions && showSuggestions && (
                                <div className="mt-1 space-y-1">
                                  {sug.suggestions.slice(0, 2).map((s, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handleSetEntry(dayIndex, type, s.meal.id)}
                                      className="w-full text-left rounded-md bg-accent-500/10 border border-accent-500/20 p-1.5 hover:bg-accent-500/15 transition-colors"
                                    >
                                      <p className="text-[10px] font-medium text-accent-400 truncate">{s.meal.title}</p>
                                      <p className="text-[8px] text-surface-200/40 truncate">{s.reason}</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
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
