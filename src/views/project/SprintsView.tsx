import React from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Zap,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { db } from '../../db/db';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

export const SprintsView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();

  const sprints = useLiveQuery(() => db.sprints.where('projectId').equals(projectId).toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(projectId).toArray()) || [];

  const velocityData = [
    { name: 'Sprint 01', committed: 30, completed: 28 },
    { name: 'Sprint 02 (Active)', committed: 34, completed: 18 },
    { name: 'Sprint 03 (Est)', committed: 32, completed: 0 },
  ];

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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold">
            Agile Cadence
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Sprint Management & Velocity Analytics
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track sprint iterations, velocity predictability, team commitment variance, and burndown trajectories.
        </p>
      </div>

      {/* Sprints Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sprints.map((sprint) => (
          <div key={sprint.id} className="glass-card p-5 space-y-3 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sprint.status === 'Active'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {sprint.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {sprint.startDate} → {sprint.endDate}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sprint.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400"><strong>Goal:</strong> {sprint.goal}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span>Velocity: <strong>{sprint.velocity} pts</strong></span>
              <span>Committed: <strong>{sprint.committedPoints} pts</strong></span>
              <span>Completed: <strong className="text-emerald-500">{sprint.completedPoints} pts</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Bar Chart */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            Historical Sprint Velocity
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="committed" fill="#94a3b8" name="Committed (pts)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed (pts)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Burndown Trend */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Sprint 02 Story Point Burndown
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="4 4" fill="transparent" name="Ideal Remaining" />
                <Area type="monotone" dataKey="actual" stroke="#0e8ee9" strokeWidth={2} fill="#0e8ee9" fillOpacity={0.2} name="Actual Remaining" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
