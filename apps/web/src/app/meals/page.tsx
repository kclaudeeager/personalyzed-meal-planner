'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils, Plus, X, Loader2, ExternalLink, Eye,
  Image as ImageIcon, Video, Link as LinkIcon, CheckCircle2,
} from 'lucide-react';
import { API_BASE, API_HOST } from '@/lib/api';

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

export default function MealsPage(): React.JSX.Element {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [userId, setUserId] = useState('');
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
  });

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
    setForm({ title: '', description: '', preparationTime: '', estimatedCost: '', calories: '', cuisineType: 'RWANDAN', complexity: 'MEDIUM', tags: '', imageUrl: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setExtraImageUrls(['']);
    setVideoEntries([]);
    setNewVideo({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
    setCreatedMealId(null);
    setPostCreateMessage('');
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
          imageUrl: form.imageUrl || undefined,
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
            <form onSubmit={handleSubmit} className="glass-dark rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                New Meal
              </h2>

              <div className="rounded-xl bg-surface-900/50 border border-surface-800 p-3 flex items-center gap-3">
                <input type="text" value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Your user ID (for authorization)"
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-surface-200/30" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-200/60 mb-1">Title</label>
                  <input type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="Isombe with Ubugali" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-200/60 mb-1">Description</label>
                  <input type="text" required value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="Traditional Rwandan dish..." />
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
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-surface-200/60 mb-1">Tags (comma-separated)</label>
                  <input type="text" value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="traditional, vegetarian, lunch" />
                </div>
              </div>

              {/* Image Section */}
              <div className="border-t border-surface-800/50 pt-4">
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

              {/* Video Section */}
              <div className="border-t border-surface-800/50 pt-4">
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
                <button type="submit" disabled={submitting || !userId}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {submitting ? 'Creating...' : 'Create Meal'}
                </button>
              </div>

              {postCreateMessage && !createdMealId && (
                <p className="text-sm text-red-400">{postCreateMessage}</p>
              )}
            </form>
          )}
        </div>
      )}

      {/* Meal List */}
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
              {meal.tags.length > 0 && (
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
