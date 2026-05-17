import { Utensils, Plus } from 'lucide-react';

export const metadata = { title: 'Meals — Adaptive Meal Platform' };

export default function MealsPage(): React.JSX.Element {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            Meals
          </h1>
          <p className="mt-1 text-surface-200/60">Manage the Rwandan meal catalog</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:brightness-110 active:scale-95">
          <Plus className="h-4 w-4" />
          Add Meal
        </button>
      </div>

      <div className="glass-dark flex h-96 items-center justify-center rounded-2xl">
        <div className="text-center">
          <Utensils className="mx-auto h-12 w-12 text-surface-200/20" />
          <p className="mt-4 text-lg font-medium text-surface-200/40">No meals yet</p>
          <p className="mt-1 text-sm text-surface-200/25">Add your first Rwandan meal to get started</p>
        </div>
      </div>
    </div>
  );
}
