import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Check,
  ExternalLink,
  ShieldAlert,
  Activity,
  Microscope,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useSessionStore } from '../../store/useSessionStore';
import { UserRole, ROLE_DEFINITIONS } from '../../types/roles';
import { db } from '../../db/db';
import { Notification } from '../../types/entities';
import { useLiveQuery } from 'dexie-react-hooks';

export const Header: React.FC = () => {
  const { theme, toggleTheme, setSearchModalOpen, toggleAIAssistant, isAIAssistantOpen, isResearchMode, toggleResearchMode } = useUIStore();
  const { currentUser, currentRole, switchRole, allUsers } = useSessionStore();
  
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Live queries for unread notifications
  const notifications = useLiveQuery(
    () => db.notifications.where('recipientUserId').equals(currentUser.id).reverse().limit(10).toArray(),
    [currentUser.id]
  ) || [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await db.notifications.update(id, { read: true });
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => db.notifications.update(n.id, { read: true })));
  };

  const roleDef = ROLE_DEFINITIONS[currentRole];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0e1424]/80 px-4 md:px-6 backdrop-blur-md">
      {/* Search Bar Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/70 px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all shadow-inner hover:border-slate-300 dark:hover:border-slate-700 w-48 sm:w-72"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search tasks, REQs, docs, bugs...</span>
          <kbd className="ml-auto hidden sm:inline-block rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Research Mode Badge */}
        <button
          onClick={toggleResearchMode}
          className={`hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all ${
            isResearchMode
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
          title="Toggle Research / Academic Demonstration Mode"
        >
          <Microscope className="h-3.5 w-3.5" />
          <span>Research Mode: {isResearchMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* AI Assistant Button */}
        <button
          onClick={toggleAIAssistant}
          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
            isAIAssistantOpen
              ? 'bg-ai-600 text-white shadow-glow-ai'
              : 'bg-ai-50 dark:bg-ai-950/60 text-ai-700 dark:text-ai-300 border border-ai-200 dark:border-ai-800 hover:bg-ai-100 dark:hover:bg-ai-900/60'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-ai-500 dark:text-ai-400 animate-pulse-subtle" />
          <span className="hidden sm:inline">AI Assistant</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-glass dark:shadow-glass-dark z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand-100 dark:bg-brand-950 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:text-brand-300">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-2 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      className={`pt-2 flex flex-col gap-1 cursor-pointer rounded-lg p-2 transition-colors ${
                        !notif.read
                          ? 'bg-brand-50/60 dark:bg-brand-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Role Persona Switcher Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 py-1 px-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {roleDef.label}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-glass dark:shadow-glass-dark z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Persona (10 Roles)
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Instant multi-role simulation
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto py-1 space-y-1">
                {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
                  const def = ROLE_DEFINITIONS[roleKey];
                  const isSelected = currentRole === roleKey;
                  const personaUser = allUsers.find((u) => u.role === roleKey);

                  return (
                    <button
                      key={roleKey}
                      onClick={() => {
                        switchRole(roleKey);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/60 font-semibold text-brand-600 dark:text-brand-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {personaUser && (
                          <img
                            src={personaUser.avatarUrl}
                            alt={personaUser.name}
                            className="h-6 w-6 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">{def.label}</span>
                          <span className="text-[10px] text-slate-400 truncate">{def.defaultEmail}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-brand-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
