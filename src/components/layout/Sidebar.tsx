import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  GitPullRequest,
  ListTodo,
  Kanban,
  Zap,
  Bug,
  TestTube2,
  BookOpen,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Microscope,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useSessionStore } from '../../store/useSessionStore';
import { ROLE_DEFINITIONS } from '../../types/roles';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar, isResearchMode } = useUIStore();
  const { currentRole } = useSessionStore();
  const roleDef = ROLE_DEFINITIONS[currentRole];
  const location = useLocation();

  const projectId = 'proj-zyroute'; // Default active project

  const navItems = [
    {
      label: 'Executive Overview',
      items: [
        { name: 'Organization Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Project Portfolio', path: '/projects', icon: Layers },
      ],
    },
    {
      label: 'Zyroute SDLC Workspace',
      items: [
        { name: 'Project 360', path: `/projects/${projectId}/dashboard`, icon: LayoutDashboard },
        { name: 'Requirements & AI', path: `/projects/${projectId}/requirements`, icon: FileCheck2 },
        { name: 'Traceability Matrix', path: `/projects/${projectId}/traceability`, icon: GitPullRequest },
        { name: 'Backlog & Stories', path: `/projects/${projectId}/backlog`, icon: ListTodo },
        { name: 'Kanban Board', path: `/projects/${projectId}/board`, icon: Kanban },
        { name: 'Sprint Analytics', path: `/projects/${projectId}/sprints`, icon: Zap },
        { name: 'Issues & AI Bug Lab', path: `/projects/${projectId}/issues`, icon: Bug },
        { name: 'QA Test Suites', path: `/projects/${projectId}/testing`, icon: TestTube2 },
        { name: 'Documentation Hub', path: `/projects/${projectId}/documentation`, icon: BookOpen },
        { name: 'Meetings & AI Decisions', path: `/projects/${projectId}/meetings`, icon: Calendar },
        { name: 'AI Risk Radar', path: `/projects/${projectId}/risks`, icon: AlertTriangle },
        { name: 'Executive Reports', path: `/projects/${projectId}/reports`, icon: FileText },
      ],
    },
    {
      label: 'Portals & Research',
      items: [
        { name: 'Client Portal', path: '/client', icon: UserCheck, highlight: currentRole === 'CLIENT' },
        { name: 'Research Telemetry', path: '/research', icon: Microscope, badge: 'Beta' },
        { name: 'System Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1424] transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-ai-500 text-white shadow-glow-brand">
              <Sparkles className="h-5 w-5 animate-pulse-subtle" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                TKan<span className="text-brand-500">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">
                SDLC Ecosystem
              </span>
            </div>
          </div>
        )}

        {isSidebarCollapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-ai-500 text-white shadow-glow-brand">
            <Sparkles className="h-5 w-5" />
          </div>
        )}

        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  } ${item.highlight ? 'ring-1 ring-violet-400/50 bg-violet-50/50 dark:bg-violet-950/30' : ''}`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="rounded bg-ai-100 dark:bg-ai-950 px-1.5 py-0.5 text-[10px] font-bold text-ai-700 dark:text-ai-300 border border-ai-200 dark:border-ai-800">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Role Indicator Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-[#0a0f1d]">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className={`h-2.5 w-2.5 rounded-full ${roleDef.role === 'CLIENT' ? 'bg-violet-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 truncate">
                Active Persona
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {roleDef.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`Active Persona: ${roleDef.label}`}>
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
