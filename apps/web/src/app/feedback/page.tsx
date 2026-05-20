'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, Star } from 'lucide-react';
import { useUserId } from '@/hooks/use-user';
import { API_BASE } from '@/lib/api';

interface Feedback {
  id: string;
  rating: number;
  feedbackType: string;
  comment: string | null;
  createdAt: string;
  meal: {
    title: string;
  };
}

export default function FeedbackPage(): React.JSX.Element {
  const { userId, isSignedIn } = useUserId();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFeedbacks(userId);
    } else {
      fetchFeedbacks();
    }
  }, [userId]);

  async function fetchFeedbacks(uid?: string) {
    setLoading(true);
    try {
      const path = uid ? `/api/feedback/user/${uid}` : '/api/feedback';
      const res = await fetch(`${API_BASE}${path}`);
      const json = await res.json();
      setFeedbacks(json.data ?? []);
    } catch {
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Feedback
        </h1>
        <p className="mt-1 text-surface-200/60">User meal feedback and ratings</p>
      </div>

      {!isSignedIn && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-sm text-amber-400">
          Sign in to view feedback.
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="glass-dark rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{fb.meal.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < fb.rating ? 'text-accent-400 fill-accent-400' : 'text-surface-800'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-surface-200/40">{fb.feedbackType}</span>
                  </div>
                </div>
                <span className="text-xs text-surface-200/30">
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>
              {fb.comment && (
                <p className="mt-3 text-sm text-surface-200/60 italic">&ldquo;{fb.comment}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-surface-200/20" />
            <p className="mt-4 text-lg font-medium text-surface-200/40">No feedback yet</p>
            <p className="mt-1 text-sm text-surface-200/25">User meal feedback will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
}
