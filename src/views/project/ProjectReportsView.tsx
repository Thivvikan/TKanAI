import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Zap,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { db } from '../../db/db';

export const ProjectReportsView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();

  const project = useLiveQuery(() => db.projects.get(projectId));
  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals(projectId).toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(projectId).toArray()) || [];
  const bugs = useLiveQuery(() => db.issues.where('projectId').equals(projectId).toArray()) || [];
  const risks = useLiveQuery(() => db.risks.where('projectId').equals(projectId).toArray()) || [];
  const sprints = useLiveQuery(() => db.sprints.where('projectId').equals(projectId).toArray()) || [];
  const documents = useLiveQuery(() => db.documents.where('projectId').equals(projectId).toArray()) || [];

  const [reportType, setReportType] = useState<'Executive' | 'Weekly' | 'Sprint'>('Executive');

  const completedTasks = tasks.filter((t) => t.status === 'Done').length;
  const criticalBugs = bugs.filter((b) => b.severity === 'Critical');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
              Automated Governance
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Executive & Sprint Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Generate printable executive audits, weekly progress summaries, and sprint delivery reports directly from live IndexedDB telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['Executive', 'Weekly', 'Sprint'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === type
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {type} Report
          </button>
        ))}
      </div>

      {/* Printable Report Document */}
      <div className="glass-card p-8 space-y-6 max-w-4xl mx-auto border border-slate-200 dark:border-slate-800 shadow-lg print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              TKanAI SDLC Research Ecosystem Report
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {reportType} Status Report: {project?.name || 'Zyroute'}
            </h2>
            <span className="text-xs text-slate-400">
              Generated on: {new Date().toLocaleDateString()} | Author: Thivvikan (Project Manager)
            </span>
          </div>
          <span className="font-mono text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-3 py-1 rounded-xl">
            {project?.key}
          </span>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            1. Executive Overview & Health
          </h3>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            The <strong>Zyroute – Online Bus Reservation System</strong> is actively in Sprint 02 with an overall health score of <strong>88/100</strong>. Core distributed seat locking architecture is in QA verification. Client change request CR-001 (2-hour cancellation policy) has been approved and incorporated into SRS v1.2.
          </p>
        </div>

        {/* Key Metrics Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            2. Core Telemetry Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Requirements</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{requirements.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tasks Completed</span>
              <span className="text-base font-black text-emerald-500">{completedTasks}/{tasks.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Defects</span>
              <span className="text-base font-black text-rose-500">{bugs.filter((b) => b.status !== 'Closed').length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Doc Health</span>
              <span className="text-base font-black text-purple-500">92%</span>
            </div>
          </div>
        </div>

        {/* Risks & Mitigations */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            3. AI Risk Intelligence & Mitigation Status
          </h3>
          <div className="space-y-2">
            {risks.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">{r.title}</span>
                  <span className="text-rose-500 uppercase">{r.severity} ({r.category})</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{r.aiRecommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
