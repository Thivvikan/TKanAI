import { requirementRepository } from '../repositories/dexie/dexieRepositories';
import { Requirement } from '../types/entities';
import { eventBus } from '../events/eventBus';
import { activityService, notificationService } from './notificationService';
import { aiService } from './aiService';

export class RequirementService {
  async getRequirements(projectId: string): Promise<Requirement[]> {
    return requirementRepository.getByProject(projectId);
  }

  async getRequirement(id: string): Promise<Requirement | undefined> {
    return requirementRepository.getById(id);
  }

  async createRequirement(req: Requirement, userId: string, userName: string, userRole: any): Promise<string> {
    // Run initial AI ambiguity analysis if not provided
    if (!req.aiAnalysis) {
      req.aiAnalysis = await aiService.analyzeRequirement(req);
    }

    const id = await requirementRepository.create(req);
    eventBus.emit('REQUIREMENT_CREATED', req, {
      projectId: req.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: req.key,
    });

    await activityService.logActivity(
      req.projectId,
      userId,
      userName,
      userRole,
      'REQUIREMENT_CREATED',
      'Requirement',
      id,
      req.key,
      `Created requirement ${req.key}: ${req.title}`
    );

    return id;
  }

  async updateRequirement(id: string, changes: Partial<Requirement>, userId: string, userName: string, userRole: any): Promise<void> {
    const existing = await requirementRepository.getById(id);
    if (!existing) return;

    // If description changed, recalculate AI ambiguity
    if (changes.description && changes.description !== existing.description) {
      changes.aiAnalysis = await aiService.analyzeRequirement({ ...existing, ...changes });
    }

    await requirementRepository.update(id, changes);
    const updated = await requirementRepository.getById(id);
    if (updated) {
      eventBus.emit('REQUIREMENT_UPDATED', updated, {
        projectId: updated.projectId,
        senderUserId: userId,
        senderRole: userRole,
        entityId: id,
        entityKey: updated.key,
      });

      await activityService.logActivity(
        updated.projectId,
        userId,
        userName,
        userRole,
        'REQUIREMENT_UPDATED',
        'Requirement',
        id,
        updated.key,
        `Updated requirement ${updated.key}: ${updated.title}`
      );
    }
  }

  async approveRequirement(id: string, userId: string, userName: string, userRole: any): Promise<void> {
    const req = await requirementRepository.getById(id);
    if (!req) return;

    await requirementRepository.update(id, { status: 'Approved' });
    eventBus.emit('REQUIREMENT_APPROVED', req, {
      projectId: req.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: req.key,
    });

    await activityService.logActivity(
      req.projectId,
      userId,
      userName,
      userRole,
      'REQUIREMENT_APPROVED',
      'Requirement',
      id,
      req.key,
      `Approved requirement ${req.key}`
    );

    // Notify BA and PM
    await notificationService.sendNotification(
      'usr-ba',
      `Requirement Approved: ${req.key}`,
      `${userName} approved ${req.key}: "${req.title}". You may now proceed to story generation.`,
      'success',
      `/projects/${req.projectId}/requirements`
    );
  }
}

export const requirementService = new RequirementService();
