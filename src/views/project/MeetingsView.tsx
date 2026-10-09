import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  ListTodo,
  Check,
  X,
} from 'lucide-react';
import { db } from '../../db/db';
import { Meeting } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { aiService } from '../../services/aiService';
import confetti from 'canvas-confetti';

export const MeetingsView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, allUsers } = useSessionStore();

  const meetings = useLiveQuery(() => db.meetings.where('projectId').equals(projectId).toArray()) || [];
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);

  // New meeting form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 - 11:00 AM EST');
  const [newNotes, setNewNotes] = useState('### Standup Notes:\n- Alex completed Redis mutex factory.\n- Elena starting 500-user concurrency test.\n- Decision: Update SRS v1.2 with 2-hour refund policy.');

  const selectedMeeting = activeMeeting || meetings[0];

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const extracted = await aiService.extractMeetingDecisions(newNotes);

    const newM: Meeting = {
      id: `meet-${Date.now()}`,
      projectId,
      title: newTitle,
      date: newDate,
      time: newTime,
      attendees: ['usr-pm', 'usr-po', 'usr-dev', 'usr-qa'],
      agenda: ['Review Sprint Progress', 'Evaluate Blockers', 'Action Items Allocation'],
      notesMarkdown: newNotes,
      aiSummary: extracted.summary,
      aiDecisions: extracted.decisions,
      aiActionItems: extracted.actionItems,
      createdAt: new Date().toISOString(),
    };

    await db.meetings.add(newM);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setIsNewMeetingModalOpen(false);
    setActiveMeeting(newM);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-2.5 py-0.5 text-xs font-bold">
              Team Alignment
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Meetings & AI Decision Extractor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Record meeting minutes and use AI to extract decisions, action items, and automated task assignments.
          </p>
        </div>

        <button
          onClick={() => setIsNewMeetingModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Record Meeting</span>
        </button>
      </div>

      {/* Grid: Meetings List (4 cols) + Meeting & AI Extraction (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Meetings List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-card p-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Meeting Records ({meetings.length})
            </span>
            <div className="space-y-1">
              {meetings.map((m) => {
                const isSelected = selectedMeeting?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMeeting(m)}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{m.date}</span>
                      <span>{m.time}</span>
                    </div>
                    <h4 className="text-xs font-bold leading-snug">{m.title}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {m.aiDecisions?.length || 0} Decisions | {m.aiActionItems?.length || 0} Action Items
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Meeting Details & AI Extraction */}
        <div className="lg:col-span-8">
          {selectedMeeting ? (
            <div className="glass-card p-5 space-y-5">
              {/* Meeting Header */}
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {selectedMeeting.date} ({selectedMeeting.time})
                  </span>
                  <span className="text-xs text-slate-400">
                    Attendees: {selectedMeeting.attendees?.length || 4} team members
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedMeeting.title}
                </h3>
              </div>

              {/* AI Summary Banner */}
              {selectedMeeting.aiSummary && (
                <div className="p-3.5 rounded-xl bg-ai-50/60 dark:bg-ai-950/40 border border-ai-200 dark:border-ai-800 space-y-1.5 glow-ai-border">
                  <span className="text-xs font-bold text-ai-700 dark:text-ai-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> AI Executive Meeting Summary
                  </span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    {selectedMeeting.aiSummary}
                  </p>
                </div>
              )}

              {/* Extracted Decisions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Agreed Strategic Decisions ({selectedMeeting.aiDecisions?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedMeeting.aiDecisions?.map((dec, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{dec.decision}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-6">{dec.context}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extracted Action Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Extracted Action Items & Assigned Roles ({selectedMeeting.aiActionItems?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedMeeting.aiActionItems?.map((act, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white">{act.action}</span>
                        <span className="text-[10px] text-slate-400 block">Target: {act.targetArtifact} ({act.suggestedTaskType})</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded self-start sm:self-auto">
                        {act.assigneeRole}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Raw Notes */}
              <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Raw Notes</span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedMeeting.notesMarkdown}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a meeting to view AI decision extractions.
            </div>
          )}
        </div>
      </div>

      {/* Record Meeting Modal */}
      {isNewMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Record Meeting Minutes
              </h3>
              <button onClick={() => setIsNewMeetingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Architecture Sync on Seat Mutex & Stripe Webhook"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Time</label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Meeting Notes & Decisions
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={5}
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMeetingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Save & Extract Decisions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
