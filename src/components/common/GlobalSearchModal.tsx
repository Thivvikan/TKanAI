import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  FileCheck2,
  ListTodo,
  Bug,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { db } from '../../db/db';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, setSearchModalOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const [results, setResults] = useState<{
    requirements: any[];
    tasks: any[];
    bugs: any[];
    documents: any[];
    meetings: any[];
  }>({
    requirements: [],
    tasks: [],
    bugs: [],
    documents: [],
    meetings: [],
  });

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  // Execute multi-entity search
  useEffect(() => {
    if (!query.trim()) {
      setResults({ requirements: [], tasks: [], bugs: [], documents: [], meetings: [] });
      return;
    }

    const q = query.toLowerCase();

    Promise.all([
      db.requirements.filter((r) => r.title.toLowerCase().includes(q) || r.key.toLowerCase().includes(q)).limit(4).toArray(),
      db.tasks.filter((t) => t.title.toLowerCase().includes(q) || t.key.toLowerCase().includes(q)).limit(4).toArray(),
      db.issues.filter((i) => i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)).limit(4).toArray(),
      db.documents.filter((d) => d.title.toLowerCase().includes(q) || d.key.toLowerCase().includes(q)).limit(4).toArray(),
      db.meetings.filter((m) => m.title.toLowerCase().includes(q)).limit(3).toArray(),
    ]).then(([requirements, tasks, bugs, documents, meetings]) => {
      setResults({ requirements, tasks, bugs, documents, meetings });
    });
  }, [query]);

  if (!isSearchModalOpen) return null;

  const handleSelect = (path: string) => {
    setSearchModalOpen(false);
    navigate(path);
  };

  const hasAnyResults =
    results.requirements.length > 0 ||
    results.tasks.length > 0 ||
    results.bugs.length > 0 ||
    results.documents.length > 0 ||
    results.meetings.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-2xl overflow-hidden animate-slide-up">
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all requirements, tasks, bugs, documents, meetings..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords or ID (e.g. <span className="font-mono text-brand-500">REQ-001</span>, <span className="font-mono text-brand-500">TASK-102</span>, <span className="font-mono text-brand-500">Redis</span>, <span className="font-mono text-brand-500">Lock</span>) to search across the entire ecosystem.
            </div>
          ) : !hasAnyResults ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Requirements */}
              {results.requirements.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <FileCheck2 className="h-3.5 w-3.5 text-teal-500" /> Requirements ({results.requirements.length})
                  </h4>
                  <div className="space-y-1">
                    {results.requirements.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(`/projects/${r.projectId}/requirements`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-1.5 py-0.5 rounded">
                            {r.key}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{r.title}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <ListTodo className="h-3.5 w-3.5 text-blue-500" /> Tasks ({results.tasks.length})
                  </h4>
                  <div className="space-y-1">
                    {results.tasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect(`/projects/${t.projectId}/board`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded">
                            {t.key}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{t.title}</span>
                          <span className="text-[10px] text-slate-400">({t.status})</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bugs */}
              {results.bugs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Bug className="h-3.5 w-3.5 text-rose-500" /> Bugs & Issues ({results.bugs.length})
                  </h4>
                  <div className="space-y-1">
                    {results.bugs.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelect(`/projects/${b.projectId}/issues`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded">
                            {b.key}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{b.title}</span>
                          <span className="text-[10px] text-rose-500 font-bold">[{b.severity}]</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <BookOpen className="h-3.5 w-3.5 text-purple-500" /> Documents ({results.documents.length})
                  </h4>
                  <div className="space-y-1">
                    {results.documents.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect(`/projects/${d.projectId}/documentation`)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.5 rounded">
                            {d.key}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-slate-100">{d.title}</span>
                          <span className="text-[10px] text-slate-400">({d.category})</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
