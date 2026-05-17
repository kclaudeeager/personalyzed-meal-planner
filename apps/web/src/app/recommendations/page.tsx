import { Sparkles } from 'lucide-react';

export const metadata = { title: 'Recommendations — Adaptive Meal Platform' };

export default function RecommendationsPage(): React.JSX.Element {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Recommendations
        </h1>
        <p className="mt-1 text-surface-200/60">Monitor and manage AI-powered meal recommendations</p>
      </div>

      <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-surface-200/20" />
          <p className="mt-4 text-lg font-medium text-surface-200/40">No recommendations generated</p>
          <p className="mt-1 text-sm text-surface-200/25">Recommendations will appear once users and meals are added</p>
        </div>
      </div>
    </div>
  );
}
