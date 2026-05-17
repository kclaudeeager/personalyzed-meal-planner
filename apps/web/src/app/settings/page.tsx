import { Settings as SettingsIcon, CheckCircle2, XCircle } from 'lucide-react';
import { getHealth } from '@/lib/api';

export const metadata = { title: 'Settings — Adaptive Meal Platform' };

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const healthResult = await getHealth().catch(() => null);

  const apiStatus = healthResult ? 'Connected' : 'Offline';
  const apiColor = healthResult ? 'bg-primary-500/15 text-primary-400' : 'bg-red-500/15 text-red-400';
  const apiIcon = healthResult ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;

  const dbStatus = healthResult?.services.database === 'ok' ? 'Connected' : 'Disconnected';
  const dbColor = healthResult?.services.database === 'ok' ? 'bg-primary-500/15 text-primary-400' : 'bg-red-500/15 text-red-400';
  const dbIcon = healthResult?.services.database === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const authStatus = clerkKey ? 'Configured' : 'Not configured';
  const authColor = clerkKey ? 'bg-primary-500/15 text-primary-400' : 'bg-surface-800 text-surface-200/50';
  const authIcon = clerkKey ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Settings
        </h1>
        <p className="mt-1 text-surface-200/60">Platform configuration and live status</p>
      </div>

      <div className="glass-dark rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-5 w-5 text-primary-400" />
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>System Status</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">API Server</p>
              <p className="text-xs text-surface-200/40">http://localhost:4000</p>
            </div>
            <span className={`rounded-full flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${apiColor}`}>
              {apiIcon} {apiStatus}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-surface-200/40">PostgreSQL via Prisma</p>
            </div>
            <span className={`rounded-full flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${dbColor}`}>
              {dbIcon} {dbStatus}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-900/50 p-4">
            <div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-xs text-surface-200/40">Clerk</p>
            </div>
            <span className={`rounded-full flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium ${authColor}`}>
              {authIcon} {authStatus}
            </span>
          </div>
        </div>
      </div>

      {healthResult && (
        <div className="glass-dark rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Health Check Details
          </h2>
          <div className="rounded-xl bg-surface-900/50 p-4 font-mono text-xs text-surface-200/60">
            <pre>{JSON.stringify(healthResult, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
