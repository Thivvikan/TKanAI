import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { useSessionStore } from '../../store/useSessionStore';
import { ROLE_DEFINITIONS } from '../../types/roles';

export const AppLayout: React.FC = () => {
  const { currentRole, currentUser } = useSessionStore();
  const roleDef = ROLE_DEFINITIONS[currentRole];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#0b0f19]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Client Persona Alert Banner if in Client Mode */}
        {roleDef.isClientView && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white flex items-center justify-between shadow-sm">
            <span>
              🌐 <strong>Client Portal View:</strong> You are viewing the application from the client persona ({currentUser.name}). Internal technical backlogs and engineering tasks are appropriately scoped.
            </span>
          </div>
        )}

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Slide-over & Modals */}
      <AIAssistantDrawer />
      <GlobalSearchModal />
    </div>
  );
};
