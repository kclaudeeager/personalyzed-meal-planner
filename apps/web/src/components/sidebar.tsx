'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Utensils,
  Users,
  Sparkles,
  MessageSquare,
  Settings,
  ChefHat,
  Calendar,
  ShoppingCart,
  LogIn,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Meals', href: '/meals', icon: Utensils },
  { name: 'Meal Planner', href: '/meal-planner', icon: Calendar },
  { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <aside className="glass-dark flex w-64 flex-col border-r border-surface-800/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
          <ChefHat className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1
            className="text-sm font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            MealPlatform
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-surface-200/40">
            Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-surface-200/50 hover:bg-surface-800/50 hover:text-surface-100',
              )}
            >
              <item.icon
                className={clsx(
                  'h-4.5 w-4.5 transition-colors',
                  isActive ? 'text-primary-400' : 'text-surface-200/30 group-hover:text-surface-200/60',
                )}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse-soft" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-800/50 p-4 space-y-3">
        {isSignedIn ? (
          <div className="flex items-center gap-3 rounded-xl bg-surface-900/50 px-3 py-2.5">
            <UserButton />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-surface-200/80 truncate">Signed in</p>
              <p className="text-[10px] text-surface-200/30">Clerk</p>
            </div>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="flex w-full items-center gap-3 rounded-xl bg-surface-900/50 px-3 py-2.5 text-sm text-surface-200/60 hover:bg-surface-800/50 hover:text-surface-100 transition-colors">
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          </SignInButton>
        )}
        <div className="rounded-xl bg-gradient-to-r from-primary-900/30 to-accent-900/30 p-3">
          <p className="text-xs font-medium text-surface-200/60">Adaptive Meal Platform</p>
          <p className="text-[10px] text-surface-200/30">v0.1.0 — MVP</p>
        </div>
      </div>
    </aside>
  );
}
