'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Video, 
  FileText, 
  LayoutDashboard, 
  Star, 
  Settings,
  Activity 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Ebooks', href: '/ebooks', icon: BookOpen },
  { label: 'Videos', href: '/videos', icon: Video },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Dashboards', href: '/dashboards', icon: LayoutDashboard },
  { label: 'Favorites', href: '/favorites', icon: Star },
  { label: 'Summary', href: '/summary', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Ebooks', href: '/ebooks', icon: BookOpen },
  { label: 'Videos', href: '/videos', icon: Video },
  { label: 'Summary', href: '/summary', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card/70 backdrop-blur-md border-r border-border-custom/50 px-4 py-6 z-20">
        <div className="flex items-center gap-3 px-2 mb-8">
          <BookOpen className="w-8 h-8 text-accent-gold" />
          <span className="font-serif text-xl font-bold tracking-tight text-accent-gold">
            Ummi's Library
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-accent-gold/10 text-accent-gold font-medium' 
                    : 'text-muted-custom hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-accent-gold' : 'text-muted-custom group-hover:text-foreground'
                }`} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer theme indicator */}
        <div className="pt-4 border-t border-border-custom mt-auto">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-muted-custom hover:text-foreground transition-colors"
          >
            <span>Theme</span>
            <span className="px-2 py-0.5 rounded-md bg-foreground/10 text-[10px] uppercase font-bold tracking-wider">
              {theme === 'oled-dark' ? 'OLED Dark' : 'Sunlit'}
            </span>
          </button>
        </div>
      </aside>

      {/* Bottom Nav for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/75 backdrop-blur-md border-t border-border-custom/50 flex items-center justify-around px-2 z-20 pb-safe">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive ? 'text-accent-gold' : 'text-muted-custom'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-0 min-h-screen flex flex-col">
        {children}
      </main>
    </div>
  );
}
