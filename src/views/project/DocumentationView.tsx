import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BookOpen,
  History,
  Sparkles,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Search,
  Save,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { db } from '../../db/db';
import { Document, DocumentCategory, DocumentVersion } from '../../types/entities';
import { useSessionStore } from '../../store/useSessionStore';
import { documentService } from '../../services/changeRequestService';
import confetti from 'canvas-confetti';

export const DocumentationView: React.FC = () => {
  const { projectId = 'proj-zyroute' } = useParams<{ projectId: string }>();
  const { currentUser, currentRole } = useSessionStore();

  const documents = useLiveQuery(() => db.documents.where('projectId').equals(projectId).toArray()) || [];
  const versions = useLiveQuery(() => db.documentVersions.toArray()) || [];

  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [bumpVersionOnSave, setBumpVersionOnSave] = useState(true);
  const [changeSummary, setChangeSummary] = useState('');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Technical Documentation');
  const [newContent, setNewContent] = useState('# Document Title\n\n## 1. Overview\nEnter content here...');

  const selectedDoc = activeDoc || documents[0];

  const handleSelectDoc = (doc: Document) => {
    setActiveDoc(doc);
    setEditedContent(doc.contentMarkdown);
  };

  const handleSaveDoc = async () => {
    if (!selectedDoc) return;
    await documentService.updateDocument(
      selectedDoc.id,
      { contentMarkdown: editedContent || selectedDoc.contentMarkdown },
      changeSummary || 'Updated content via Documentation Hub',
      currentUser.id,
      currentUser.name,
      currentRole,
      bumpVersionOnSave
    );
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    alert(`✅ Document ${selectedDoc.key} successfully saved! Version history updated.`);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const count = documents.length + 1;
    const key = `DOC-TECH-0${count}`;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      key,
      projectId,
      title: newTitle,
      category: newCategory,
      description: `Living documentation for ${newTitle}`,
      authorId: currentUser.id,
      ownerId: currentUser.id,
      version: 'v1.0',
      status: 'Approved',
      contentMarkdown: newContent,
      linkedRequirementIds: ['req-01'],
      linkedTaskIds: ['task-101'],
      linkedIssueIds: [],
      healthScore: 92,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await documentService.createDocument(newDoc, currentUser.id, currentUser.name, currentRole);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setActiveDoc(newDoc);
    setEditedContent(newDoc.contentMarkdown);
  };

  const docVersions = versions.filter((v) => v.documentId === selectedDoc?.id);

  // Calculate Health Breakdown
  const avgHealth = documents.length > 0
    ? Math.round(documents.reduce((acc, d) => acc + (d.healthScore || 85), 0) / documents.length)
    : 90;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 text-xs font-bold">
              Documentation Hub
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Living Documentation & Semantic Versioning
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Version-controlled system specifications, architectural blueprints, API contracts, and automated health audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Doc Health Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Overall Documentation Health: {avgHealth}%
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              AI Audit: All core SRS sections are linked to active requirements with 0 broken references.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">SRS: <strong className="text-emerald-500">94%</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-semibold text-slate-500">Arch: <strong className="text-emerald-500">88%</strong></span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-semibold text-slate-500">API: <strong className="text-emerald-500">82%</strong></span>
        </div>
      </div>

      {/* Grid: Document Sidebar (4 cols) + Structured Editor (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Tree Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="glass-card p-3 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Project Documents ({documents.length})
            </span>
            <div className="space-y-1">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-purple-500" />
                      <div className="truncate">
                        <span className="text-xs truncate block">{doc.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.key} ({doc.category})</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 shrink-0">
                      {doc.version}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Structured Editor & Version Controls */}
        <div className="lg:col-span-8">
          {selectedDoc ? (
            <div className="glass-card p-5 space-y-4">
              {/* Document Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded">
                      {selectedDoc.key}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedDoc.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Category: {selectedDoc.category} | Version: <strong className="text-purple-500">{selectedDoc.version}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsVersionModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                  >
                    <History className="h-3.5 w-3.5 text-purple-500" />
                    <span>Version History ({docVersions.length})</span>
                  </button>

                  <button
                    onClick={handleSaveDoc}
                    className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* Version Bump Checkbox & Summary input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={bumpVersionOnSave}
                    onChange={(e) => setBumpVersionOnSave(e.target.checked)}
                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Bump version number (e.g. {selectedDoc.version} → v{parseInt(selectedDoc.version.replace('v', '').split('.')[0])}.{parseInt(selectedDoc.version.replace('v', '').split('.')[1] || '0') + 1})</span>
                </label>

                <input
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Summary of changes..."
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs text-slate-900 dark:text-white focus:outline-none flex-1 max-w-xs"
                />
              </div>

              {/* Markdown Editor Textarea */}
              <div>
                <textarea
                  value={editedContent !== '' ? editedContent : selectedDoc.contentMarkdown}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={16}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-xs font-mono text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-xs text-slate-400">
              Select a document to edit.
            </div>
          )}
        </div>
      </div>

      {/* Version History Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="h-4 w-4 text-purple-500" />
                Version History: {selectedDoc?.title}
              </h3>
              <button onClick={() => setIsVersionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3">
              {docVersions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No version history records found.</p>
              ) : (
                docVersions.map((ver) => (
                  <div key={ver.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded">
                        {ver.version}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ver.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {ver.changeReason}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Summary: {ver.changeSummary}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="rounded-xl bg-slate-200 dark:bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create New Living Document
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Redis Cluster High-Availability Topology"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Document Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Technical Documentation">Technical Documentation</option>
                  <option value="System Architecture">System Architecture</option>
                  <option value="API Documentation">API Documentation</option>
                  <option value="UI/UX Documentation">UI/UX Documentation</option>
                  <option value="Test Plan">Test Plan</option>
                  <option value="Deployment Guide">Deployment Guide</option>
                  <option value="User Manual">User Manual</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Markdown Content
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                >
                  Create Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
