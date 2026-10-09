import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldAlert,
  Layers,
  Plus,
  X,
} from 'lucide-react';
import { db } from '../../db/db';
import { Risk, RiskSeverity, RiskCategory } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import confetti from 'canvas-confetti';

export const RisksView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser } = useSessionStore();

  const risks = useLiveQuery(() => db.risks.where('projectId').equals(projectId).toArray()) || [];
  const [activeRisk, setActiveRisk] = useState<Risk | null>(null);

  const selectedRisk = activeRisk || risks[0];

  const handleApplyMitigation = async (risk: Risk) => {
    await db.risks.update(risk.id, {
      status: 'Mitigating',
      updatedAt: new Date().toISOString(),
    });
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    if (activeRisk?.id === risk.id) {
      setActiveRisk({ ...risk, status: 'Mitigating' });
    }
    alert(`🛡️ Mitigation plan activated for ${risk.title}!`);
  };

  const categories: RiskCategory[] = ['Technical', 'Schedule', 'Requirement', 'Quality', 'Resource', 'Documentation'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
            Predictive AI Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            AI Risk Radar & Mitigation Advisory
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Continuous telemetry assessing concurrency bottlenecks, schedule pressure, requirement drift, and recommended corrective action plans.
        </p>
      </div>

      {/* 6 Category Radar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const catRisks = risks.filter((r) => r.category === cat);
          const maxScore = catRisks.length > 0 ? Math.max(...catRisks.map((r) => r.score)) : 20;

          return (
            <div key={cat} className="glass-card p-3 space-y-1.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                {cat} Risk
              </span>
              <span className={`text-xl font-black ${
                maxScore > 70 ? 'text-rose-500' : maxScore > 40 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                {maxScore > 70 ? 'High' : maxScore > 40 ? 'Moderate' : 'Low'}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Score: {maxScore}/100</span>
            </div>
          );
        })}
      </div>

      {/* Grid: Risks List (6 cols) + AI Mitigation Detail (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risks List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Identified Threat Vectors ({risks.length})
            </h3>
          </div>

          {risks.map((r) => {
            const isSelected = selectedRisk?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setActiveRisk(r)}
                className={`glass-card p-4 cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-md bg-rose-50/20 dark:bg-rose-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    r.severity === 'Critical'
                      ? 'bg-rose-600 text-white'
                      : r.severity === 'High'
                      ? 'bg-amber-500 text-white'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {r.category} ({r.severity})
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Risk Score: {r.score}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {r.reason}
                </p>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  <span>Status: <strong className="text-slate-700 dark:text-slate-300 uppercase">{r.status}</strong></span>
                  <span>Probability: <strong>{r.probability}%</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Mitigation Advisory Panel */}
        <div className="lg:col-span-6">
          {selectedRisk ? (
            <div className="glass-card p-5 space-y-5 sticky top-24 glow-ai-border">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  AI Mitigation Advisory
                </span>
                <span className="rounded-full bg-ai-100 dark:bg-ai-950 px-2 py-0.5 text-[10px] font-bold text-ai-700 dark:text-ai-300">
                  Automated Prediction
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Root Threat</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedRisk.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedRisk.reason}</p>
              </div>

              {/* AI Recommendation */}
              <div className="p-3.5 rounded-xl bg-ai-50/60 dark:bg-ai-950/40 border border-ai-200 dark:border-ai-800 space-y-1.5">
                <span className="text-xs font-bold text-ai-700 dark:text-ai-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> AI Actionable Corrective Plan
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{selectedRisk.aiRecommendation}"
                </p>
              </div>

              {/* Current Mitigation Plan */}
              {selectedRisk.mitigationPlan && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Mitigation Step</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedRisk.mitigationPlan}
                  </p>
                </div>
              )}

              {/* Action Button */}
              {selectedRisk.status !== 'Mitigating' && (
                <button
                  onClick={() => handleApplyMitigation(selectedRisk)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>PM: Approve & Activate Mitigation Plan</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a risk item to view AI mitigations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
