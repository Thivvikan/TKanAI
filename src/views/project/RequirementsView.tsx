import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FileCheck2,
  Sparkles,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  GitPullRequest,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { db } from '../../db/db';
import { Requirement, RequirementStatus, RequirementType, RequirementPriority } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { requirementService } from '../../services/requirementService';
import { aiService } from '../../services/aiService';
import { userStoryRepository } from '../../repositories/dexie/dexieRepositories';
import confetti from 'canvas-confetti';

export const RequirementsView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, currentRole } = useSessionStore();

  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals(projectId).toArray()) || [];
  const epics = useLiveQuery(() => db.epics.where('projectId').equals(projectId).toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeReq, setActiveReq] = useState<Requirement | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Requirement Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<RequirementType>('Functional');
  const [newPriority, setNewPriority] = useState<RequirementPriority>('High');
  const [newAcceptanceCriteria, setNewAcceptanceCriteria] = useState('1. Lock is acquired in < 150ms\n2. Real-time expiry release after 10 mins');
  const [newEpicId, setNewEpicId] = useState('epic-01');

  // Filtered Requirements
  const filteredReqs = requirements.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || r.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRunAIAnalysis = async (req: Requirement) => {
    setIsAnalyzing(true);
    try {
      const feedback = await aiService.analyzeRequirement(req);
      await db.requirements.update(req.id, { aiAnalysis: feedback });
      setActiveReq({ ...req, aiAnalysis: feedback });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async (req: Requirement) => {
    await requirementService.approveRequirement(req.id, currentUser.id, currentUser.name, currentRole);
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 } });
    if (activeReq?.id === req.id) {
      setActiveReq({ ...req, status: 'Approved' });
    }
  };

  const handleConvertToStory = async (req: Requirement) => {
    const generated = await aiService.generateUserStory(req);
    const storyId = `story-${Date.now()}`;
    const storyCount = await db.userStories.count();
    const storyKey = `US-${100 + storyCount + 1}`;

    await userStoryRepository.create({
      id: storyId,
      key: storyKey,
      projectId: req.projectId,
      requirementId: req.id,
      epicId: req.epicId || 'epic-01',
      title: generated.title || `Story: ${req.title}`,
      asA: generated.asA || 'passenger',
      iWant: generated.iWant || req.title,
      soThat: generated.soThat || 'I can complete my journey',
      acceptanceCriteria: generated.acceptanceCriteria || req.acceptanceCriteria,
      priority: req.priority,
      storyPoints: generated.storyPoints || 5,
      status: 'Ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    alert(`🎉 Successfully generated User Story ${storyKey} from ${req.key}! It is now available in the Backlog.`);
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = requirements.length + 1;
    const key = `REQ-00${count}`;
    const criteriaArray = newAcceptanceCriteria.split('\n').map((s) => s.trim()).filter(Boolean);

    const tempReq: Requirement = {
      id: `req-${Date.now()}`,
      key,
      projectId,
      title: newTitle,
      description: newDescription,
      type: newType,
      priority: newPriority,
      status: 'Draft',
      source: 'Internal Discovery',
      reporterId: currentUser.id,
      ownerId: currentUser.id,
      acceptanceCriteria: criteriaArray,
      dependencies: [],
      relatedRequirementIds: [],
      relatedTaskIds: [],
      relatedDocumentIds: ['doc-srs-01'],
      epicId: newEpicId,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await requirementService.createRequirement(tempReq, currentUser.id, currentUser.name, currentRole);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 text-xs font-bold">
              Living Traceability
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Requirements & AI Ambiguity Inspector
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Author, audit, and trace specifications with AI-powered clarity scoring and automated story decomposition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${projectId}/traceability`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <GitPullRequest className="h-4 w-4 text-teal-500" />
            <span>Traceability Graph</span>
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Requirement</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-card p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter requirements by title, keyword, or key..."
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Functional">Functional</option>
            <option value="Non-Functional">Non-Functional</option>
            <option value="Business">Business</option>
            <option value="Security">Security</option>
            <option value="Performance">Performance</option>
            <option value="UI/UX">UI/UX</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Under Review">Under Review</option>
            <option value="Draft">Draft</option>
            <option value="Client Review">Client Review</option>
          </select>
        </div>
      </div>

      {/* Main Requirements List & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requirements List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredReqs.length === 0 ? (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              No requirements match the active filters.
            </div>
          ) : (
            filteredReqs.map((req) => {
              const isSelected = activeReq?.id === req.id;
              const score = req.aiAnalysis?.score || 85;

              return (
                <div
                  key={req.id}
                  onClick={() => setActiveReq(req)}
                  className={`glass-card p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-brand-500 ring-1 ring-brand-500/50 shadow-md bg-brand-50/20 dark:bg-brand-950/20'
                      : 'hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded">
                          {req.key}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {req.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {req.title}
                      </h3>
                    </div>

                    {/* AI Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-ai-500" />
                        <span className={`text-xs font-black ${score < 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {score}/100
                        </span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400">
                        Clarity Score
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2">
                    {req.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <span>Priority: <strong className="text-slate-700 dark:text-slate-300">{req.priority}</strong></span>
                    <span>Acceptance Criteria: <strong>{req.acceptanceCriteria.length} items</strong></span>
                    <span>Version: <strong>v{req.version}.0</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* AI Inspector & Detail Panel (5 cols) */}
        <div className="lg:col-span-5">
          {activeReq ? (
            <div className="glass-card p-5 space-y-5 sticky top-24 glow-ai-border">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded">
                    {activeReq.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    AI Ambiguity Inspector
                  </span>
                </div>
                <button
                  onClick={() => handleRunAIAnalysis(activeReq)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 rounded-lg bg-ai-50 dark:bg-ai-950 px-2.5 py-1 text-xs font-bold text-ai-700 dark:text-ai-300 border border-ai-200 dark:border-ai-800 hover:bg-ai-100 transition-all shadow-sm"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Re-run AI'}</span>
                </button>
              </div>

              {/* Clarity Meter */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Clarity & Testability Index</span>
                  <span className={activeReq.aiAnalysis?.score && activeReq.aiAnalysis.score < 80 ? 'text-amber-500' : 'text-emerald-500'}>
                    {activeReq.aiAnalysis?.score || 85}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (activeReq.aiAnalysis?.score || 85) < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${activeReq.aiAnalysis?.score || 85}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {(activeReq.aiAnalysis?.score || 85) < 80
                    ? '⚠️ Ambiguity detected: Vague phrasing lacks verifiable SLAs.'
                    : '✅ High testability score: Clear acceptance criteria and measurable boundaries.'}
                </p>
              </div>

              {/* Detected Ambiguity Issues */}
              {activeReq.aiAnalysis?.issues && activeReq.aiAnalysis.issues.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Detected Findings & Constraints
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {activeReq.aiAnalysis.issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Suggested Measurable Rewrite */}
              {activeReq.aiAnalysis?.suggestedText && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-ai-500" />
                    AI Proposed Measurable Specification
                  </h4>
                  <div className="p-3 rounded-xl bg-ai-50/50 dark:bg-ai-950/40 border border-ai-200 dark:border-ai-800 text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed">
                    "{activeReq.aiAnalysis.suggestedText}"
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                {activeReq.status !== 'Approved' && (
                  <button
                    onClick={() => handleApprove(activeReq)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve Requirement</span>
                  </button>
                )}

                <button
                  onClick={() => handleConvertToStory(activeReq)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>AI: Convert to User Story in Backlog</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a requirement on the left to inspect its AI Ambiguity telemetry and traceability links.
            </div>
          )}
        </div>
      </div>

      {/* Create Requirement Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Requirement
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequirement} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Requirement Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Dynamic Surge Pricing Tier based on Bus Occupancy"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Requirement Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as RequirementType)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Functional">Functional</option>
                    <option value="Non-Functional">Non-Functional</option>
                    <option value="Business">Business</option>
                    <option value="Security">Security</option>
                    <option value="Performance">Performance</option>
                    <option value="UI/UX">UI/UX</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RequirementPriority)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe the functional capability or constraint..."
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Acceptance Criteria (1 per line)
                </label>
                <textarea
                  value={newAcceptanceCriteria}
                  onChange={(e) => setNewAcceptanceCriteria(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Create & Run AI Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
