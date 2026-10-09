import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Users,
  Bug,
  BookOpen,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../../db/db';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const OrgDashboardView: React.FC = () => {
  const org = useLiveQuery(() => db.organizations.get('org-zyroute'));
  const projects = useLiveQuery(() => db.projects.toArray()) || [];
  const users = useLiveQuery(() => db.users.toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const bugs = useLiveQuery(() => db.issues.toArray()) || [];
  const documents = useLiveQuery(() => db.documents.toArray()) || [];
  const activities = useLiveQuery(() => db.activities.reverse().limit(6).toArray()) || [];
  const risks = useLiveQuery(() => db.risks.toArray()) || [];

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const criticalBugs = bugs.filter((b) => b.severity === 'Critical' && b.status !== 'Closed').length;
  const avgDocHealth = documents.length > 0
    ? Math.round(documents.reduce((acc, d) => acc + (d.healthScore || 80), 0) / documents.length)
    : 85;

  const workloadData = [
    { name: 'Kajakaran (Dev)', tasks: 4, hours: 32 },
    { name: 'Hariarthan (QA)', tasks: 3, hours: 22 },
    { name: 'Sarangn (Design)', tasks: 2, hours: 14 },
    { name: 'Karikaalan (DevOps)', tasks: 2, hours: 12 },
    { name: 'Sutharsini (BA)', tasks: 2, hours: 10 },
  ];

  const taskStatusData = [
    { name: 'Backlog', value: tasks.filter((t) => t.status === 'Backlog').length, color: '#94a3b8' },
    { name: 'To Do', value: tasks.filter((t) => t.status === 'To Do').length, color: '#60a5fa' },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length, color: '#3b82f6' },
    { name: 'Code Review', value: tasks.filter((t) => t.status === 'Code Review').length, color: '#a855f7' },
    { name: 'QA', value: tasks.filter((t) => t.status === 'QA').length, color: '#f59e0b' },
    { name: 'Done', value: completedTasks, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 p-6 text-white shadow-glass-dark border border-brand-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-500/30 px-2.5 py-0.5 text-xs font-semibold text-brand-200 border border-brand-400/30">
                Organization Command Center
              </span>
              <span className="text-xs text-brand-300">| {org?.name || 'Zyroute Mobility Innovations Inc.'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI-Assisted SDLC Intelligence Hub
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 max-w-2xl leading-relaxed">
              Real-time cross-project telemetry linking living requirements, agile workflows, QA verification, client change governance, and automated risk detection.
            </p>
          </div>
          <Link
            to="/projects/proj-zyroute/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-900 px-4 py-2.5 text-xs font-bold shadow-lg hover:bg-brand-50 transition-all self-start md:self-auto"
          >
            <span>Open Active Project (Zyroute)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Projects</span>
            <Layers className="h-4 w-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{projects.length}</span>
            <span className="text-[11px] text-emerald-500 font-medium">1 in Sprint 02</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Task Completion</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {completedTasks}/{tasks.length} tasks
            </span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Open Bugs</span>
            <Bug className="h-4 w-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalBugs}</span>
            <span className="text-[11px] text-amber-500 font-medium">1 Race Condition (Fixing)</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Documentation Health</span>
            <BookOpen className="h-4 w-4 text-ai-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgDocHealth}%</span>
            <span className="text-[11px] text-emerald-500 font-medium">SRS v1.2 Approved</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Distribution Chart */}
        <div className="glass-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Team Workload & Capacity (Sprint 02)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assigned engineering hours across core roles
              </p>
            </div>
            <span className="rounded-full bg-ai-50 dark:bg-ai-950 px-2.5 py-1 text-[11px] font-bold text-ai-600 dark:text-ai-300 border border-ai-200 dark:border-ai-800 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Workload Balancing
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="hours" fill="#0e8ee9" radius={[4, 4, 0, 0]} name="Assigned Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Sprint Task Distribution
          </h3>
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            {taskStatusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List Card */}
        <div className="glass-card p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Project Portfolio
            </h3>
            <Link to="/projects" className="text-xs font-semibold text-brand-500 hover:underline">
              View all portfolio
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50/50 dark:bg-slate-900/40 transition-all gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                      {proj.key}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      proj.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{proj.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">Health</span>
                    <span className="text-xs font-extrabold text-emerald-500">{proj.healthScore}/100</span>
                  </div>
                  <Link
                    to={`/projects/${proj.id}/dashboard`}
                    className="rounded-lg bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Project Activity Stream */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              Live Activity Stream
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            {activities.map((act) => (
              <div key={act.id} className="pt-2.5 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                    {act.userName} <span className="text-slate-400 font-normal">({act.userRole.replace('_', ' ')})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
