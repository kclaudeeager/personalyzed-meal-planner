import { Settings as SettingsIcon } from 'lucide-react';

export const metadata = { title: 'Settings — Adaptive Meal Platform' };

export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
        <p className="mt-1 text-surface-200/60">Platform configuration and preferences</p>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-5 w-5 text-primary-400" />
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>General</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">API Endpoint</p>
              <p className="text-xs text-surface-200/40">http://localhost:4000</p>
            </div>
            <span className="rounded-full bg-primary-500/15 px-2.5 py-1 text-xs font-medium text-primary-400">Connected</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-surface-200/40">PostgreSQL via Prisma</p>
            </div>
            <span className="rounded-full bg-surface-800 px-2.5 py-1 text-xs font-medium text-surface-200/50">Pending</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-xs text-surface-200/40">Clerk</p>
            </div>
            <span className="rounded-full bg-surface-800 px-2.5 py-1 text-xs font-medium text-surface-200/50">Not configured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
