'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, Star } from 'lucide-react';

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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks(uid?: string) {
    setLoading(true);
    try {
      const path = uid ? `/api/feedback/user/${uid}` : '/api/feedback';
      const res = await fetch(`http://localhost:4000${path}`);
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

      <div className="glass-dark rounded-2xl p-4 flex items-center gap-3">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Filter by user ID"
          className="flex-1 rounded-xl bg-surface-900/50 border border-surface-800 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
        />
        <button
          onClick={() => fetchFeedbacks(userId || undefined)}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
        </button>
      </div>

      {feedbacks.length > 0 ? (
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
                <p className="mt-3 text-sm text-surface-200/60 italic">"{fb.comment}"</p>
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
