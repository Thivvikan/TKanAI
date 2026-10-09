import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ListTodo,
  Sparkles,
  Plus,
  Layers,
  ChevronDown,
  ChevronRight,
  User,
  Zap,
  Check,
  X,
  FileCheck2,
} from 'lucide-react';
import { db } from '../../db/db';
import { Epic, UserStory, RequirementPriority } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { userStoryRepository } from '../../repositories/dexie/dexieRepositories';
import confetti from 'canvas-confetti';

export const BacklogView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, allUsers } = useSessionStore();

  const epics = useLiveQuery(() => db.epics.where('projectId').equals(projectId).toArray()) || [];
  const stories = useLiveQuery(() => db.userStories.where('projectId').equals(projectId).toArray()) || [];
  const sprints = useLiveQuery(() => db.sprints.where('projectId').equals(projectId).toArray()) || [];

  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({
    'epic-01': true,
    'epic-02': true,
    'epic-03': true,
  });

  const [isNewStoryModalOpen, setIsNewStoryModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAsA, setNewAsA] = useState('passenger');
  const [newIWant, setNewIWant] = useState('to view trip amenities and seat photos');
  const [newSoThat, setNewSoThat] = useState('I can make an informed ticket purchase');
  const [newPoints, setNewPoints] = useState(5);
  const [newEpicId, setNewEpicId] = useState('epic-01');
  const [newSprintId, setNewSprintId] = useState('sprint-02');

  const toggleEpic = (epicId: string) => {
    setExpandedEpics((prev) => ({ ...prev, [epicId]: !prev[epicId] }));
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = stories.length + 1;
    const key = `US-1${count < 10 ? '0' + count : count}`;

    const newStory: UserStory = {
      id: `story-${Date.now()}`,
      key,
      projectId,
      epicId: newEpicId,
      sprintId: newSprintId === 'backlog' ? undefined : newSprintId,
      title: newTitle,
      asA: newAsA,
      iWant: newIWant,
      soThat: newSoThat,
      acceptanceCriteria: ['Given valid inputs, system executes expected behavior'],
      priority: 'High',
      storyPoints: Number(newPoints),
      status: newSprintId === 'backlog' ? 'Backlog' : 'In Sprint',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await userStoryRepository.create(newStory);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setIsNewStoryModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 text-xs font-bold">
              Product Backlog
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Epics & User Stories Backlog
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Organize functional scope into deliverable user stories, estimate story points, and plan sprint iterations.
          </p>
        </div>

        <button
          onClick={() => setIsNewStoryModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New User Story</span>
        </button>
      </div>

      {/* Epics Accordion List */}
      <div className="space-y-4">
        {epics.map((epic) => {
          const isExpanded = expandedEpics[epic.id] ?? true;
          const epicStories = stories.filter((s) => s.epicId === epic.id);
          const totalPoints = epicStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

          return (
            <div key={epic.id} className="glass-card overflow-hidden border border-slate-200 dark:border-slate-800">
              {/* Epic Header Row */}
              <div
                onClick={() => toggleEpic(epic.id)}
                className="flex items-center justify-between p-4 cursor-pointer bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-200/60 dark:border-slate-800/60"
              >
                <div className="flex items-center gap-3">
                  <button className="text-slate-400">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: epic.color || '#0e8ee9' }}
                  />
                  <span className="font-mono text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                    {epic.key}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {epic.name}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong>{epicStories.length}</strong> stories ({totalPoints} pts)
                  </span>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${epic.progress}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{epic.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Stories in Epic */}
              {isExpanded && (
                <div className="p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
                  {epicStories.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No user stories in this epic.</p>
                  ) : (
                    epicStories.map((story) => (
                      <div
                        key={story.id}
                        className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                              {story.key}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {story.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                              {story.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                            "As a {story.asA}, I want {story.iWant}, so that {story.soThat}."
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          <span className="rounded-full bg-brand-100 dark:bg-brand-950 px-2 py-0.5 text-xs font-mono font-bold text-brand-700 dark:text-brand-300">
                            {story.storyPoints} pts
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New Story Modal */}
      {isNewStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create User Story
              </h3>
              <button onClick={() => setIsNewStoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Story Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Passenger Bus Amenities Visualizer"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Gherkin User Story Definition
                </span>
                <div>
                  <label className="text-[11px] text-slate-500 block">As a...</label>
                  <input
                    type="text"
                    value={newAsA}
                    onChange={(e) => setNewAsA(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">I want to...</label>
                  <input
                    type="text"
                    value={newIWant}
                    onChange={(e) => setNewIWant(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">So that...</label>
                  <input
                    type="text"
                    value={newSoThat}
                    onChange={(e) => setNewSoThat(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Epic
                  </label>
                  <select
                    value={newEpicId}
                    onChange={(e) => setNewEpicId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {epics.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sprint
                  </label>
                  <select
                    value={newSprintId}
                    onChange={(e) => setNewSprintId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="sprint-02">Sprint 02 (Active)</option>
                    <option value="backlog">Product Backlog</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewStoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Save Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
