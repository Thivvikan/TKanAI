import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  User,
  Sparkles,
  X,
  FileCheck2,
} from 'lucide-react';
import { db } from '../../db/db';
import { Task, TaskStatus, TaskType, RequirementPriority } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { taskService } from '../../services/taskService';
import confetti from 'canvas-confetti';

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'Backlog', label: 'Backlog', color: 'border-slate-400 text-slate-400' },
  { id: 'To Do', label: 'To Do', color: 'border-blue-400 text-blue-400' },
  { id: 'In Progress', label: 'In Progress', color: 'border-indigo-400 text-indigo-400' },
  { id: 'Code Review', label: 'Code Review', color: 'border-purple-400 text-purple-400' },
  { id: 'QA', label: 'QA Verification', color: 'border-amber-400 text-amber-400' },
  { id: 'Client Review', label: 'Client Review', color: 'border-violet-400 text-violet-400' },
  { id: 'Done', label: 'Done', color: 'border-emerald-400 text-emerald-400' },
];

export const KanbanBoardView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, currentRole, allUsers } = useSessionStore();

  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals(projectId).toArray()) || [];
  const users = useLiveQuery(() => db.users.toArray()) || allUsers;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');

  // New Task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<TaskType>('Development');
  const [newPriority, setNewPriority] = useState<RequirementPriority>('High');
  const [newAssignee, setNewAssignee] = useState('usr-dev');
  const [newEstimatedHours, setNewEstimatedHours] = useState(8);

  const filteredTasks = tasks.filter((t) => {
    if (filterAssignee !== 'ALL' && t.assigneeId !== filterAssignee) return false;
    return true;
  });

  const handleMoveStatus = async (task: Task, direction: 'next' | 'prev') => {
    const currentIndex = COLUMNS.findIndex((c) => c.id === task.status);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= COLUMNS.length) return;

    const nextStatus = COLUMNS[nextIndex].id;
    await taskService.updateTaskStatus(task.id, nextStatus, currentUser.id, currentUser.name, currentRole);

    if (nextStatus === 'Done') {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = tasks.length + 1;
    const key = `TASK-1${count < 10 ? '0' + count : count}`;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      key,
      projectId,
      title: newTitle,
      description: newDesc,
      type: newType,
      priority: newPriority,
      status: 'To Do',
      assigneeId: newAssignee,
      reporterId: currentUser.id,
      estimatedHours: Number(newEstimatedHours),
      actualHours: 0,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      labels: [newType.toLowerCase()],
      dependencies: [],
      attachments: [],
      commentsCount: 0,
      subtasks: [
        { id: `sub-${Date.now()}-1`, taskId: '', title: 'Initial implementation', completed: false },
        { id: `sub-${Date.now()}-2`, taskId: '', title: 'Unit test verification', completed: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await taskService.createTask(newTask, currentUser.id, currentUser.name, currentRole);
    setIsNewTaskModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2.5 py-0.5 text-xs font-bold">
              Agile Kanban Engine
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Sprint 02 Kanban Board
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time interactive task board synced across browser tabs with cross-role notification triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-sm"
          >
            <option value="ALL">All Assignees</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.replace('_', ' ')})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className="flex flex-col w-72 shrink-0 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 p-3.5 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    col.id === 'Done'
                      ? 'bg-emerald-500'
                      : col.id === 'QA'
                      ? 'bg-amber-500'
                      : col.id === 'Client Review'
                      ? 'bg-violet-500'
                      : 'bg-brand-500'
                  }`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{col.label}</span>
                </div>
                <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3 min-h-[450px]">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800/60 rounded-xl text-[11px] text-slate-400">
                    Empty column
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assignee = users.find((u) => u.id === task.assigneeId);
                    const completedSubs = task.subtasks?.filter((s) => s.completed).length || 0;
                    const totalSubs = task.subtasks?.length || 0;

                    return (
                      <div
                        key={task.id}
                        className="glass-card p-3.5 space-y-2.5 hover:shadow-md transition-all border border-slate-200/80 dark:border-slate-800 hover:border-brand-400/50"
                      >
                        {/* Task Top Meta */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded border border-brand-200/50 dark:border-brand-800/50">
                            {task.key}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : task.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {task.title}
                        </h4>

                        {/* Subtasks Progress */}
                        {totalSubs > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span>Checklist</span>
                              <span>{completedSubs}/{totalSubs}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Footer & Shift Status Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-1.5" title={assignee?.name || 'Unassigned'}>
                            {assignee ? (
                              <img
                                src={assignee.avatarUrl}
                                alt={assignee.name}
                                className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                              />
                            ) : (
                              <User className="h-4 w-4 text-slate-400" />
                            )}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                              {assignee ? assignee.name.split(' ')[0] : 'Unassigned'}
                            </span>
                          </div>

                          {/* Move Left / Right Controls */}
                          <div className="flex items-center gap-1">
                            {col.id !== 'Backlog' && (
                              <button
                                onClick={() => handleMoveStatus(task, 'prev')}
                                className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                                title="Move Backward"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                            )}
                            {col.id !== 'Done' && (
                              <button
                                onClick={() => handleMoveStatus(task, 'next')}
                                className="p-1 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900"
                                title="Advance to Next Stage"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Task
              </h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Seat Lock Expiry Callback in Node.js"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as TaskType)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Development">Development</option>
                    <option value="Testing">Testing</option>
                    <option value="Design">Design</option>
                    <option value="Documentation">Documentation</option>
                    <option value="DevOps">DevOps</option>
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

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assignee
                </label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Task execution details and acceptance checks..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Add to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
