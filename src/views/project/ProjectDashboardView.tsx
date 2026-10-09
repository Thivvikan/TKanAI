import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bug,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap,
  Kanban,
  FileCheck2,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../../db/db';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const ProjectDashboardView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();

  const project = useLiveQuery(() => db.projects.get(projectId));
  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals(projectId).toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(projectId).toArray()) || [];
  const bugs = useLiveQuery(() => db.issues.where('projectId').equals(projectId).toArray()) || [];
  const sprints = useLiveQuery(() => db.sprints.where('projectId').equals(projectId).toArray()) || [];
  const risks = useLiveQuery(() => db.risks.where('projectId').equals(projectId).toArray()) || [];
  const changeRequests = useLiveQuery(() => db.changeRequests.where('projectId').equals(projectId).toArray()) || [];
  const documents = useLiveQuery(() => db.documents.where('projectId').equals(projectId).toArray()) || [];

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Code Review' || t.status === 'QA').length;
  const criticalBugs = bugs.filter((b) => b.severity === 'Critical' && b.status !== 'Closed');
  const activeSprint = sprints.find((s) => s.status === 'Active') || sprints[0];

  // Burndown sample trend
  const burndownData = [
    { day: 'Day 1', ideal: 34, actual: 34 },
    { day: 'Day 3', ideal: 29, actual: 32 },
    { day: 'Day 5', ideal: 24, actual: 26 },
    { day: 'Day 7', ideal: 19, actual: 22 },
    { day: 'Day 9 (Today)', ideal: 14, actual: 16 },
    { day: 'Day 12', ideal: 8, actual: null },
    { day: 'Day 14', ideal: 0, actual: null },
  ];

  return (
    <div className="space-y-6">
      {/* Project Banner */}
      <div className="glass-card p-6 border-l-4 border-l-brand-500 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                {project?.key || 'ZYR'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {project?.name || 'Zyroute – Online Bus Reservation System'}
              </h1>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                {project?.status || 'Active'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              {project?.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/projects/${projectId}/board`}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
            >
              <Kanban className="h-4 w-4" />
              <span>Open Kanban</span>
            </Link>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Stack:
          </span>
          {(project?.technologyStack || ['React', 'TypeScript', 'Redis Redlock', 'PostgreSQL', 'Stripe']).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Critical Bug Alert Banner if present */}
      {criticalBugs.length > 0 && (
        <div className="rounded-2xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <Bug className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-rose-950 dark:text-rose-100">
                Critical Bug Active: {criticalBugs[0].key} — {criticalBugs[0].title}
              </h4>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                AI Diagnostic: {criticalBugs[0].aiIntelligence?.possibleRootCause || 'Concurrency mutex race condition.'}
              </p>
            </div>
          </div>
          <Link
            to={`/projects/${projectId}/issues`}
            className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Inspect in Bug Lab
          </Link>
        </div>
      )}

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Sprint</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="text-lg font-bold text-slate-900 dark:text-white block truncate">
              {activeSprint?.name || 'Sprint 02'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              18 / 34 pts delivered (53%)
            </span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Living Requirements</span>
            <FileCheck2 className="h-4 w-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{requirements.length}</span>
            <span className="text-[11px] text-emerald-500 font-medium">
              {requirements.filter((r) => r.status === 'Approved').length} Approved
            </span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In-Flight Tasks</span>
            <Kanban className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{inProgressTasks}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {completedTasks} Done / {tasks.length} Total
            </span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Risk Level</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">Moderate</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Score 72/100</span>
          </div>
        </div>
      </div>

      {/* Burndown Chart & AI Risk Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sprint Burndown */}
        <div className="glass-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Sprint 02 Burndown Velocity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ideal burndown vs actual story point burn rate
              </p>
            </div>
            <Link to={`/projects/${projectId}/sprints`} className="text-xs font-semibold text-brand-500 hover:underline">
              Sprint Details
            </Link>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0e8ee9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0e8ee9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="4 4" fill="transparent" name="Ideal Remaining (pts)" />
                <Area type="monotone" dataKey="actual" stroke="#0e8ee9" strokeWidth={2} fill="url(#actualGrad)" name="Actual Remaining (pts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Risk Radar Card */}
        <div className="glass-card p-5 space-y-4 glow-ai-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-ai-500" />
              AI Risk Intelligence
            </h3>
            <span className="rounded-full bg-ai-100 dark:bg-ai-950 px-2 py-0.5 text-[10px] font-bold text-ai-700 dark:text-ai-300">
              Live Evaluation
            </span>
          </div>

          <div className="space-y-3">
            {risks.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    r.severity === 'Critical'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : r.severity === 'High'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {r.category} ({r.severity})
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-500">Score: {r.score}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {r.title}
                </h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  💡 <strong>Recommendation:</strong> {r.aiRecommendation}
                </p>
              </div>
            ))}
          </div>

          <Link
            to={`/projects/${projectId}/risks`}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-ai-600 hover:text-ai-500 dark:text-ai-400 pt-1"
          >
            <span>Open Comprehensive Risk Radar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
