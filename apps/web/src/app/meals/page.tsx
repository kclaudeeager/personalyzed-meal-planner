'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Utensils, Plus, X, Loader2, ExternalLink, Eye,
  Image as ImageIcon, Video, CheckCircle2, ArrowRight,
  ChefHat, ClipboardList, ArrowUp, ArrowDown,
} from 'lucide-react';
import { API_BASE, API_HOST } from '@/lib/api';
import { useUserId } from '@/hooks/use-user';

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
  imageUrl: string | null;
  createdAt: string;
}

interface IngredientSearchResult {
  id: string;
  name: string;
  localAvailability: string;
  averageCost: number;
}

interface IngredientRow {
  tempId: string;
  name: string;
  quantity: number;
  unit: string;
  existing: boolean;
}

interface StepRow {
  tempId: string;
  instruction: string;
}

const MEAL_TYPE_OPTIONS = [
  { value: 'BREAKFAST', label: 'Breakfast' },
  { value: 'LUNCH', label: 'Lunch' },
  { value: 'DINNER', label: 'Dinner' },
];

export default function MealsPage(): React.JSX.Element {
  const { userId, isLoading: authLoading, isSignedIn } = useUserId();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [extraImageUrls, setExtraImageUrls] = useState<string[]>(['']);
  const [videoEntries, setVideoEntries] = useState<Array<{ tempId: string; url: string; source: string; title: string; creatorName: string }>>([]);
  const [newVideo, setNewVideo] = useState({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
  const [createdMealId, setCreatedMealId] = useState<string | null>(null);
  const [postCreateMessage, setPostCreateMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    preparationTime: '',
    estimatedCost: '',
    calories: '',
    cuisineType: 'RWANDAN',
    complexity: 'MEDIUM',
    tags: '',
    imageUrl: '',
    accompaniments: '',
    notes: '',
  });

  const [mealTypes, setMealTypes] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [steps, setSteps] = useState<StepRow[]>([]);

  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<Record<string, IngredientSearchResult[]>>({});
  const [searching, setSearching] = useState<Record<string, boolean>>({});
  const [showDropdown, setShowDropdown] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMeals();
  }, []);

  async function fetchMeals() {
    try {
      const res = await fetch(`${API_BASE}/meals`);
      const json = await res.json();
      setMeals(json.data ?? []);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: '', description: '', preparationTime: '', estimatedCost: '', calories: '', cuisineType: 'RWANDAN', complexity: 'MEDIUM', tags: '', imageUrl: '', accompaniments: '', notes: '' });
    setMealTypes([]);
    setIngredients([]);
    setSteps([]);
    setSearchTerms({});
    setSearchResults({});
    setSearching({});
    setShowDropdown({});
    setImageFiles([]);
    setImagePreviews([]);
    setExtraImageUrls(['']);
    setVideoEntries([]);
    setNewVideo({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
    setCreatedMealId(null);
    setPostCreateMessage('');
  }

  function addIngredientRow() {
    const tempId = Date.now().toString();
    setIngredients((prev) => [...prev, { tempId, name: '', quantity: 0, unit: 'cups', existing: false }]);
    setSearchTerms((prev) => ({ ...prev, [tempId]: '' }));
    setSearchResults((prev) => ({ ...prev, [tempId]: [] }));
    setSearching((prev) => ({ ...prev, [tempId]: false }));
    setShowDropdown((prev) => ({ ...prev, [tempId]: false }));
  }

  function removeIngredientRow(tempId: string) {
    setIngredients((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  const searchIngredient = useCallback(async (tempId: string, term: string) => {
    if (term.length < 1) {
      setSearchResults((prev) => ({ ...prev, [tempId]: [] }));
      setShowDropdown((prev) => ({ ...prev, [tempId]: false }));
      return;
    }
    setSearching((prev) => ({ ...prev, [tempId]: true }));
    try {
      const res = await fetch(`${API_BASE}/ingredients/search?q=${encodeURIComponent(term)}`);
      const json = await res.json();
      setSearchResults((prev) => ({ ...prev, [tempId]: json.data ?? [] }));
      setShowDropdown((prev) => ({ ...prev, [tempId]: true }));
    } catch {
      setSearchResults((prev) => ({ ...prev, [tempId]: [] }));
    } finally {
      setSearching((prev) => ({ ...prev, [tempId]: false }));
    }
  }, []);

  function selectIngredient(tempId: string, result: IngredientSearchResult) {
    setIngredients((prev) => prev.map((i) => i.tempId === tempId ? { ...i, name: result.name, existing: true } : i));
    setSearchTerms((prev) => ({ ...prev, [tempId]: result.name }));
    setShowDropdown((prev) => ({ ...prev, [tempId]: false }));
  }

  function addStep() {
    const tempId = Date.now().toString();
    setSteps((prev) => [...prev, { tempId, instruction: '' }]);
  }

  function removeStep(tempId: string) {
    setSteps((prev) => prev.filter((s) => s.tempId !== tempId));
  }

  function moveStep(tempId: string, direction: 'up' | 'down') {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.tempId === tempId);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  function toggleMealType(type: string) {
    setMealTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setPostCreateMessage('');
    try {
      const res = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          preparationTime: parseInt(form.preparationTime),
          estimatedCost: parseFloat(form.estimatedCost),
          calories: parseInt(form.calories),
          cuisineType: form.cuisineType,
          complexity: form.complexity,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          mealTypes: mealTypes.length > 0 ? mealTypes : undefined,
          accompaniments: form.accompaniments || undefined,
          notes: form.notes || undefined,
          imageUrl: form.imageUrl || undefined,
          ingredients: ingredients.filter((i) => i.name.trim()).map((i) => ({
            name: i.name.trim(),
            quantity: i.quantity,
            unit: i.unit,
          })),
          steps: steps.filter((s) => s.instruction.trim()).map((s) => ({
            instruction: s.instruction.trim(),
          })),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        const newId = json.data.id;
        setCreatedMealId(newId);
        fetchMeals();

        const uploads: Promise<unknown>[] = [];

        if (imageFiles.length > 0) {
          const fd = new FormData();
          imageFiles.forEach((f) => fd.append('files', f));
          uploads.push(
            fetch(`${API_BASE}/meals/${newId}/images`, {
              method: 'POST',
              headers: { 'x-user-id': userId },
              body: fd,
            }),
          );
        }

        const validUrls = extraImageUrls.filter((u) => u.trim());
        if (validUrls.length > 0) {
          uploads.push(
            fetch(`${API_BASE}/meals/${newId}/image-urls`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
              body: JSON.stringify({ urls: validUrls }),
            }),
          );
        }

        if (videoEntries.length > 0) {
          uploads.push(
            fetch(`${API_BASE}/meals/${newId}/videos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
              body: JSON.stringify(
                videoEntries.map((v) => ({
                  url: v.url,
                  source: v.source,
                  title: v.title,
                  creatorName: v.creatorName || undefined,
                })),
              ),
            }),
          );
        }

        await Promise.all(uploads);
        setPostCreateMessage('Meal created successfully!');
      } else {
        setPostCreateMessage(`Error: ${json.message ?? 'Failed to create'}`);
      }
    } catch {
      setPostCreateMessage('Failed to create meal');
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowImport(!showImport); if (showImport) setShowForm(false); }}
            className="flex items-center gap-2 rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-200/80 transition-all hover:bg-surface-700 hover:text-surface-100"
          >
            {showImport ? <X className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
            {showImport ? 'Cancel' : 'Import URL'}
          </button>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) setShowImport(false); }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'Add Meal'}
          </button>
        </div>
      </div>

      {/* URL Import */}
      {showImport && (
        <div className="glass-dark rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
            Import Recipe from URL
          </h2>
          <p className="text-sm text-surface-200/40">
            Paste a recipe URL from any cooking website. Mealie-style automatic import with schema.org parsing.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://example.com/recipe-url"
              className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={async () => {
                if (!importUrl) return;
                setImporting(true);
                setImportMessage('');
                try {
                  const res = await fetch(`${API_BASE}/meals/import`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: importUrl }),
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setImportMessage(`✅ ${json.message}`);
                    setImportUrl('');
                    fetchMeals();
                  } else {
                    setImportMessage(`❌ ${json.message}`);
                  }
                } catch {
                  setImportMessage('❌ Failed to import recipe');
                } finally {
                  setImporting(false);
                }
              }}
              disabled={!importUrl || importing}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Import
            </button>
          </div>
          {importMessage && (
            <p className="text-sm text-surface-200/60">{importMessage}</p>
          )}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="space-y-4">
          {createdMealId ? (
            <div className="glass-dark rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {postCreateMessage || 'Meal created!'}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/meals/${createdMealId}`}
                  className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110">
                  View Meal
                </Link>
                <Link href={`/meals/${createdMealId}/edit`}
                  className="rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-200/80 hover:bg-surface-700 transition-all">
                  Full Edit
                </Link>
                <button onClick={() => { resetForm(); setShowForm(false); }}
                  className="rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-200/80 hover:bg-surface-700 transition-all">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 space-y-6">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                New Meal
              </h2>

              {!isSignedIn && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
                  Sign in to create meals. If you already signed in, the system will use your account automatically.
                </div>
              )}

              {/* Section 1: Basic Info */}
              <div className="border-b border-surface-800/50 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200/60 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ClipboardList className="h-4 w-4" /> Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Meal Name</label>
                    <input type="text" required value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="Isombe with Ubugali" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Description</label>
                    <textarea required value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="Traditional Rwandan cassava leaves dish served with ubugali..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Meal Times</label>
                    <div className="flex flex-wrap gap-2">
                      {MEAL_TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleMealType(opt.value)}
                          className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                            mealTypes.includes(opt.value)
                              ? 'bg-primary-600 text-white'
                              : 'bg-surface-900/50 border border-surface-800 text-surface-200/60 hover:border-primary-500/50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Complexity</label>
                    <select value={form.complexity}
                      onChange={(e) => setForm({ ...form, complexity: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Prep Time (min)</label>
                    <input type="number" required min="1" value={form.preparationTime}
                      onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="45" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Cost (RWF)</label>
                    <input type="number" required min="0" value={form.estimatedCost}
                      onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="3500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Calories</label>
                    <input type="number" required min="0" value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="450" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-200/60 mb-1">Tags (comma-separated)</label>
                    <input type="text" value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                      placeholder="traditional, vegetarian, lunch" />
                  </div>
                </div>
              </div>

              {/* Section 2: Ingredients */}
              <div className="border-b border-surface-800/50 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200/60 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ChefHat className="h-4 w-4" /> Ingredients
                </h3>

                {ingredients.length === 0 && (
                  <p className="text-sm text-surface-200/40 mb-3">No ingredients added yet. Click below to add ingredients.</p>
                )}

                <div className="space-y-3">
                  {ingredients.map((ing) => (
                    <div key={ing.tempId} className="flex items-start gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={searchTerms[ing.tempId] ?? ing.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSearchTerms((prev) => ({ ...prev, [ing.tempId]: val }));
                            setIngredients((prev) => prev.map((i) => i.tempId === ing.tempId ? { ...i, name: val, existing: false } : i));
                            searchIngredient(ing.tempId, val);
                          }}
                          onFocus={() => {
                            if (searchTerms[ing.tempId]?.length >= 1) {
                              setShowDropdown((prev) => ({ ...prev, [ing.tempId]: true }));
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowDropdown((prev) => ({ ...prev, [ing.tempId]: false })), 200);
                          }}
                          placeholder="Type ingredient name..."
                          className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                        />
                        {searching[ing.tempId] && (
                          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-surface-400" />
                        )}
                        {showDropdown[ing.tempId] && searchResults[ing.tempId]?.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full rounded-xl bg-surface-800 border border-surface-700 shadow-lg overflow-hidden">
                            {searchResults[ing.tempId].map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                onMouseDown={() => selectIngredient(ing.tempId, result)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-surface-700 transition-colors flex items-center justify-between"
                              >
                                <span>{result.name}</span>
                                <span className="text-xs text-surface-200/40">{result.localAvailability} · {result.averageCost} RWF</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {showDropdown[ing.tempId] && searchTerms[ing.tempId] && searchResults[ing.tempId]?.length === 0 && !searching[ing.tempId] && (
                          <div className="absolute z-10 mt-1 w-full rounded-xl bg-surface-800 border border-surface-700 shadow-lg p-3">
                            <p className="text-sm text-surface-200/60">
                              No existing ingredient found. <strong>&ldquo;{searchTerms[ing.tempId]}&rdquo; will be auto-registered</strong>.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="w-24 shrink-0">
                        <input type="number" min="0" step="0.25" value={ing.quantity}
                          onChange={(e) => setIngredients((prev) => prev.map((i) => i.tempId === ing.tempId ? { ...i, quantity: parseFloat(e.target.value) || 0 } : i))}
                          placeholder="Qty"
                          className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                      </div>
                      <div className="w-24 shrink-0">
                        <select value={ing.unit}
                          onChange={(e) => setIngredients((prev) => prev.map((i) => i.tempId === ing.tempId ? { ...i, unit: e.target.value } : i))}
                          className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                          <option value="cups">cups</option>
                          <option value="tbsp">tbsp</option>
                          <option value="tsp">tsp</option>
                          <option value="pieces">pieces</option>
                          <option value="grams">grams</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="liters">liters</option>
                          <option value="units">units</option>
                          <option value="to taste">to taste</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => removeIngredientRow(ing.tempId)}
                        className="mt-1 rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addIngredientRow}
                  className="mt-3 flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
                  <Plus className="h-3.5 w-3.5" /> Add Ingredient
                </button>
              </div>

              {/* Accompaniments */}
              <div className="border-b border-surface-800/50 pb-4">
                <label className="block text-sm font-medium text-surface-200/60 mb-1">Accompaniments</label>
                <textarea value={form.accompaniments}
                  onChange={(e) => setForm({ ...form, accompaniments: e.target.value })}
                  rows={2}
                  placeholder="Serve with rice, plantains, salad, or ugali..."
                  className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
              </div>

              {/* Section 3: Steps */}
              <div className="border-b border-surface-800/50 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200/60 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ArrowRight className="h-4 w-4" /> Steps
                </h3>

                {steps.length === 0 && (
                  <p className="text-sm text-surface-200/40 mb-3">No steps added. Add step-by-step instructions so others can easily follow.</p>
                )}

                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div key={step.tempId} className="flex items-start gap-2">
                      <div className="flex items-center gap-1 pt-2 shrink-0">
                        <button type="button" onClick={() => moveStep(step.tempId, 'up')}
                          disabled={idx === 0}
                          className="text-surface-400 hover:text-surface-200 disabled:opacity-30">
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => moveStep(step.tempId, 'down')}
                          disabled={idx === steps.length - 1}
                          className="text-surface-400 hover:text-surface-200 disabled:opacity-30">
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/15 text-sm font-bold text-primary-400 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <input type="text" value={step.instruction}
                          onChange={(e) => setSteps((prev) => prev.map((s) => s.tempId === step.tempId ? { ...s, instruction: e.target.value } : s))}
                          placeholder={`Step ${idx + 1}: e.g. Chop the onions finely`}
                          className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        <button type="button" onClick={() => removeStep(step.tempId)}
                          className="rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="hidden sm:flex items-center text-surface-500 shrink-0">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addStep}
                  className="mt-3 flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </button>

                {steps.length > 0 && (
                  <div className="mt-4 rounded-xl bg-surface-900/50 border border-surface-800 p-4">
                    <p className="text-xs text-surface-200/40 mb-2">Preview:</p>
                    <div className="flex flex-wrap items-center gap-1 text-sm">
                      {steps.filter((s) => s.instruction.trim()).map((s, i) => (
                        <span key={s.tempId} className="flex items-center gap-1">
                          <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-primary-400">{i + 1}. {s.instruction}</span>
                          {i < steps.filter((s2) => s2.instruction.trim()).length - 1 && (
                            <ArrowRight className="h-4 w-4 text-surface-500" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: Notes */}
              <div className="border-b border-surface-800/50 pb-4">
                <label className="block text-sm font-medium text-surface-200/60 mb-1">Notes (optional)</label>
                <textarea value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any extra tips, substitutions, or notes for the cook..."
                  className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
              </div>

              {/* Section 5: Image Section (unchanged) */}
              <div className="border-b border-surface-800/50 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200/60 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ImageIcon className="h-4 w-4" /> Images
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-surface-200/40 mb-1">Primary image URL (thumbnail)</label>
                    <input type="url" value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      placeholder="https://example.com/meal.jpg"
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2.5 text-sm cursor-pointer hover:border-primary-500/50 transition-colors">
                      <ImageIcon className="h-4 w-4 text-surface-400" />
                      <span className="text-surface-200/60">{imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Upload multiple images'}</span>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setImageFiles((prev) => [...prev, ...files]);
                          setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                        }} />
                    </label>
                    {imagePreviews.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {imagePreviews.map((preview, i) => (
                          <div key={i} className="relative inline-block">
                            <img src={preview} alt="" className="h-20 w-20 rounded-lg object-cover" />
                            <button type="button" onClick={() => {
                              setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
                              setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
                            }}
                              className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-surface-200/40 mb-1">Additional image URLs</label>
                    {extraImageUrls.map((url, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input type="url" value={url}
                          onChange={(e) => {
                            const next = [...extraImageUrls];
                            next[i] = e.target.value;
                            setExtraImageUrls(next);
                          }}
                          placeholder="https://example.com/gallery-1.jpg"
                          className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                        {extraImageUrls.length > 1 && (
                          <button type="button" onClick={() => setExtraImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                            className="rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={() => setExtraImageUrls((prev) => [...prev, ''])}
                      className="text-xs text-primary-400 hover:text-primary-300 mt-1">
                      + Add another URL
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 6: Video Section (unchanged) */}
              <div className="border-b border-surface-800/50 pb-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-surface-200/60 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Video className="h-4 w-4" /> Preparation Videos
                </h3>
                {videoEntries.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {videoEntries.map((v) => (
                      <div key={v.tempId} className="flex items-center justify-between rounded-lg bg-surface-900/50 border border-surface-800 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{v.title}</p>
                          <p className="text-xs text-surface-200/40 truncate">{v.url} · {v.source}</p>
                        </div>
                        <button type="button" onClick={() => setVideoEntries((prev) => prev.filter((e) => e.tempId !== v.tempId))}
                          className="ml-2 rounded-full bg-red-500/20 p-1 text-red-400 hover:bg-red-500/30">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-surface-200/40 mb-1">Video URL</label>
                    <input type="url" value={newVideo.url}
                      onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-200/40 mb-1">Title</label>
                    <input type="text" value={newVideo.title}
                      onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                      placeholder="How to cook this meal"
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-200/40 mb-1">Source</label>
                    <select value={newVideo.source}
                      onChange={(e) => setNewVideo({ ...newVideo, source: e.target.value })}
                      className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
                      <option value="YOUTUBE">YouTube</option>
                      <option value="TIKTOK">TikTok</option>
                      <option value="ORIGINAL">Original</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-surface-200/40 mb-1">Creator (optional)</label>
                    <div className="flex items-center gap-2">
                      <input type="text" value={newVideo.creatorName}
                        onChange={(e) => setNewVideo({ ...newVideo, creatorName: e.target.value })}
                        placeholder="Cooking Channel Name"
                        className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
                      <button type="button" onClick={() => {
                        if (!newVideo.url || !newVideo.title) return;
                        setVideoEntries((prev) => [...prev, { ...newVideo, tempId: Date.now().toString() }]);
                        setNewVideo({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
                      }}
                        className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
                        disabled={!newVideo.url || !newVideo.title}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={submitting || !userId || authLoading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {submitting ? 'Creating...' : authLoading ? 'Loading...' : 'Create Meal'}
                </button>
              </div>

              {postCreateMessage && !createdMealId && (
                <p className="text-sm text-red-400">{postCreateMessage}</p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Meal List (unchanged) */}
      {meals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {meals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`} className="block glass-dark rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] hover:ring-1 hover:ring-primary-500/30 group">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-semibold group-hover:text-primary-400 transition-colors" style={{ fontFamily: 'var(--font-heading)' }}>
                  {meal.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-500/10 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="h-3 w-3 text-primary-400" />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    meal.complexity === 'EASY' ? 'bg-primary-500/15 text-primary-400' :
                    meal.complexity === 'MEDIUM' ? 'bg-accent-500/15 text-accent-400' :
                    'bg-red-500/15 text-red-400'
                  }`}>
                    {meal.complexity}
                  </span>
                </div>
              </div>
              {meal.imageUrl && (
                <img src={meal.imageUrl.startsWith('http') ? meal.imageUrl : `${API_HOST}${meal.imageUrl}`}
                  alt={meal.title} className="mt-3 h-32 w-full rounded-xl object-cover" />
              )}
              <p className="mt-2 text-sm text-surface-200/50 line-clamp-2">{meal.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-surface-200/40">
                <span>{meal.preparationTime} min</span>
                <span>{meal.calories} cal</span>
                <span>{meal.estimatedCost.toLocaleString()} RWF</span>
              </div>
              {meal.tags && meal.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-800/50 px-2 py-0.5 text-[10px] text-surface-200/40">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
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
