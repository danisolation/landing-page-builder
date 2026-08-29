'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import { Icons } from './SidebarIcons';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const tAria = useTranslations('aria');
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'vi';
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const isLoginPage = pathWithoutLocale === '/login';
  const isPublicPage = !pathWithoutLocale.startsWith('/dashboard') &&
    !pathWithoutLocale.startsWith('/pages') &&
    pathWithoutLocale !== '/';

  if (isLoginPage || isPublicPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: Icons.dashboard },
    { href: '/pages', label: t('nav.pages'), icon: Icons.pages },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors lg:hidden"
              aria-label={tAria('toggleSidebar')}
            >
              {Icons.menu}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-lg lg:text-xl font-bold text-foreground tracking-tight">
                {t('common.appName')}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{t('common.admin')}</span>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2 min-w-[100px]">
              {Icons.logout}
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-16 bottom-0 left-0 z-40 bg-card border-r border-border overflow-hidden transition-all duration-300 ease-in-out
            w-0 lg:w-64
            ${mobileSidebarOpen ? '!w-64 z-50' : ''}
          `}
        >
          <nav className="p-3 space-y-1 h-full overflow-y-auto scrollbar-thin">
            {navItems.map((item) => {
              const isActive = pathname === `/${locale}${item.href}` ||
                (item.href !== '/dashboard' && pathname.startsWith(`/${locale}${item.href}`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 transition-sidebar lg:ml-64">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
