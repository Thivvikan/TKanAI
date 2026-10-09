import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  AlertTriangle,
  FileCheck2,
  ListTodo,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useSessionStore } from '../../store/useSessionStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC = () => {
  const { isAIAssistantOpen, setAIAssistantOpen } = useUIStore();
  const { currentUser } = useSessionStore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your **TKanAI Project Assistant**. I continuously monitor requirements clarity, sprint burn rates, task delays, bug severities, and document health across Zyroute.\n\nAsk me anything about project status, delayed tasks, or risk mitigations.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Live query for current project data
  const project = useLiveQuery(() => db.projects.get('proj-zyroute'));
  const requirements = useLiveQuery(() => db.requirements.where('projectId').equals('proj-zyroute').toArray()) || [];
  const tasks = useLiveQuery(() => db.tasks.where('projectId').equals('proj-zyroute').toArray()) || [];
  const bugs = useLiveQuery(() => db.issues.where('projectId').equals('proj-zyroute').toArray()) || [];
  const risks = useLiveQuery(() => db.risks.where('projectId').equals('proj-zyroute').toArray()) || [];
  const sprints = useLiveQuery(() => db.sprints.where('projectId').equals('proj-zyroute').toArray()) || [];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.askProjectAssistant(query, {
        projectName: project?.name || 'Zyroute Online Bus Reservation System',
        requirements,
        tasks,
        bugs,
        risks,
        sprints,
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'What is the current project status?',
    'Which tasks are delayed?',
    'What is our highest risk item?',
    'How is developer workload distributed?',
  ];

  if (!isAIAssistantOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] shadow-2xl animate-slide-left">
      {/* Drawer Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-ai-500 text-white shadow-glow-ai">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              TKanAI Project Copilot
            </h3>
            <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Zyroute Live DB
            </span>
          </div>
        </div>
        <button
          onClick={() => setAIAssistantOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                m.sender === 'ai'
                  ? 'bg-ai-100 dark:bg-ai-950 text-ai-600 dark:text-ai-300 border border-ai-200 dark:border-ai-800'
                  : 'bg-brand-600 text-white'
              }`}
            >
              {m.sender === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'ai'
                  ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-brand-600 text-white shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans">
                {m.text}
              </div>
              <span
                className={`mt-1 block text-[9px] ${
                  m.sender === 'ai' ? 'text-slate-400' : 'text-brand-200'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-2 text-xs text-ai-600 dark:text-ai-400">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Analyzing Zyroute telemetry and computing response...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Suggested Project Queries
        </p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600 dark:hover:text-brand-300 transition-all text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about requirements, risks, tasks, or bugs..."
            className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-ai-600 text-white disabled:opacity-40 shadow-sm transition-all hover:scale-105"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
