'use client';

import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  RefreshCw, 
  Database, 
  User, 
  ShieldCheck,
  CheckCircle,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { supabase } from '@/lib/supabaseClient';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { 
    collections, 
    addCollection, 
    deleteCollection, 
    dashboards, 
    updateDashboard, 
    deleteDashboard,
    isConnectedToDrive,
    isSyncing,
    syncGoogleDrive,
    isCloudMode
  } = useLibrary();
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Dashboard editing states
  const [editingDashId, setEditingDashId] = useState<string | null>(null);
  const [editDashName, setEditDashName] = useState('');
  const [editDashUrl, setEditDashUrl] = useState('');


  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCollection(newCategoryName.trim());
    setNewCategoryName('');
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Preferences & Controls
        </h1>
        <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
          Settings
        </p>
      </header>

      <div className="flex flex-col gap-8">
        
        {/* Section 1: Appearance */}
        <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
            Appearance
          </h2>
          <p className="text-xs text-muted-custom mb-4">
            Select a theme to customize your reading environment.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('oled-dark')}
              className={`p-4 border rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 text-left ${
                theme === 'oled-dark'
                  ? 'border-accent-gold bg-accent-gold/5 ring-2 ring-accent-gold/20'
                  : 'border-border-custom bg-black/20 hover:border-foreground/20'
              }`}
            >
              <div className="p-2 rounded-xl bg-neutral-900 text-accent-gold border border-neutral-800">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">OLED Black</p>
                <p className="text-[10px] text-muted-custom mt-0.5">Pitch black for low light reading.</p>
              </div>
            </button>

            <button
              onClick={() => setTheme('sepia')}
              className={`p-4 border rounded-2xl flex flex-col items-start gap-4 transition-all duration-300 text-left ${
                theme === 'sepia'
                  ? 'border-accent-gold bg-accent-gold/5 ring-2 ring-accent-gold/20'
                  : 'border-border-custom bg-yellow-500/5 hover:border-foreground/20'
              }`}
            >
              <div className="p-2 rounded-xl bg-[#FFFDF4] text-[#D97706] border border-[#F4ECE0]">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Sunlit Cream</p>
                <p className="text-[10px] text-muted-custom mt-0.5">Bright and cheerful morning colors for study.</p>
              </div>
            </button>
          </div>
        </section>

        {/* Section 2: Manage Categories */}
        <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold tracking-tight mb-2">
            Manage Categories
          </h2>
          <p className="text-xs text-muted-custom mb-4">
            Add or remove book collections. Deleted categories will remove the tag from your books but will not delete your files.
          </p>

          {/* Form to add a category */}
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="e.g. Finance, Psychology, History"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 px-4 py-3 bg-background border border-border-custom rounded-2xl text-xs focus:outline-none focus:border-accent-gold/50 transition-all text-foreground"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-accent-gold text-background border border-accent-gold rounded-2xl text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          {/* List of categories */}
          <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
            {collections.map((col) => (
              <div 
                key={col.slug}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-foreground/5 border border-border-custom/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{col.name}</span>
                  <span className="text-[10px] text-muted-custom">({col.count} items)</span>
                </div>
                
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete the "${col.name}" category?`)) {
                      deleteCollection(col.slug);
                    }
                  }}
                  className="p-1 text-muted-custom hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Manage Dashboards */}
        <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold tracking-tight mb-2">
            Manage Connected Dashboards
          </h2>
          <p className="text-xs text-muted-custom mb-4">
            Edit or remove your connected web dashboards. Any changes will immediately sync on your hub and widgets.
          </p>

          <div className="flex flex-col gap-3">
            {dashboards.map((dash) => {
              const isEditing = editingDashId === dash.id;

              return (
                <div 
                  key={dash.id}
                  className="p-4 rounded-2xl bg-foreground/5 border border-border-custom/50 flex flex-col gap-3 text-xs"
                >
                  {isEditing ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] uppercase font-bold text-muted-custom block mb-1">Name</label>
                          <input
                            type="text"
                            value={editDashName}
                            onChange={(e) => setEditDashName(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border-custom rounded-xl text-xs focus:outline-none focus:border-accent-gold/50 text-foreground"
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="text-[9px] uppercase font-bold text-muted-custom block mb-1">URL</label>
                          <input
                            type="text"
                            value={editDashUrl}
                            onChange={(e) => setEditDashUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border-custom rounded-xl text-xs focus:outline-none focus:border-accent-gold/50 text-foreground font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => setEditingDashId(null)}
                          className="px-3 py-1.5 border border-border-custom rounded-xl text-[10px] font-bold hover:bg-foreground/5 transition-all cursor-pointer text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (editDashName.trim() && editDashUrl.trim()) {
                              updateDashboard(dash.id, editDashName.trim(), editDashUrl.trim());
                              setEditingDashId(null);
                            }
                          }}
                          className="px-3 py-1.5 bg-accent-gold text-background rounded-xl text-[10px] font-bold hover:opacity-90 transition-all cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{dash.name}</span>
                          <span className="text-[9px] bg-foreground/10 text-muted-custom px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            {dash.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-custom truncate mt-1 font-mono">
                          {dash.url}
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => {
                            setEditingDashId(dash.id);
                            setEditDashName(dash.name);
                            setEditDashUrl(dash.url);
                          }}
                          className="p-2 text-muted-custom hover:text-accent-gold transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${dash.name}"?`)) {
                              deleteDashboard(dash.id);
                            }
                          }}
                          className="p-2 text-muted-custom hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Google Drive Sync */}
        <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm">
          {!isConnectedToDrive ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  Google Drive Integration
                </h2>
                <span className="text-[10px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded-full">
                  Disconnected
                </span>
              </div>
              <p className="text-xs text-muted-custom mb-6 font-serif">
                Connect your Google Account to automatically index and sync media files located under <code className="px-1.5 py-0.5 bg-foreground/5 rounded text-foreground">/Knowledge Library</code>.
              </p>

              <button
                onClick={() => window.location.href = `/api/auth/google?userId=00000000-0000-0000-0000-000000000000`}
                className="w-full py-3.5 bg-accent-gold text-background border border-accent-gold hover:opacity-95 rounded-2xl font-semibold flex items-center justify-center gap-2 border shadow-sm transition-all duration-300 cursor-pointer"
              >
                Connect Google Account
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-lg font-bold tracking-tight">
                  Google Drive Integration
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Connected
                </span>
              </div>
              <p className="text-xs text-muted-custom mb-6">
                Files inside your Google Drive folder <code className="px-1.5 py-0.5 bg-foreground/5 rounded text-foreground">/Knowledge Library</code> are automatically scanned and cataloged.
              </p>

              <button
                onClick={syncGoogleDrive}
                disabled={isSyncing}
                className={`w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 border shadow-sm transition-all duration-300 ${
                  isSyncing 
                    ? 'bg-foreground/5 text-muted-custom border-border-custom cursor-not-allowed'
                    : 'bg-accent-gold text-background border-accent-gold hover:opacity-90 hover:shadow-md cursor-pointer'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing Library...' : 'Sync Google Drive Now'}
              </button>
            </>
          )}

          {isSyncing && (
            <div className="mt-4 border border-border-custom rounded-2xl bg-black/40 overflow-hidden font-mono text-[10px] p-4 flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              <p className="text-accent-gold border-b border-border-custom pb-1 mb-1 font-bold uppercase tracking-wider">
                Sync console log
              </p>
              <p className="text-neutral-400 select-all leading-normal">
                [SYSTEM] Initiating directory scan request to Google Drive API...
              </p>
              <p className="text-neutral-400 select-all leading-normal">
                [SYSTEM] Fetching offline encrypted refresh token credentials...
              </p>
              <p className="text-accent-gold animate-pulse mt-1">
                &gt; Querying files in "/Knowledge Library" folder...
              </p>
            </div>
          )}
        </section>

        {/* Section 5: User Details & Storage */}
        <section className="bg-card border border-border-custom rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-bold text-base">User Space</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                <User className="w-5 h-5 text-muted-custom" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-none">Learning Account</p>
                <p className="text-[10px] text-muted-custom mt-1">
                  {isCloudMode ? 'Learning Account (Cloud Active)' : 'Guest Mode (Local Cache)'}
                </p>
              </div>
            </div>
            {isConnectedToDrive && (
              <button 
                onClick={async () => {
                  if (confirm('Are you sure you want to disconnect Google Drive?')) {
                    // Simulating disconnect: remove token from Supabase profile
                    await supabase.from('profiles').update({ google_refresh_token: null }).eq('id', '00000000-0000-0000-0000-000000000000');
                    window.location.reload();
                  }
                }}
                className="text-xs text-left text-red-400 hover:underline mt-2 cursor-pointer font-semibold"
              >
                Disconnect Google Account
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-serif font-bold text-base flex items-center gap-1.5">
              <Database className="w-4 h-4 text-accent-gold" /> Database Usage
            </h3>
            <div className="w-full bg-foreground/10 h-2 rounded-full overflow-hidden mt-1">
              <div className={`h-full bg-accent-gold rounded-full transition-all duration-500 ${isCloudMode ? 'w-3/12' : 'w-1/12'}`} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-custom mt-1">
              <span>{isCloudMode ? '0.1 MB of 500 MB used' : '0.0 MB (Offline mode)'}</span>
              <span>{isCloudMode ? '1%' : '0%'}</span>
            </div>
            <p className="text-[9px] text-muted-custom mt-2 leading-relaxed">
              Using Supabase Free Tier. Only text metadata, ratings, streaks, and highlights count towards the limit.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
