import {
  Utensils,
  Users,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { getMeals, getHealth } from '@/lib/api';

export const metadata = { title: 'Dashboard — Adaptive Meal Platform' };

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const [mealsResult, health] = await Promise.allSettled([
    getMeals(1, 100),
    getHealth(),
  ]);

  const totalMeals = mealsResult.status === 'fulfilled' ? mealsResult.value.meta?.total ?? 0 : 0;
  const dbStatus = health.status === 'fulfilled' ? health.value.services?.database : 'error';

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-surface-200/60">
          Welcome to the Adaptive Meal Platform admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Utensils className="h-5 w-5" />}
          label="Total Meals"
          value={String(totalMeals)}
          trend={totalMeals === 0 ? 'Add your first meal' : 'in catalog'}
          color="primary"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Database"
          value={dbStatus === 'ok' ? 'Online' : 'Offline'}
          trend={dbStatus === 'ok' ? 'PostgreSQL connected' : 'Check connection'}
          color={dbStatus === 'ok' ? 'primary' : 'accent'}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Recommendations"
          value="Active"
          trend="Rule-based engine ready"
          color="primary"
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Avg Rating"
          value="—"
          trend="across all meals"
          color="accent"
        />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Meals */}
        <div className="glass-dark rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent Meals
            </h2>
          </div>
          {mealsResult.status === 'fulfilled' && mealsResult.value.data?.length > 0 ? (
            <div className="space-y-3">
              {mealsResult.value.data.slice(0, 5).map((meal: { id: string; title: string; preparationTime: number; calories: number; complexity: string }) => (
                <div
                  key={meal.id}
                  className="flex items-center justify-between rounded-xl bg-surface-900/50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{meal.title}</p>
                    <p className="text-xs text-surface-200/40">
                      {meal.preparationTime} min · {meal.calories} cal
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-500/15 px-2.5 py-1 text-xs font-medium text-primary-400">
                    {meal.complexity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-surface-800">
              <p className="text-sm text-surface-200/40">
                No meals yet — add your first Rwandan meal
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-dark rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-400" />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Quick Actions
            </h2>
          </div>
          <div className="space-y-3">
            <a
              href="/meals"
              className="flex items-center gap-3 rounded-xl bg-surface-900/50 p-4 transition-colors hover:bg-surface-800/50"
            >
              <Utensils className="h-5 w-5 text-primary-400" />
              <div>
                <p className="text-sm font-medium">Add a Meal</p>
                <p className="text-xs text-surface-200/40">Create a new meal in the catalog</p>
              </div>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 rounded-xl bg-surface-900/50 p-4 transition-colors hover:bg-surface-800/50"
            >
              <BarChart3 className="h-5 w-5 text-accent-400" />
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-surface-200/40">Check database and API health</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  color: 'primary' | 'accent';
}): React.JSX.Element {
  const bg = color === 'primary' ? 'from-primary-600/20 to-primary-800/10' : 'from-accent-600/20 to-accent-800/10';
  const iconBg = color === 'primary' ? 'bg-primary-500/15 text-primary-400' : 'bg-accent-500/15 text-accent-400';

  return (
    <div
      className={`glass-dark rounded-2xl bg-gradient-to-br ${bg} p-5 transition-transform duration-200 hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-sm font-medium text-surface-200/50">{label}</p>
      </div>
      <p className="mt-2 text-xs text-surface-200/30">{trend}</p>
    </div>
  );
}
