import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Sun,
  Moon,
  Database,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { initializeDatabase } from '../../db/seedData';
import { db } from '../../db/db';
import confetti from 'canvas-confetti';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme, isResearchMode, toggleResearchMode } = useUIStore();
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset the IndexedDB database back to the default Zyroute seed data? All custom modifications will be re-initialized.')) {
      return;
    }

    setIsResetting(true);
    try {
      await initializeDatabase(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to reset DB:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportDB = async () => {
    const data = {
      projects: await db.projects.toArray(),
      requirements: await db.requirements.toArray(),
      tasks: await db.tasks.toArray(),
      issues: await db.issues.toArray(),
      documents: await db.documents.toArray(),
      changeRequests: await db.changeRequests.toArray(),
      meetings: await db.meetings.toArray(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tkanai_sdlc_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-bold">
            Configuration
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            System & Research Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage local IndexedDB persistence, reset research demo datasets, toggle appearance, and export project telemetry.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>Successfully re-initialized IndexedDB with clean Zyroute seed dataset!</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Appearance Card */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-4 w-4 text-brand-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
            Theme & Visual Appearance
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Active mode: <strong>{theme === 'dark' ? 'Dark Mode (Default)' : 'Light Mode'}</strong>
            </span>
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              Toggle {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Research Mode Card */}
        <div className="glass-card p-5 space-y-4 glow-ai-border">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai-500" />
            Research & Demonstration Mode
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md">
              Highlights AI confidence scores, clarity indices, and telemetry badges optimized for academic evaluations and screenshots.
            </p>
            <button
              onClick={toggleResearchMode}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                isResearchMode
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isResearchMode ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* IndexedDB Management Card */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-brand-500" />
            Local IndexedDB Persistence Engine
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Database name: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">AI_Ecosystem_ResearchDB</code> (Dexie.js abstraction).
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting Database...' : 'Reset Demo Data'}</span>
            </button>

            <button
              onClick={handleExportDB}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span>Export JSON Backup</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
