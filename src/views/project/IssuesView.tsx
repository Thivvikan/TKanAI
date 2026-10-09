import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Bug,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Search,
  Check,
  X,
  User,
  ShieldAlert,
} from 'lucide-react';
import { db } from '../../db/db';
import { Issue, IssueSeverity, IssueStatus } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { issueService } from '../../services/taskService';
import confetti from 'canvas-confetti';

export const IssuesView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, currentRole, allUsers } = useSessionStore();

  const issues = useLiveQuery(() => db.issues.where('projectId').equals(projectId).toArray()) || [];
  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals(projectId).toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeBug, setActiveBug] = useState<Issue | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New bug state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<IssueSeverity>('High');
  const [newEnv, setNewEnv] = useState<'Staging' | 'Production' | 'Development' | 'UAT'>('Staging');
  const [newSteps, setNewSteps] = useState('1. Open seat selection\n2. Rapidly double-click Seat 14A\n3. Observe duplicate request payload');
  const [newExpected, setNewExpected] = useState('First click reserves seat, second click returns 409 Conflict');
  const [newActual, setNewActual] = useState('Both requests proceed to checkout concurrently');
  const [newRelatedReq, setNewRelatedReq] = useState('req-01');

  const filteredIssues = issues.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = selectedSeverity === 'ALL' || i.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'ALL' || i.status === selectedStatus;
    return matchesSearch && matchesSev && matchesStatus;
  });

  const handleResolve = async (issue: Issue) => {
    await issueService.resolveIssue(issue.id, currentUser.id, currentUser.name, currentRole);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    if (activeBug?.id === issue.id) {
      setActiveBug({ ...issue, status: 'Fixed', resolvedAt: new Date().toISOString() });
    }
  };

  const handleVerify = async (issue: Issue) => {
    await issueService.verifyIssue(issue.id, currentUser.id, currentUser.name, currentRole);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    if (activeBug?.id === issue.id) {
      setActiveBug({ ...issue, status: 'Verified' });
    }
  };

  const handleCreateBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = issues.length + 1;
    const key = `BUG-00${count}`;
    const stepsArray = newSteps.split('\n').map((s) => s.trim()).filter(Boolean);

    const newIssue: Issue = {
      id: `bug-${Date.now()}`,
      key,
      projectId,
      title: newTitle,
      description: newDesc,
      type: 'Bug',
      severity: newSeverity,
      priority: newSeverity === 'Critical' ? 'Critical' : 'High',
      status: 'Open',
      reporterId: currentUser.id,
      assigneeId: 'usr-dev',
      environment: newEnv,
      stepsToReproduce: stepsArray,
      expectedResult: newExpected,
      actualResult: newActual,
      relatedRequirementId: newRelatedReq,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await issueService.createIssue(newIssue, currentUser.id, currentUser.name, currentRole);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
              Defect Lifecycle & AI Root Cause
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Issues & AI Bug Lab
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track software defects with automated AI root cause diagnosis, affected subsystem isolation, and QA retesting gates.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Report Bug</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bugs by title, component, or key..."
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Fixed">Fixed (Retest)</option>
            <option value="Verified">Verified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid: List (7 cols) + AI Diagnostic Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bugs List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              No bugs found matching the filter criteria.
            </div>
          ) : (
            filteredIssues.map((bug) => {
              const isSelected = activeBug?.id === bug.id;
              const assignee = allUsers.find((u) => u.id === bug.assigneeId);

              return (
                <div
                  key={bug.id}
                  onClick={() => setActiveBug(bug)}
                  className={`glass-card p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-rose-500 ring-1 ring-rose-500/50 shadow-md bg-rose-50/20 dark:bg-rose-950/20'
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded">
                          {bug.key}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          bug.severity === 'Critical'
                            ? 'bg-rose-600 text-white'
                            : bug.severity === 'High'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {bug.severity}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">
                          {bug.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {bug.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">{bug.environment}</span>
                      <span className="text-[10px] text-slate-500">{new Date(bug.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                    {bug.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Assignee: <strong className="text-slate-700 dark:text-slate-300">{assignee?.name || 'Unassigned'}</strong></span>
                    </div>
                    {bug.aiIntelligence && (
                      <span className="text-ai-600 dark:text-ai-400 font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> {bug.aiIntelligence.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Bug Diagnostic Panel */}
        <div className="lg:col-span-5">
          {activeBug ? (
            <div className="glass-card p-5 space-y-5 sticky top-24 glow-ai-border">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 rounded">
                    {activeBug.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    AI Diagnostic Report
                  </span>
                </div>
                <span className="rounded-full bg-ai-100 dark:bg-ai-950 px-2 py-0.5 text-[10px] font-bold text-ai-700 dark:text-ai-300">
                  AI Root Cause
                </span>
              </div>

              {/* Root Cause Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Suspected Subsystem Failure
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeBug.aiIntelligence?.possibleRootCause || 'Unidentified race condition or exception.'}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Component:</span>
                  <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                    {activeBug.aiIntelligence?.affectedComponent || 'CoreEngine'}
                  </code>
                </div>
              </div>

              {/* AI Recommended Fix */}
              {activeBug.aiIntelligence?.recommendedFix && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-ai-500" />
                    AI Recommended Remediation
                  </h4>
                  <div className="p-3 rounded-xl bg-ai-50/50 dark:bg-ai-950/40 border border-ai-200 dark:border-ai-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                    {activeBug.aiIntelligence.recommendedFix}
                  </div>
                </div>
              )}

              {/* Steps to Reproduce */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Steps to Reproduce
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                  {activeBug.stepsToReproduce.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {activeBug.status !== 'Fixed' && activeBug.status !== 'Verified' && activeBug.status !== 'Closed' && (
                  <button
                    onClick={() => handleResolve(activeBug)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Developer: Mark as Fixed (Notify QA)</span>
                  </button>
                )}

                {activeBug.status === 'Fixed' && (
                  <button
                    onClick={() => handleVerify(activeBug)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <Check className="h-4 w-4" />
                    <span>QA: Retest & Verify Fix</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a bug on the left to inspect AI root cause intelligence and execution workflows.
            </div>
          )}
        </div>
      </div>

      {/* Report Bug Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Report Issue / Bug
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBug} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Race Condition: Two customers can hold Seat 14A simultaneously"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Severity
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IssueSeverity)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Environment
                  </label>
                  <select
                    value={newEnv}
                    onChange={(e) => setNewEnv(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Staging">Staging</option>
                    <option value="Production">Production</option>
                    <option value="UAT">UAT</option>
                    <option value="Development">Development</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Bug behavior and impact on ticket booking..."
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Steps to Reproduce
                </label>
                <textarea
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Submit & Run AI Diagnosis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
