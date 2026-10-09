import { projectRepository } from '../repositories/dexie/dexieRepositories';
import { Project } from '../types/entities';
import { eventBus } from '../events/eventBus';
import { activityService } from './notificationService';

export class ProjectService {
  async getProject(id: string): Promise<Project | undefined> {
    return projectRepository.getById(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return projectRepository.getAll();
  }

  async createProject(project: Project, userId: string, userName: string, userRole: any): Promise<string> {
    const id = await projectRepository.create(project);
    eventBus.emit('PROJECT_CREATED', project, { projectId: id, senderUserId: userId, senderRole: userRole, entityId: id, entityKey: project.key });
    await activityService.logActivity(
      id,
      userId,
      userName,
      userRole,
      'PROJECT_CREATED',
      'Project',
      id,
      project.key,
      `Created project ${project.name} (${project.key})`
    );
    return id;
  }

  async updateProject(id: string, changes: Partial<Project>, userId: string, userName: string, userRole: any): Promise<void> {
    await projectRepository.update(id, changes);
    const updated = await projectRepository.getById(id);
    if (updated) {
      eventBus.emit('PROJECT_UPDATED', updated, { projectId: id, senderUserId: userId, senderRole: userRole, entityId: id, entityKey: updated.key });
      await activityService.logActivity(
        id,
        userId,
        userName,
        userRole,
        'PROJECT_UPDATED',
        'Project',
        id,
        updated.key,
        `Updated project details for ${updated.name}`
      );
    }
  }
}

export const projectService = new ProjectService();
