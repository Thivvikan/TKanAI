import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Users,
  Plus,
  ShieldCheck,
  Search,
  UserCheck,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { db } from '../../db/db';
import { User, Team } from '../../types/entities';
import { UserRole, ROLE_DEFINITIONS } from '../../types/roles';
import { useSessionStore } from '../../store/useSessionStore';
import confetti from 'canvas-confetti';

export const UsersTeamsView: React.FC = () => {
  const { allUsers, switchRole } = useSessionStore();
  const users = useLiveQuery(() => db.users.toArray()) || allUsers;
  const teams = useLiveQuery(() => db.teams.toArray()) || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2.5 py-0.5 text-xs font-bold">
              Organization Directory
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Users, Teams & Role Personas
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage organizational staff, cross-functional engineering squads, and switch between simulated user personas.
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Engineering Squads & Teams ({teams.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((t) => (
            <div key={t.id} className="glass-card p-5 space-y-2 border-l-4 border-l-brand-500">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.description}</p>
              <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold block pt-1">
                {t.memberIds?.length || 2} Active Members
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members by name or email..."
              className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((r) => (
              <option key={r} value={r}>{ROLE_DEFINITIONS[r].label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">User / Persona</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3 text-right">Simulate Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((u) => {
                const roleDef = ROLE_DEFINITIONS[u.role];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleDef.badgeClass}`}>
                        {roleDef.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{u.department || 'Engineering'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          switchRole(u.role);
                          confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
                        }}
                        className="rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-800 px-2.5 py-1 text-[11px] font-bold transition-all"
                      >
                        Switch to Persona
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
