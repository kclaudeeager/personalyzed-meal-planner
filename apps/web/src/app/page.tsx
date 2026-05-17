import {
  Utensils,
  Users,
  BarChart3,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

export default function DashboardPage(): React.JSX.Element {
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
          value="0"
          trend="+0 this week"
          color="primary"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Users"
          value="0"
          trend="+0 today"
          color="accent"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Recommendations"
          value="0"
          trend="generated today"
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
        {/* Recent Activity */}
        <div className="glass-dark rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary-400" />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent Activity
            </h2>
          </div>
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-surface-800">
            <p className="text-sm text-surface-200/40">
              Activity will appear here once users start interacting
            </p>
          </div>
        </div>

        {/* Top Performing Meals */}
        <div className="glass-dark rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-400" />
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
              Top Meals
            </h2>
          </div>
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-surface-800">
            <p className="text-sm text-surface-200/40">
              Add meals to see top performers
            </p>
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
}) {
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
