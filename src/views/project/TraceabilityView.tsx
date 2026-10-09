import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  GitPullRequest,
  FileCheck2,
  Layers,
  ListTodo,
  Kanban,
  TestTube2,
  Bug,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { db } from '../../db/db';

export const TraceabilityView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();

  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals(projectId).toArray()) || [];
  const epics = useLiveQuery(() => db.epics.where('projectId').equals(projectId).toArray()) || [];
  const stories = useLiveQuery(() => db.userStories.where('projectId').equals(projectId).toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(projectId).toArray()) || [];
  const testCases = useLiveQuery(() => db.testCases.where('projectId').equals(projectId).toArray()) || [];
  const bugs = useLiveQuery(() => db.issues.where('projectId').equals(projectId).toArray()) || [];
  const documents = useLiveQuery(() => db.documents.where('projectId').equals(projectId).toArray()) || [];

  const [selectedReqId, setSelectedReqId] = useState<string>('req-01');

  const activeReq = requirements.find((r) => r.id === selectedReqId) || requirements[0];
  const activeEpic = epics.find((e) => e.id === activeReq?.epicId);
  const activeStories = stories.filter((s) => s.requirementId === activeReq?.id);
  const activeTasks = tasks.filter((t) => t.requirementId === activeReq?.id);
  const activeTestCases = testCases.filter((tc) => tc.requirementId === activeReq?.id);
  const activeBugs = bugs.filter((b) => b.relatedRequirementId === activeReq?.id);
  const activeDocs = documents.filter((d) => d.linkedRequirementIds?.includes(activeReq?.id || ''));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-bold">
            End-to-End Governance
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Requirements Traceability Matrix
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Trace verified linkages from business intent down to epics, user stories, development tasks, test cases, detected bugs, and living SRS documentation.
        </p>
      </div>

      {/* Requirement Selector Chips */}
      <div className="glass-card p-4 space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
          Select Source Requirement to Trace
        </label>
        <div className="flex flex-wrap gap-2">
          {requirements.map((req) => {
            const isSelected = activeReq?.id === req.id;
            return (
              <button
                key={req.id}
                onClick={() => setSelectedReqId(req.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-400 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span className="font-mono text-[10px]">{req.key}</span>
                <span className="truncate max-w-[200px]">{req.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Multi-Tier Traceability Flow */}
      {activeReq && (
        <div className="space-y-4">
          {/* Level 1: Requirement Card */}
          <div className="glass-card p-5 border-l-4 border-l-teal-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded">
                Tier 1: Requirement ({activeReq.key})
              </span>
              <span className="text-xs font-bold text-emerald-500">{activeReq.status}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeReq.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{activeReq.description}</p>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>

          {/* Level 2: Epics & Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Epic */}
            <div className="glass-card p-4 border-l-4 border-l-blue-500 space-y-2">
              <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
                Tier 2: Epic {activeEpic ? `(${activeEpic.key})` : ''}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeEpic?.name || 'Seat Selection & Inventory Locking'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeEpic?.description || 'Interactive visual seat map with temporary locks.'}
              </p>
            </div>

            {/* Stories */}
            <div className="glass-card p-4 border-l-4 border-l-indigo-500 space-y-2">
              <span className="font-mono text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded">
                Tier 3: User Stories ({activeStories.length})
              </span>
              <div className="space-y-1.5">
                {activeStories.map((s) => (
                  <div key={s.id} className="text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="font-semibold">{s.key}: {s.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.storyPoints} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>

          {/* Level 3: Development Tasks & QA Test Cases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tasks */}
            <div className="glass-card p-4 border-l-4 border-l-brand-500 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded">
                  Tier 4: Tasks ({activeTasks.length})
                </span>
                <Link to={`/projects/${projectId}/board`} className="text-[11px] text-brand-500 hover:underline">
                  View on Board
                </Link>
              </div>
              <div className="space-y-1.5">
                {activeTasks.map((t) => (
                  <div key={t.id} className="text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{t.key}: {t.title}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Cases */}
            <div className="glass-card p-4 border-l-4 border-l-amber-500 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                  Tier 5: Test Cases ({activeTestCases.length})
                </span>
                <Link to={`/projects/${projectId}/testing`} className="text-[11px] text-amber-500 hover:underline">
                  QA Lab
                </Link>
              </div>
              <div className="space-y-1.5">
                {activeTestCases.map((tc) => (
                  <div key={tc.id} className="text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{tc.key}: {tc.title}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      tc.status === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowRight className="h-5 w-5 rotate-90" />
          </div>

          {/* Level 4: Defects & Linked Documentation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bugs */}
            <div className="glass-card p-4 border-l-4 border-l-rose-500 space-y-2">
              <span className="font-mono text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded">
                Tier 6: Linked Bugs ({activeBugs.length})
              </span>
              <div className="space-y-1.5">
                {activeBugs.length === 0 ? (
                  <p className="text-xs text-emerald-500 font-medium">No open defects linked to this requirement.</p>
                ) : (
                  activeBugs.map((b) => (
                    <div key={b.id} className="text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between">
                      <span className="font-bold">{b.key}: {b.title}</span>
                      <span className="text-[10px] uppercase font-black">{b.status}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-4 border-l-4 border-l-purple-500 space-y-2">
              <span className="font-mono text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded">
                Tier 7: Linked Documentation ({activeDocs.length})
              </span>
              <div className="space-y-1.5">
                {activeDocs.map((d) => (
                  <div key={d.id} className="text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{d.key}: {d.title}</span>
                    <span className="text-[10px] font-mono text-purple-500">{d.version}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
