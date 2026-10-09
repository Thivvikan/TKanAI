import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { ROLE_DEFINITIONS, UserRole } from '../../types/roles';
import confetti from 'canvas-confetti';

export const LoginView: React.FC = () => {
  const { allUsers, switchRole } = useSessionStore();
  const navigate = useNavigate();

  const handleSelectPersona = (role: UserRole) => {
    switchRole(role);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    if (role === 'CLIENT') {
      navigate('/client');
    } else {
      navigate('/projects/proj-zyroute/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 sm:p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-ai-500 text-white shadow-glow-brand mb-2">
            <Sparkles className="h-6 w-6 animate-pulse-subtle" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            TKan<span className="text-brand-400">AI</span> Software Engineering Ecosystem
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Frontend Research Beta: Select any of the 10 role personas below to simulate multi-role collaboration in real-time.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map((roleKey) => {
            const def = ROLE_DEFINITIONS[roleKey];
            const personaUser = allUsers.find((u) => u.role === roleKey);

            return (
              <div
                key={roleKey}
                onClick={() => handleSelectPersona(roleKey)}
                className="glass-card p-4 bg-slate-900/90 border border-slate-800 hover:border-brand-500 hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    {personaUser && (
                      <img
                        src={personaUser.avatarUrl}
                        alt={personaUser.name}
                        className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{personaUser?.name || def.label}</h4>
                      <span className="text-[10px] text-slate-400 font-mono truncate block">{def.defaultEmail}</span>
                    </div>
                  </div>

                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${def.badgeClass}`}>
                    {def.label}
                  </span>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                    {def.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-semibold text-brand-400 group-hover:text-brand-300">
                  <span>Enter Persona</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
