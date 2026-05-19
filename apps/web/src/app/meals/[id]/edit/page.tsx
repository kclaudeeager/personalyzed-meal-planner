'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Save, Loader2, Video, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import Link from 'next/link';
import { API_BASE, API_HOST } from '@/lib/api';

interface VideoLink {
  url: string;
  source: string;
  title: string;
  creatorName: string;
}

export default function EditMealPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [videoLink, setVideoLink] = useState<VideoLink>({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
  const [addingVideo, setAddingVideo] = useState(false);

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
    fetchMeal();
  }, [id]);

  async function fetchMeal() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meals/${id}`);
      const json = await res.json();
      const meal = json.data;
      if (meal) {
        setForm({
          title: meal.title,
          description: meal.description,
          preparationTime: String(meal.preparationTime),
          estimatedCost: String(meal.estimatedCost),
          calories: String(meal.calories),
          cuisineType: meal.cuisineType,
          complexity: meal.complexity,
          tags: (meal.tags ?? []).join(', '),
          imageUrl: meal.imageUrl ?? '',
        });
      }
    } catch {
      setMessage('Failed to load meal');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) { setMessage('Enter your user ID'); return; }
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/meals/${id}`, {
        method: 'PATCH',
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
      if (res.ok) {
        setMessage('✅ Meal updated successfully');
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.message ?? 'Update failed'}`);
      }
    } catch {
      setMessage('❌ Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/meals/${id}/media`, {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: fd,
      });
      const json = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: json.imageUrl }));
        setMessage('✅ Image uploaded');
      } else {
        setMessage(`❌ ${json.message ?? 'Upload failed'}`);
      }
    } catch {
      setMessage('❌ Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleAddVideo() {
    if (!videoLink.url || !videoLink.title || !userId) return;
    setAddingVideo(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/meals/${id}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(videoLink),
      });
      if (res.ok) {
        setMessage('✅ Video link added');
        setVideoLink({ url: '', source: 'YOUTUBE', title: '', creatorName: '' });
      } else {
        const err = await res.json();
        setMessage(`❌ ${err.message ?? 'Failed'}`);
      }
    } catch {
      setMessage('❌ Failed to add video');
    } finally {
      setAddingVideo(false);
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
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href={`/meals/${id}`} className="inline-flex items-center gap-2 text-sm text-surface-200/60 hover:text-surface-100">
          <ArrowLeft className="h-4 w-4" /> Back to meal
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
        Edit Meal
      </h1>

      <div className="glass-dark rounded-2xl p-4 flex items-center gap-3">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Your user ID (for authorization)"
          className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
        />
      </div>

      {message && (
        <div className="rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-dark rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>Meal Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Title</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Description</label>
            <textarea required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Prep Time (min)</label>
            <input type="number" required min="1" value={form.preparationTime}
              onChange={(e) => setForm({ ...form, preparationTime: e.target.value })}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Cost (RWF)</label>
            <input type="number" required min="0" value={form.estimatedCost}
              onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Calories</label>
            <input type="number" required min="0" value={form.calories}
              onChange={(e) => setForm({ ...form, calories: e.target.value })}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
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
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="glass-dark rounded-2xl p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
          <ImageIcon className="h-5 w-5 text-primary-400" /> Meal Image
        </h2>
        {form.imageUrl && (
          <div className="relative inline-block">
            <img src={form.imageUrl.startsWith('http') ? form.imageUrl : `${API_HOST}${form.imageUrl}`}
              alt="Meal" className="h-40 rounded-xl object-cover" />
            <button onClick={() => setForm({ ...form, imageUrl: '' })}
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <label className="flex items-center gap-2 rounded-xl bg-surface-900/50 border border-surface-800 px-4 py-3 text-sm cursor-pointer hover:border-primary-500/50 transition-colors">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5 text-surface-400" />}
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      <div className="glass-dark rounded-2xl p-6 space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
          <Video className="h-5 w-5 text-primary-400" /> Add Preparation Video
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Video URL</label>
            <input type="url" value={videoLink.url}
              onChange={(e) => setVideoLink({ ...videoLink, url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Title</label>
            <input type="text" value={videoLink.title}
              onChange={(e) => setVideoLink({ ...videoLink, title: e.target.value })}
              placeholder="How to cook this meal"
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Source</label>
            <select value={videoLink.source}
              onChange={(e) => setVideoLink({ ...videoLink, source: e.target.value })}
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500">
              <option value="YOUTUBE">YouTube</option>
              <option value="TIKTOK">TikTok</option>
              <option value="ORIGINAL">Original</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-surface-200/60 mb-1">Creator Name (optional)</label>
            <input type="text" value={videoLink.creatorName}
              onChange={(e) => setVideoLink({ ...videoLink, creatorName: e.target.value })}
              placeholder="Cooking Channel Name"
              className="w-full rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div className="flex justify-end">
          <button onClick={handleAddVideo} disabled={!videoLink.url || !videoLink.title || addingVideo}
            className="flex items-center gap-2 rounded-xl bg-surface-800/50 border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-200/80 hover:bg-surface-700 transition-all disabled:opacity-50">
            {addingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {addingVideo ? 'Adding...' : 'Add Video Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
