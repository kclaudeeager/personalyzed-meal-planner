import { MessageSquare } from 'lucide-react';

export const metadata = { title: 'Feedback — Adaptive Meal Platform' };

export default function FeedbackPage(): React.JSX.Element {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Feedback
        </h1>
        <p className="mt-1 text-surface-200/60">Review user feedback and meal ratings</p>
      </div>

      <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-surface-200/20" />
          <p className="mt-4 text-lg font-medium text-surface-200/40">No feedback yet</p>
          <p className="mt-1 text-sm text-surface-200/25">User meal feedback and ratings will appear here</p>
        </div>
      </div>
    </div>
  );
}
