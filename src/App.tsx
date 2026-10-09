import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { initializeDatabase } from './db/seedData';
import './events/broadcastSync'; // Initialize BroadcastChannel cross-tab listener

// Views
import { LoginView } from './views/auth/LoginView';
import { OrgDashboardView } from './views/dashboard/OrgDashboardView';
import { ProjectsListView } from './views/project/ProjectsListView';
import { ProjectDashboardView } from './views/project/ProjectDashboardView';
import { RequirementsView } from './views/project/RequirementsView';
import { TraceabilityView } from './views/project/TraceabilityView';
import { BacklogView } from './views/project/BacklogView';
import { KanbanBoardView } from './views/project/KanbanBoardView';
import { SprintsView } from './views/project/SprintsView';
import { IssuesView } from './views/project/IssuesView';
import { TestingView } from './views/project/TestingView';
import { DocumentationView } from './views/project/DocumentationView';
import { MeetingsView } from './views/project/MeetingsView';
import { RisksView } from './views/project/RisksView';
import { ProjectReportsView } from './views/project/ProjectReportsView';
import { ClientDashboardView } from './views/client/ClientDashboardView';
import { UsersTeamsView } from './views/organization/UsersTeamsView';
import { ResearchAnalyticsView } from './views/research/ResearchAnalyticsView';
import { SettingsView } from './views/settings/SettingsView';

export const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => {
      setIsDbReady(true);
    });
  }, []);

  if (!isDbReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-slate-400">Initializing TKanAI SDLC Ecosystem DB...</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />

      {/* Main Layout Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/projects/proj-zyroute/dashboard" replace />} />
        <Route path="/dashboard" element={<OrgDashboardView />} />
        <Route path="/projects" element={<ProjectsListView />} />
        <Route path="/organization/users" element={<UsersTeamsView />} />

        {/* Project Specific Routes */}
        <Route path="/projects/:projectId" element={<Navigate to="dashboard" replace />} />
        <Route path="/projects/:projectId/dashboard" element={<ProjectDashboardView />} />
        <Route path="/projects/:projectId/requirements" element={<RequirementsView />} />
        <Route path="/projects/:projectId/traceability" element={<TraceabilityView />} />
        <Route path="/projects/:projectId/backlog" element={<BacklogView />} />
        <Route path="/projects/:projectId/board" element={<KanbanBoardView />} />
        <Route path="/projects/:projectId/sprints" element={<SprintsView />} />
        <Route path="/projects/:projectId/issues" element={<IssuesView />} />
        <Route path="/projects/:projectId/testing" element={<TestingView />} />
        <Route path="/projects/:projectId/documentation" element={<DocumentationView />} />
        <Route path="/projects/:projectId/meetings" element={<MeetingsView />} />
        <Route path="/projects/:projectId/risks" element={<RisksView />} />
        <Route path="/projects/:projectId/reports" element={<ProjectReportsView />} />

        {/* Dedicated Portals & Research */}
        <Route path="/client" element={<ClientDashboardView />} />
        <Route path="/client/projects/:projectId" element={<ClientDashboardView />} />
        <Route path="/research" element={<ResearchAnalyticsView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/projects/proj-zyroute/dashboard" replace />} />
    </Routes>
  );
};

export default App;
