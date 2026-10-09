import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  TestTube2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Plus,
  Sparkles,
  Search,
  Bug,
  Check,
  X,
} from 'lucide-react';
import { db } from '../../db/db';
import { TestCase, TestCaseStatus } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import confetti from 'canvas-confetti';

export const TestingView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser } = useSessionStore();

  const testCases = useLiveQuery(() => db.testCases.where('projectId').equals(projectId).toArray()) || [];
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTestCase, setActiveTestCase] = useState<TestCase | null>(null);
  const [isNewTestCaseModalOpen, setIsNewTestCaseModalOpen] = useState(false);

  // New Test Case State
  const [newTitle, setNewTitle] = useState('');
  const [newPrecond, setNewPrecond] = useState('Trip route open with available seats');
  const [newSteps, setNewSteps] = useState('1. Select seat 14A\n2. Verify 10:00 timer countdown\n3. Wait for timer expiration');
  const [newExpected, setNewExpected] = useState('Seat lock automatically releases and reverts to Available');

  const filteredCases = testCases.filter((tc) => {
    const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase()) || tc.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || tc.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExecuteStatus = async (tc: TestCase, status: TestCaseStatus) => {
    await db.testCases.update(tc.id, {
      status,
      lastExecutedAt: new Date().toISOString(),
      lastExecutedBy: currentUser.id,
    });
    if (status === 'Passed') {
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
    }
    if (activeTestCase?.id === tc.id) {
      setActiveTestCase({ ...tc, status, lastExecutedAt: new Date().toISOString() });
    }
  };

  const handleCreateTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = testCases.length + 1;
    const key = `TC-00${count}`;
    const stepsArray = newSteps.split('\n').map((s) => s.trim()).filter(Boolean);

    const newTC: TestCase = {
      id: `tc-${Date.now()}`,
      key,
      projectId,
      title: newTitle,
      precondition: newPrecond,
      steps: stepsArray,
      expectedResult: newExpected,
      status: 'Ready',
      createdAt: new Date().toISOString(),
    };

    await db.testCases.add(newTC);
    setIsNewTestCaseModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold">
              Quality Assurance Lab
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              QA Test Suites & Execution Runner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Author test scenarios, record automated test suite runs, and verify requirement acceptance criteria.
          </p>
        </div>

        <button
          onClick={() => setIsNewTestCaseModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Test Case</span>
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
            placeholder="Search test cases by title or ID..."
            className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
          <option value="Ready">Ready</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Grid: List (7 cols) + Execution Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Test Cases List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredCases.map((tc) => {
            const isSelected = activeTestCase?.id === tc.id;

            return (
              <div
                key={tc.id}
                onClick={() => setActiveTestCase(tc)}
                className={`glass-card p-4 cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-amber-500 ring-1 ring-amber-500/50 shadow-md bg-amber-50/20 dark:bg-amber-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                        {tc.key}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tc.status === 'Passed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : tc.status === 'Failed'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {tc.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {tc.title}
                    </h3>
                  </div>

                  <span className="text-[10px] text-slate-400">
                    {tc.lastExecutedAt ? new Date(tc.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never run'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  <span>Precondition: <strong className="text-slate-700 dark:text-slate-300">{tc.precondition}</strong></span>
                  <span>Steps: <strong>{tc.steps.length} checks</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Runner Panel */}
        <div className="lg:col-span-5">
          {activeTestCase ? (
            <div className="glass-card p-5 space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded">
                    {activeTestCase.key}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    Test Execution Runner
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  activeTestCase.status === 'Passed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeTestCase.status === 'Failed'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {activeTestCase.status}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precondition</span>
                <p className="text-xs text-slate-800 dark:text-slate-200">{activeTestCase.precondition}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Test Steps</span>
                <div className="space-y-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {activeTestCase.steps.map((step, idx) => (
                    <p key={idx} className="text-xs text-slate-800 dark:text-slate-200 font-mono">
                      {step}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expected Result</span>
                <p className="text-xs text-slate-800 dark:text-slate-200">{activeTestCase.expectedResult}</p>
              </div>

              {/* Action Buttons: Pass / Fail */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Record Test Execution Result
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExecuteStatus(activeTestCase, 'Passed')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark Passed</span>
                  </button>
                  <button
                    onClick={() => handleExecuteStatus(activeTestCase, 'Failed')}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2 text-xs font-bold shadow-sm transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Mark Failed</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a test case to execute runs and record pass/fail results.
            </div>
          )}
        </div>
      </div>

      {/* New Test Case Modal */}
      {isNewTestCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Author QA Test Case
              </h3>
              <button onClick={() => setIsNewTestCaseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestCase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Test Case Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Verify 10-Minute Seat Lock Timeout and Release"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Preconditions
                </label>
                <input
                  type="text"
                  value={newPrecond}
                  onChange={(e) => setNewPrecond(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Execution Steps (1 per line)
                </label>
                <textarea
                  value={newSteps}
                  onChange={(e) => setNewSteps(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Expected Result
                </label>
                <input
                  type="text"
                  value={newExpected}
                  onChange={(e) => setNewExpected(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTestCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Save Test Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
