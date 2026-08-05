'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  TrendingUp, 
  BookOpen, 
  Compass, 
  Brain, 
  ExternalLink, 
  Lock, 
  RefreshCw,
  Plus,
  X
} from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

const getIcon = (type: string) => {
  switch (type) {
    case 'trading': return TrendingUp;
    case 'quran': return BookOpen;
    case 'fateh': return Compass;
    case 'ai': return Brain;
    default: return Compass;
  }
};

const getColorClass = (type: string) => {
  switch (type) {
    case 'trading': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    case 'quran': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    case 'fateh': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    case 'ai': return 'text-purple-400 border-purple-500/20 bg-purple-500/5';
    default: return 'text-neutral-400 border-neutral-500/20 bg-neutral-500/5';
  }
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const { dashboards, addDashboard } = useLibrary();
  const [activePortal, setActivePortal] = useState('trading');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDashName, setNewDashName] = useState('');
  const [newDashUrl, setNewDashUrl] = useState('');

  useEffect(() => {
    const portalParam = searchParams.get('portal');
    if (portalParam && dashboards.some(p => p.id === portalParam)) {
      setActivePortal(portalParam);
    }
  }, [searchParams, dashboards]);

  const currentPortal = dashboards.find(p => p.id === activePortal) || dashboards[0] || null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDashName.trim() || !newDashUrl.trim()) return;
    addDashboard(newDashName.trim(), newDashUrl.trim());
    
    // Automatically select the newly created dashboard
    const newId = newDashName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setActivePortal(newId);

    setNewDashName('');
    setNewDashUrl('');
    setShowAddForm(false);
  };

  const Icon = currentPortal ? getIcon(currentPortal.iconType) : Compass;
  const colorClass = currentPortal ? getColorClass(currentPortal.iconType) : '';

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full flex flex-col h-screen max-h-screen relative">
      <header className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
            Connected portals
          </h1>
          <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
            Dashboards Hub
          </p>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-accent-gold text-background border border-accent-gold rounded-2xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Connect Link
        </button>
      </header>

      {/* Dynamic Pop-up Add Dashboard Form */}
      {showAddForm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-6">
          <div className="bg-card border border-border-custom p-6 rounded-3xl max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-all cursor-pointer"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-lg font-bold mb-2">Connect New Portal</h3>
            <p className="text-xs text-muted-custom mb-5">
              Enter the title and address of any external web service or dashboard. It will load inside our premium frame frame.
            </p>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-custom">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Stock Portfolio"
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  className="px-4 py-3 bg-background border border-border-custom rounded-2xl text-xs focus:outline-none focus:border-accent-gold/50 text-foreground"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted-custom">
                  Web URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. tradingview.com or vercel.app link"
                  value={newDashUrl}
                  onChange={(e) => setNewDashUrl(e.target.value)}
                  className="px-4 py-3 bg-background border border-border-custom rounded-2xl text-xs focus:outline-none focus:border-accent-gold/50 text-foreground font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-accent-gold text-background rounded-2xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                Save Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-border-custom scrollbar-none shrink-0">
        {dashboards.map((portal) => {
          const PortIcon = getIcon(portal.iconType);
          return (
            <button
              key={portal.id}
              onClick={() => setActivePortal(portal.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold shrink-0 border transition-all ${
                activePortal === portal.id
                  ? 'bg-accent-gold border-accent-gold text-background'
                  : 'bg-card border-border-custom text-muted-custom hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              <PortIcon className="w-4 h-4" />
              {portal.name}
            </button>
          );
        })}
      </div>

      {/* Embedded Browser Container */}
      {currentPortal ? (
        <div className="flex-1 flex flex-col min-h-0 bg-card border border-border-custom rounded-3xl overflow-hidden shadow-lg relative">
          {/* Browser Header Bar */}
          <div className="h-12 bg-black/60 border-b border-border-custom px-4 flex items-center justify-between gap-4 shrink-0">
            {/* Mock controls */}
            <div className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-red-500/40" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
              <span className="w-3 h-3 rounded-full bg-green-500/40" />
            </div>

            {/* Address Bar */}
            <div className="flex-1 max-w-md h-7 rounded-lg bg-background/50 border border-border-custom flex items-center justify-between px-3 text-[10px] text-muted-custom font-mono">
              <div className="flex items-center gap-1.5 truncate">
                <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{currentPortal.url}</span>
              </div>
              <RefreshCw className="w-3 h-3 shrink-0 cursor-pointer hover:text-foreground transition-colors" />
            </div>

            {/* External link */}
            <a
              href={currentPortal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent-gold font-semibold hover:underline"
            >
              <span className="hidden sm:inline">Launch Out</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Portal Mini Stats Sub-header */}
          <div className="bg-foreground/5 border-b border-border-custom/50 px-6 py-3 flex gap-6 overflow-x-auto scrollbar-none shrink-0">
            {currentPortal.stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-muted-custom font-bold">
                  {stat.label}
                </span>
                <span className="text-xs font-bold text-foreground mt-0.5">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Simulation Sandbox / Iframe */}
          <div className="flex-1 min-h-0 relative bg-slate-950">
            <iframe
              src={currentPortal.url}
              className="w-full h-full border-0 bg-slate-950"
              title={currentPortal.name}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 border border-dashed border-border-custom rounded-3xl flex flex-col items-center justify-center text-center p-8 select-none">
          <Compass className="w-12 h-12 text-muted-custom mb-3 opacity-50 animate-pulse" />
          <h3 className="font-serif text-lg font-bold">No dashboards connected</h3>
          <p className="text-xs text-muted-custom max-w-xs mt-1">
            Click "Connect Link" in the top corner to add a portal.
          </p>
        </div>
      )}
    </div>
  );
}

const XIcon = X;

export default function Dashboards() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 text-muted-custom font-serif text-sm">
        Loading dashboards portal...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
