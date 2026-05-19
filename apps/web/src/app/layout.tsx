import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adaptive Meal Platform — Dashboard',
  description:
    'AI-powered personalized meal planning for Rwandan households. Manage meals, users, and recommendations.',
  keywords: ['meal planning', 'Rwanda', 'nutrition', 'AI recommendations', 'Kigali'],
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} bg-surface-950 text-surface-100 min-h-screen`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
