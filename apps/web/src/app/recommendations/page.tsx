'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useUserId } from '@/hooks/use-user';
import { API_BASE } from '@/lib/api';

interface Recommendation {
  score: number;
  meal: {
    id: string;
    title: string;
    description: string;
    preparationTime: number;
    estimatedCost: number;
    calories: number;
    complexity: string;
    tags: string[];
  };
}

export default function RecommendationsPage(): React.JSX.Element {
  const { userId, isSignedIn } = useUserId();
  const [recommendations, setRecommendations] = useState<{
    breakfast: Recommendation[];
    lunch: Recommendation[];
    dinner: Recommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRecommendations(userId);
    }
  }, [userId]);

  async function fetchRecommendations(uid: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recommendations/daily/${uid}`);
      const json = await res.json();
      setRecommendations(json.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Recommendations
        </h1>
        <p className="mt-1 text-surface-200/60">AI-powered meal recommendations</p>
      </div>

      {!isSignedIn && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
          Sign in to see personalized recommendations.
        </div>
      )}

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      )}

      {recommendations && !loading && (
        <div className="space-y-6">
          {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
            <div key={mealType}>
              <h2 className="text-xl font-semibold mb-3 capitalize" style={{ fontFamily: 'var(--font-heading)' }}>
                {mealType}
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {recommendations[mealType]?.map((rec, i) => (
                  <div key={i} className="glass-dark rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold">{rec.meal.title}</span>
                      <span className="rounded-full bg-primary-500/15 px-2.5 py-1 text-xs font-medium text-primary-400">
                        {(rec.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-surface-200/50 mb-3 line-clamp-2">{rec.meal.description}</p>
                    <div className="flex items-center gap-3 text-xs text-surface-200/40">
                      <span>{rec.meal.preparationTime} min</span>
                      <span>{rec.meal.calories} cal</span>
                      <span>{rec.meal.estimatedCost.toLocaleString()} RWF</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!recommendations && !loading && isSignedIn && (
        <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
          <div className="text-center">
            <Sparkles className="mx-auto h-12 w-12 text-surface-200/20" />
            <p className="mt-4 text-lg font-medium text-surface-200/40">No recommendations yet</p>
            <p className="mt-1 text-sm text-surface-200/25">Generate daily recommendations from the API first</p>
          </div>
        </div>
      )}
    </div>
  );
}
