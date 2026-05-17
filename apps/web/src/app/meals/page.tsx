'use client';

import { useState, useEffect } from 'react';
import { Utensils, Plus, X, Loader2 } from 'lucide-react';

interface Meal {
  id: string;
  title: string;
  description: string;
  preparationTime: number;
  estimatedCost: number;
  calories: number;
  cuisineType: string;
  complexity: string;
  tags: string[];
  createdAt: string;
}

export default function MealsPage(): React.JSX.Element {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    preparationTime: '',
    estimatedCost: '',
    calories: '',
    cuisineType: 'RWANDAN',
    complexity: 'MEDIUM',
    tags: '',
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const res = await fetch('http://localhost:4000/api/meals');
      const json = await res.json();
      setMeals(json.data ?? []);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:4000/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          preparationTime: parseInt(form.preparationTime),
          estimatedCost: parseFloat(form.estimatedCost),
          calories: parseInt(form.calories),
          cuisineType: form.cuisineType,
          complexity: form.complexity,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        setForm({ title: '', description: '', preparationTime: '', estimatedCost: '', calories: '', cuisineType: 'RWANDAN', complexity: 'MEDIUM', tags: '' });
        setShowForm(false);
        fetchMeals();
      }
    } catch {
      // error
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Meals
          </h1>
          <p className="mt-1 text-surface-200/60">{meals.length} meals in the Rwandan catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Add Meal'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            New Meal
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="Isombe with Ubugali"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Description</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="Traditional Rwandan dish..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Prep Time (min)</label>
              <input
                type="number"
                required
                min="1"
                value={form.preparationTime}
                onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="45"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Cost (RWF)</label>
              <input
                type="number"
                required
                min="0"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="3500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Calories</label>
              <input
                type="number"
                required
                min="0"
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="450"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Complexity</label>
              <select
                value={form.complexity}
                onChange={(e) => setForm({ ...form, complexity: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-200/60 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                placeholder="traditional, vegetarian, lunch"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Creating...' : 'Create Meal'}
            </button>
          </div>
        </form>
      )}

      {/* Meal List */}
      {meals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {meals.map((meal) => (
            <div key={meal.id} className="glass-dark rounded-2xl p-5 transition-transform duration-200 hover:scale-[1.02]">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {meal.title}
                </h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  meal.complexity === 'EASY' ? 'bg-primary-500/15 text-primary-400' :
                  meal.complexity === 'MEDIUM' ? 'bg-accent-500/15 text-accent-400' :
                  'bg-red-500/15 text-red-400'
                }`}>
                  {meal.complexity}
                </span>
              </div>
              <p className="mt-2 text-sm text-surface-200/50 line-clamp-2">{meal.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-surface-200/40">
                <span>{meal.preparationTime} min</span>
                <span>{meal.calories} cal</span>
                <span>{meal.estimatedCost.toLocaleString()} RWF</span>
              </div>
              {meal.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-800/50 px-2 py-0.5 text-[10px] text-surface-200/40">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
          <div className="text-center">
            <Utensils className="mx-auto h-12 w-12 text-surface-200/20" />
            <p className="mt-4 text-lg font-medium text-surface-200/40">No meals yet</p>
            <p className="mt-1 text-sm text-surface-200/25">Click "Add Meal" to create your first Rwandan meal</p>
          </div>
        </div>
      )}
    </div>
  );
}
