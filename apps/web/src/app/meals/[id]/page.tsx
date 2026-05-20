'use client';

import { useState, useEffect, use } from 'react';
import {
  ArrowLeft, Clock, DollarSign, Flame, Utensils, Video, ExternalLink,
  Loader2, Pencil, ChefHat, BarChart3, ArrowRight, User, CheckCircle2,
  XCircle, Clock as ClockIcon, ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE, API_HOST } from '@/lib/api';
import { useUserId } from '@/hooks/use-user';

interface Ingredient {
  id: string;
  quantity: number;
  unit: string;
  ingredient: { id: string; name: string; localAvailability: string; averageCost: number };
}

interface Nutrition {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: string | null;
}

interface Step {
  id: string;
  stepNumber: number;
  instruction: string;
}

interface Video {
  id: string;
  url: string;
  source: string;
  title: string;
  creatorName: string | null;
}

interface Creator {
  id: string;
  fullName: string;
  email: string;
}

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
  mealTypes: string[];
  accompaniments: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdBy: Creator | null;
  validationStatus: string;
  validatedBy: Creator | null;
  validationComment: string | null;
  ingredients: Ingredient[];
  nutritionProfile: Nutrition | null;
  steps: Step[];
  videos: Video[];
  _count: { feedback: number; recommendations: number };
}

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
};

const MEAL_TYPE_COLORS: Record<string, string> = {
  BREAKFAST: 'bg-amber-500/15 text-amber-400',
  LUNCH: 'bg-green-500/15 text-green-400',
  DINNER: 'bg-indigo-500/15 text-indigo-400',
  SNACK: 'bg-pink-500/15 text-pink-400',
};

function getVideoEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const tiktokMatch = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
  if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;

  return null;
}

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }): React.JSX.Element {
  const { id } = use(params);
  const { userId } = useUserId();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validationComment, setValidationComment] = useState('');

  useEffect(() => {
    fetchMeal();
  }, [id]);

  async function fetchMeal() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/meals/${id}?includePending=true`);
      const json = await res.json();
      setMeal(json.data ?? null);
    } catch {
      setMeal(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidate(status: string) {
    if (!userId) return;
    setValidating(true);
    try {
      const res = await fetch(`${API_BASE}/meals/${id}/validate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ status, comment: validationComment || undefined }),
      });
      if (res.ok) {
        setValidationComment('');
        fetchMeal();
      }
    } catch {
    } finally {
      setValidating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="animate-fade-in space-y-6">
        <Link href="/meals" className="inline-flex items-center gap-2 text-sm text-surface-200/60 hover:text-surface-100">
          <ArrowLeft className="h-4 w-4" /> Back to meals
        </Link>
        <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
          <p className="text-surface-200/40">Meal not found</p>
        </div>
      </div>
    );
  }

  const complexityColor =
    meal.complexity === 'EASY' ? 'bg-primary-500/15 text-primary-400' :
    meal.complexity === 'MEDIUM' ? 'bg-accent-500/15 text-accent-400' :
    'bg-red-500/15 text-red-400';

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/meals" className="inline-flex items-center gap-2 text-sm text-surface-200/60 hover:text-surface-100">
          <ArrowLeft className="h-4 w-4" /> Back to meals
        </Link>
        <Link
          href={`/meals/${id}/edit`}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110"
        >
          <Pencil className="h-4 w-4" /> Edit Meal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-dark rounded-2xl overflow-hidden">
            {meal.imageUrl ? (
              <img
                src={meal.imageUrl.startsWith('http') ? meal.imageUrl : `${API_HOST}${meal.imageUrl}`}
                alt={meal.title}
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center bg-surface-900/50">
                <Utensils className="h-16 w-16 text-surface-700" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {meal.title}
                </h1>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${complexityColor}`}>
                  {meal.complexity}
                </span>
              </div>

              {/* Meal Types Badges */}
              {meal.mealTypes && meal.mealTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {meal.mealTypes.map((type) => (
                    <span key={type} className={`rounded-full px-2.5 py-1 text-xs font-medium ${MEAL_TYPE_COLORS[type] ?? 'bg-surface-800/50 text-surface-200/40'}`}>
                      {MEAL_TYPE_LABELS[type] ?? type}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-surface-200/60 leading-relaxed">{meal.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-surface-200/40">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {meal.preparationTime} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4" /> {meal.calories} cal
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" /> {meal.estimatedCost.toLocaleString()} RWF
                </span>
              </div>

              {meal.createdBy && (
                <div className="mt-3 flex items-center gap-2 text-xs text-surface-200/40">
                  <User className="h-3 w-3" />
                  <span>Created by {meal.createdBy.fullName}</span>
                </div>
              )}

              {meal.tags && meal.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-800/50 px-2.5 py-1 text-xs text-surface-200/50">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Steps Section */}
          {meal.steps && meal.steps.length > 0 && (
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                <ArrowRight className="h-5 w-5 text-primary-400" /> How to Prepare
              </h2>
              <div className="space-y-3">
                {meal.steps.map((step, idx) => (
                  <div key={step.id}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-sm font-bold text-primary-400">
                        {step.stepNumber}
                      </div>
                      <p className="pt-1 text-sm leading-relaxed text-surface-200/80">{step.instruction}</p>
                    </div>
                    {idx < meal.steps.length - 1 && (
                      <div className="ml-4 mt-1 flex items-center gap-2 text-surface-500">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accompaniments */}
          {meal.accompaniments && (
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                <Utensils className="h-5 w-5 text-primary-400" /> Accompaniments
              </h2>
              <p className="text-sm text-surface-200/60">{meal.accompaniments}</p>
            </div>
          )}

          {/* Notes */}
          {meal.notes && (
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                <ChefHat className="h-5 w-5 text-primary-400" /> Notes
              </h2>
              <p className="text-sm text-surface-200/60">{meal.notes}</p>
            </div>
          )}

          {/* Videos */}
          {meal.videos && meal.videos.length > 0 && (
            <div className="glass-dark rounded-2xl p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                <Video className="h-5 w-5 text-primary-400" /> Video Guides
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {meal.videos.map((video) => {
                  const embedUrl = getVideoEmbedUrl(video.url);
                  return (
                    <div key={video.id} className="rounded-xl overflow-hidden bg-surface-900/50 border border-surface-800">
                      {embedUrl ? (
                        <div className="aspect-video">
                          <iframe
                            src={embedUrl}
                            title={video.title}
                            className="h-full w-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      ) : (
                        <a href={video.url} target="_blank" rel="noopener noreferrer"
                          className="flex h-40 items-center justify-center bg-surface-800 hover:bg-surface-700 transition-colors"
                        >
                          <ExternalLink className="h-8 w-8 text-surface-500" />
                        </a>
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium">{video.title}</p>
                        {video.creatorName && (
                          <p className="text-xs text-surface-200/40 mt-0.5">by {video.creatorName}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="rounded-full bg-surface-800 px-2 py-0.5 text-[10px] text-surface-200/40 uppercase">
                            {video.source}
                          </span>
                          <a href={video.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              <ChefHat className="h-5 w-5 text-primary-400" /> Ingredients
            </h2>
            {meal.ingredients && meal.ingredients.length > 0 ? (
              <div className="space-y-2">
                {meal.ingredients.map((mi) => (
                  <div key={mi.id} className="flex items-center justify-between rounded-lg bg-surface-900/50 px-3 py-2">
                    <span className="text-sm">{mi.ingredient.name}</span>
                    <span className="text-xs text-surface-200/40">
                      {mi.quantity} {mi.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-200/40">No ingredients listed</p>
            )}
          </div>

          {meal.nutritionProfile && (
            <div className="glass-dark rounded-2xl p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                <BarChart3 className="h-5 w-5 text-primary-400" /> Nutrition
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Protein', value: `${meal.nutritionProfile.protein}g`, color: 'bg-primary-500/15 text-primary-400' },
                  { label: 'Carbs', value: `${meal.nutritionProfile.carbs}g`, color: 'bg-accent-500/15 text-accent-400' },
                  { label: 'Fat', value: `${meal.nutritionProfile.fat}g`, color: 'bg-yellow-500/15 text-yellow-400' },
                  { label: 'Fiber', value: `${meal.nutritionProfile.fiber}g`, color: 'bg-green-500/15 text-green-400' },
                ].map((n) => (
                  <div key={n.label} className={`rounded-lg p-3 ${n.color}`}>
                    <p className="text-lg font-bold">{n.value}</p>
                    <p className="text-xs opacity-70">{n.label}</p>
                  </div>
                ))}
              </div>
              {meal.nutritionProfile.vitamins && (
                <p className="mt-3 text-xs text-surface-200/40">
                  Vitamins: {meal.nutritionProfile.vitamins}
                </p>
              )}
            </div>
          )}

          {/* Validation Status */}
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-surface-200/60 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Validation
            </h2>
            <div className="space-y-3">
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                meal.validationStatus === 'APPROVED' ? 'bg-green-500/15 text-green-400' :
                meal.validationStatus === 'REJECTED' ? 'bg-red-500/15 text-red-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>
                {meal.validationStatus === 'APPROVED' ? <CheckCircle2 className="h-4 w-4" /> :
                 meal.validationStatus === 'REJECTED' ? <XCircle className="h-4 w-4" /> :
                 <ClockIcon className="h-4 w-4" />}
                <span className="font-medium capitalize">{meal.validationStatus?.toLowerCase() ?? 'pending'}</span>
              </div>

              {meal.validatedBy && (
                <p className="text-xs text-surface-200/40">
                  Reviewed by {meal.validatedBy.fullName}
                </p>
              )}

              {meal.validationComment && (
                <div className="rounded-lg bg-surface-900/50 border border-surface-800 p-3">
                  <p className="text-xs text-surface-200/40 mb-1">Validator comment:</p>
                  <p className="text-sm text-surface-200/70">{meal.validationComment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Validation Panel (for super chief) */}
          <div className="glass-dark rounded-2xl p-5">
            <h2 className="mb-3 text-sm font-semibold text-surface-200/60 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Super Chief
            </h2>
            <div className="space-y-3">
              {!userId && (
                <p className="text-xs text-amber-400">Sign in to validate meals</p>
              )}
              <textarea
                value={validationComment}
                onChange={(e) => setValidationComment(e.target.value)}
                placeholder="Add a review comment (optional)"
                rows={3}
                className="w-full rounded-lg bg-surface-900/50 border border-surface-800 px-3 py-2 text-xs focus:outline-none focus:border-primary-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleValidate('APPROVED')}
                  disabled={validating || !userId}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                  Approve
                </button>
                <button
                  onClick={() => handleValidate('REJECTED')}
                  disabled={validating || !userId}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {validating ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                  Reject
                </button>
              </div>
            </div>
          </div>

          <div className="glass-dark rounded-2xl p-5">
            <h2 className="mb-3 text-sm font-semibold text-surface-200/60 uppercase tracking-wider">Quick Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-200/40">Cuisine</span>
                <span>{meal.cuisineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-200/40">Complexity</span>
                <span className={complexityColor.split(' ')[1]}>{meal.complexity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-200/40">Feedbacks</span>
                <span>{meal._count.feedback}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-200/40">Recommendations</span>
                <span>{meal._count.recommendations}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
