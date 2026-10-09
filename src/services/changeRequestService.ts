import { changeRequestRepository, requirementRepository, userStoryRepository, taskRepository, documentRepository, documentVersionRepository } from '../repositories/dexie/dexieRepositories';
import { ChangeRequest, Document, DocumentVersion, AIChangeImpact } from '../types/entities';
import { eventBus } from '../events/eventBus';
import { activityService, notificationService } from './notificationService';
import { aiService } from './aiService';

export class ChangeRequestService {
  async getChangeRequests(projectId: string): Promise<ChangeRequest[]> {
    return changeRequestRepository.getByProject(projectId);
  }

  async submitChangeRequest(cr: ChangeRequest, userId: string, userName: string, userRole: any): Promise<string> {
    const projectReqs = await requirementRepository.getByProject(cr.projectId);
    const projectStories = await userStoryRepository.getByProject(cr.projectId);
    const projectTasks = await taskRepository.getByProject(cr.projectId);
    const projectDocs = await documentRepository.getByProject(cr.projectId);

    // Compute AI impact analysis
    cr.aiImpactAnalysis = await aiService.analyzeChangeImpact(cr, {
      requirements: projectReqs,
      stories: projectStories,
      tasks: projectTasks,
      documents: projectDocs,
    });
    cr.status = 'AI Impact Analyzed';

    const id = await changeRequestRepository.create(cr);
    eventBus.emit('CHANGE_REQUEST_SUBMITTED', cr, {
      projectId: cr.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: cr.key,
    });

    await activityService.logActivity(
      cr.projectId,
      userId,
      userName,
      userRole,
      'CHANGE_REQUEST_SUBMITTED',
      'ChangeRequest',
      id,
      cr.key,
      `Client submitted change request ${cr.key}: "${cr.title}"`
    );

    // Notify Project Manager
    await notificationService.sendNotification(
      'usr-pm',
      `Client Change Request: ${cr.key}`,
      `${userName} submitted a change request "${cr.title}". AI impact analysis is ready for review.`,
      'ai',
      `/client`
    );

    return id;
  }

  async approveChangeRequest(id: string, pmNotes: string, userId: string, userName: string, userRole: any): Promise<void> {
    const cr = await changeRequestRepository.getById(id);
    if (!cr) return;

    await changeRequestRepository.update(id, {
      status: 'Approved',
      pmDecisionNotes: pmNotes || 'Approved by Project Manager following AI Impact Assessment.',
    });

    eventBus.emit('CHANGE_REQUEST_APPROVED', cr, {
      projectId: cr.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: cr.key,
    });

    await activityService.logActivity(
      cr.projectId,
      userId,
      userName,
      userRole,
      'CHANGE_REQUEST_APPROVED',
      'ChangeRequest',
      id,
      cr.key,
      `PM approved change request ${cr.key} with ${cr.aiImpactAnalysis?.estimatedEffortHours || 18}h estimated effort`
    );

    // Notify Client
    await notificationService.sendNotification(
      cr.clientUserId,
      `Change Request Approved: ${cr.key}`,
      `Your change request "${cr.title}" has been approved and scheduled for implementation.`,
      'success',
      `/client`
    );
  }
}

export class DocumentService {
  async getDocuments(projectId: string): Promise<Document[]> {
    return documentRepository.getByProject(projectId);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return documentRepository.getById(id);
  }

  async createDocument(doc: Document, userId: string, userName: string, userRole: any): Promise<string> {
    const id = await documentRepository.create(doc);
    // Create initial v1.0 version history record
    const initialVersion: DocumentVersion = {
      id: `ver-${Date.now()}`,
      documentId: id,
      version: doc.version || 'v1.0',
      authorId: userId,
      timestamp: new Date().toISOString(),
      changeReason: 'Initial document baseline creation',
      changeSummary: 'Document created in documentation hub',
      contentMarkdown: doc.contentMarkdown,
      approved: doc.status === 'Approved',
    };
    await documentVersionRepository.create(initialVersion);

    eventBus.emit('DOCUMENT_CREATED', doc, {
      projectId: doc.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: doc.key,
    });

    await activityService.logActivity(
      doc.projectId,
      userId,
      userName,
      userRole,
      'DOCUMENT_CREATED',
      'Document',
      id,
      doc.key,
      `Created ${doc.category} document ${doc.key}: ${doc.title}`
    );

    return id;
  }

  async updateDocument(
    id: string,
    changes: Partial<Document>,
    changeSummary: string,
    userId: string,
    userName: string,
    userRole: any,
    bumpVersion = false
  ): Promise<void> {
    const existing = await documentRepository.getById(id);
    if (!existing) return;

    let newVersionStr = existing.version;
    if (bumpVersion) {
      const match = existing.version.match(/v(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]) + 1;
        newVersionStr = `v${major}.${minor}`;
      } else {
        newVersionStr = 'v1.1';
      }
      changes.version = newVersionStr;
    }

    await documentRepository.update(id, changes);

    if (changes.contentMarkdown || bumpVersion) {
      const versionRecord: DocumentVersion = {
        id: `ver-${Date.now()}`,
        documentId: id,
        version: newVersionStr,
        authorId: userId,
        timestamp: new Date().toISOString(),
        changeReason: bumpVersion ? 'Version update' : 'Content edit',
        changeSummary: changeSummary || 'Edited document content',
        contentMarkdown: changes.contentMarkdown || existing.contentMarkdown,
        approved: existing.status === 'Approved',
      };
      await documentVersionRepository.create(versionRecord);
    }

    eventBus.emit('DOCUMENT_UPDATED', { ...existing, ...changes }, {
      projectId: existing.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: existing.key,
    });

    await activityService.logActivity(
      existing.projectId,
      userId,
      userName,
      userRole,
      'DOCUMENT_UPDATED',
      'Document',
      id,
      existing.key,
      `Updated ${existing.key} to ${newVersionStr}`
    );
  }

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    return documentVersionRepository.getByDocument(documentId);
  }
}

export const changeRequestService = new ChangeRequestService();
export const documentService = new DocumentService();
