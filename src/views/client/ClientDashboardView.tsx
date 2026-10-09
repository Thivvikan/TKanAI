import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  UserCheck,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileCheck2,
  GitPullRequest,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../../db/db';
import { ChangeRequest, RequirementPriority, Task } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { changeRequestService } from '../../services/changeRequestService';
import { taskService } from '../../services/taskService';
import confetti from 'canvas-confetti';

export const ClientDashboardView: React.FC = () => {
  const { currentUser, currentRole } = useSessionStore();

  const changeRequests = useLiveQuery(() => db.changeRequests.where('projectId').equals('proj-zyroute').toArray()) || [];
  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals('proj-zyroute').toArray()) || [];
  const clientReviewTasks = useLiveQuery(() => db.tasks.where('projectId').equals('proj-zyroute').and((t) => t.status === 'Client Review' || t.status === 'Done').toArray()) || [];

  const [activeCR, setActiveCR] = useState<ChangeRequest | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New CR state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newPriority, setNewPriority] = useState<RequirementPriority>('High');

  const handleSubmitCR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = changeRequests.length + 1;
    const key = `CR-00${count}`;

    const newCR: ChangeRequest = {
      id: `cr-${Date.now()}`,
      key,
      projectId: 'proj-zyroute',
      clientUserId: currentUser.id,
      title: newTitle,
      description: newDesc,
      reason: newReason,
      priority: newPriority,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await changeRequestService.submitChangeRequest(newCR, currentUser.id, currentUser.name, currentRole);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    setIsSubmitModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewReason('');
    alert(`🎉 Change Request ${key} submitted! AI Impact Analysis has evaluated the schedule and dependency impact.`);
  };

  const handleApproveCR = async (cr: ChangeRequest) => {
    await changeRequestService.approveChangeRequest(
      cr.id,
      'Approved by Project Manager following AI Impact Assessment.',
      currentUser.id,
      currentUser.name,
      currentRole
    );
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    if (activeCR?.id === cr.id) {
      setActiveCR({ ...cr, status: 'Approved' });
    }
  };

  const handleApproveDeliverable = async (task: Task) => {
    await taskService.updateTaskStatus(task.id, 'Done', currentUser.id, currentUser.name, currentRole);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    alert(`✅ Deliverable "${task.title}" approved by client! Marked as Done.`);
  };

  const approvedReqs = requirements.filter((r) => r.status === 'Approved');

  return (
    <div className="space-y-6">
      {/* Client Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-6 text-white shadow-glass-dark border border-violet-700/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet-500/30 px-2.5 py-0.5 text-xs font-semibold text-violet-200 border border-violet-400/30">
                Client Collaboration Portal
              </span>
              <span className="text-xs text-violet-300">| Zyroute Bus Reservation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Deliverables & Change Request Governance
            </h1>
            <p className="text-xs sm:text-sm text-violet-100 max-w-2xl leading-relaxed">
              Review project progress, inspect approved business requirements, approve completed deliverables, and submit change requests with instant AI impact telemetry.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white px-4 py-2.5 text-xs font-bold shadow-lg transition-all self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Change Request</span>
          </button>
        </div>
      </div>

      {/* 3 Core Client Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 space-y-2 border-l-4 border-l-violet-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approved Specs</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{approvedReqs.length}</span>
            <span className="text-xs text-emerald-500 font-semibold">100% Signed-off</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2 border-l-4 border-l-brand-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deliverables Ready</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
              {clientReviewTasks.filter((t) => t.status === 'Client Review').length}
            </span>
            <span className="text-xs text-slate-400">Pending your sign-off</span>
          </div>
        </div>

        <div className="glass-card p-4 space-y-2 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Change Requests</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{changeRequests.length}</span>
            <span className="text-xs text-emerald-500 font-semibold">
              {changeRequests.filter((c) => c.status === 'Approved').length} Approved
            </span>
          </div>
        </div>
      </div>

      {/* Deliverables Pending Sign-off */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-brand-500" />
          Feature Deliverables & Milestone Sign-off
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientReviewTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded">
                  {task.key}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  task.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-violet-100 text-violet-800 animate-pulse'
                }`}>
                  {task.status === 'Done' ? 'Signed Off' : 'Pending Client Review'}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{task.description}</p>
              </div>

              {task.status !== 'Done' && (
                <button
                  onClick={() => handleApproveDeliverable(task)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                >
                  <Check className="h-4 w-4" />
                  <span>Client Sign-off & Approve Deliverable</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Change Requests & AI Impact Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CR List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-violet-500" />
              Submitted Change Requests
            </h3>
          </div>

          {changeRequests.map((cr) => {
            const isSelected = activeCR?.id === cr.id;
            return (
              <div
                key={cr.id}
                onClick={() => setActiveCR(cr)}
                className={`glass-card p-4 cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-violet-500 ring-1 ring-violet-500/50 shadow-md bg-violet-50/20 dark:bg-violet-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2 py-0.5 rounded">
                    {cr.key}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cr.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cr.status}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                  {cr.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  Reason: {cr.reason}
                </p>

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                  <span>Priority: <strong className="text-slate-700 dark:text-slate-300">{cr.priority}</strong></span>
                  <span>Impact: <strong className="text-violet-500">{cr.aiImpactAnalysis?.estimatedEffortHours || 18}h / +{cr.aiImpactAnalysis?.scheduleImpactDays || 2}d</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Impact Assessment Panel */}
        <div className="lg:col-span-6">
          {activeCR ? (
            <div className="glass-card p-5 space-y-5 sticky top-24 glow-ai-border">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2 py-0.5 rounded">
                    {activeCR.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    AI Multi-Tier Impact Analysis
                  </span>
                </div>
                <span className="rounded-full bg-ai-100 dark:bg-ai-950 px-2 py-0.5 text-[10px] font-bold text-ai-700 dark:text-ai-300">
                  AI Impact Evaluated
                </span>
              </div>

              {/* Impact Stats Grid */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Effort Delta</span>
                  <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                    +{activeCR.aiImpactAnalysis?.estimatedEffortHours || 20} Hours
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Impact</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                    +{activeCR.aiImpactAnalysis?.scheduleImpactDays || 2} Days
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Level</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {activeCR.aiImpactAnalysis?.overallRiskLevel || 'Medium'}
                  </span>
                </div>
              </div>

              {/* Affected Entities List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Affected System Entities
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/60 text-teal-800 dark:text-teal-300">
                    <strong>Requirements (1):</strong> REQ-003
                  </div>
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 text-blue-800 dark:text-blue-300">
                    <strong>Tasks (2):</strong> TASK-108, TASK-109
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                    <strong>Stories (1):</strong> US-104
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/60 text-purple-800 dark:text-purple-300">
                    <strong>Docs (2):</strong> SRS v1.2, API Docs
                  </div>
                </div>
              </div>

              {/* Summary Rationale */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Evaluation Rationale</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-ai-50/50 dark:bg-ai-950/30 p-3 rounded-xl border border-ai-200 dark:border-ai-800">
                  "{activeCR.aiImpactAnalysis?.summaryRationale}"
                </p>
              </div>

              {/* PM Approval Button */}
              {activeCR.status !== 'Approved' && (
                <button
                  onClick={() => handleApproveCR(activeCR)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>PM: Accept & Apply Recommended Changes</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a change request to view the AI Impact Analysis.
            </div>
          )}
        </div>
      </div>

      {/* Submit CR Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Submit Scope / Requirement Change Request
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCR} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Change Request Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Allow Booking Cancellation within 2 hours of departure"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description of Proposed Change
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Explain the proposed modification to existing business rules..."
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Business Justification / Reason
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  placeholder="Why is this change necessary for client business goals?"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Submit & Compute AI Impact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
