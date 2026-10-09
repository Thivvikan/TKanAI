import { taskRepository, userStoryRepository, issueRepository } from '../repositories/dexie/dexieRepositories';
import { Task, TaskStatus, Issue, UserStory } from '../types/entities';
import { eventBus } from '../events/eventBus';
import { activityService, notificationService } from './notificationService';
import { aiService } from './aiService';

export class TaskService {
  async getTasks(projectId: string): Promise<Task[]> {
    return taskRepository.getByProject(projectId);
  }

  async getTasksBySprint(sprintId: string): Promise<Task[]> {
    return taskRepository.getBySprint(sprintId);
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return taskRepository.getByAssignee(assigneeId);
  }

  async createTask(task: Task, userId: string, userName: string, userRole: any): Promise<string> {
    const id = await taskRepository.create(task);
    eventBus.emit('TASK_CREATED', task, {
      projectId: task.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: task.key,
    });

    await activityService.logActivity(
      task.projectId,
      userId,
      userName,
      userRole,
      'TASK_CREATED',
      'Task',
      id,
      task.key,
      `Created task ${task.key}: ${task.title}`
    );

    if (task.assigneeId && task.assigneeId !== userId) {
      await notificationService.sendNotification(
        task.assigneeId,
        `New Task Assigned: ${task.key}`,
        `${userName} assigned you ${task.key}: "${task.title}".`,
        'info',
        `/projects/${task.projectId}/board`
      );
    }

    return id;
  }

  async updateTaskStatus(id: string, newStatus: TaskStatus, userId: string, userName: string, userRole: any): Promise<void> {
    const task = await taskRepository.getById(id);
    if (!task) return;

    const oldStatus = task.status;
    await taskRepository.update(id, { status: newStatus });

    const updatedTask = { ...task, status: newStatus };
    eventBus.emit('TASK_STATUS_CHANGED', { task: updatedTask, oldStatus, newStatus }, {
      projectId: task.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: task.key,
    });

    await activityService.logActivity(
      task.projectId,
      userId,
      userName,
      userRole,
      'TASK_STATUS_CHANGED',
      'Task',
      id,
      task.key,
      `Moved ${task.key} from ${oldStatus} to ${newStatus}`
    );

    // Cross-role workflow notifications:
    if (newStatus === 'QA') {
      // Notify QA
      await notificationService.sendNotification(
        'usr-qa',
        `Task Ready for Testing: ${task.key}`,
        `${userName} moved ${task.key} ("${task.title}") to QA column.`,
        'info',
        `/projects/${task.projectId}/board`
      );
    } else if (newStatus === 'Client Review') {
      // Notify Client & PM
      await notificationService.sendNotification(
        'usr-client',
        `Deliverable Ready for Review: ${task.key}`,
        `Feature "${task.title}" is ready for your review and sign-off.`,
        'info',
        `/client`
      );
    }
  }

  async assignTask(id: string, assigneeId: string, userId: string, userName: string, userRole: any): Promise<void> {
    const task = await taskRepository.getById(id);
    if (!task) return;

    await taskRepository.update(id, { assigneeId });
    eventBus.emit('TASK_ASSIGNED', { task, assigneeId }, {
      projectId: task.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: task.key,
    });

    await activityService.logActivity(
      task.projectId,
      userId,
      userName,
      userRole,
      'TASK_ASSIGNED',
      'Task',
      id,
      task.key,
      `Assigned ${task.key} to user ${assigneeId}`
    );

    if (assigneeId !== userId) {
      await notificationService.sendNotification(
        assigneeId,
        `Task Assigned: ${task.key}`,
        `${userName} assigned you ${task.key}: "${task.title}".`,
        'info',
        `/projects/${task.projectId}/board`
      );
    }
  }
}

export class IssueService {
  async getIssues(projectId: string): Promise<Issue[]> {
    return issueRepository.getByProject(projectId);
  }

  async createIssue(issue: Issue, userId: string, userName: string, userRole: any): Promise<string> {
    if (!issue.aiIntelligence) {
      issue.aiIntelligence = await aiService.diagnoseBug(issue.title, issue.description, issue.key);
    }

    const id = await issueRepository.create(issue);
    eventBus.emit('BUG_CREATED', issue, {
      projectId: issue.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: issue.key,
    });

    await activityService.logActivity(
      issue.projectId,
      userId,
      userName,
      userRole,
      'BUG_CREATED',
      'Issue',
      id,
      issue.key,
      `Logged ${issue.severity} bug ${issue.key}: ${issue.title}`
    );

    if (issue.assigneeId && issue.assigneeId !== userId) {
      await notificationService.sendNotification(
        issue.assigneeId,
        `Bug Assigned: ${issue.key}`,
        `${userName} assigned you ${issue.severity} issue ${issue.key}: "${issue.title}".`,
        'error',
        `/projects/${issue.projectId}/issues`
      );
    }

    return id;
  }

  async resolveIssue(id: string, userId: string, userName: string, userRole: any): Promise<void> {
    const issue = await issueRepository.getById(id);
    if (!issue) return;

    await issueRepository.update(id, { status: 'Fixed', resolvedAt: new Date().toISOString() });
    eventBus.emit('BUG_RESOLVED', issue, {
      projectId: issue.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: issue.key,
    });

    await activityService.logActivity(
      issue.projectId,
      userId,
      userName,
      userRole,
      'BUG_RESOLVED',
      'Issue',
      id,
      issue.key,
      `Marked ${issue.key} as Fixed (Ready for QA Retest)`
    );

    // Notify QA Engineer
    await notificationService.sendNotification(
      issue.reporterId || 'usr-qa',
      `Bug Fixed (Ready for Retest): ${issue.key}`,
      `${userName} resolved ${issue.key}: "${issue.title}". Please verify and close.`,
      'success',
      `/projects/${issue.projectId}/issues`
    );
  }

  async verifyIssue(id: string, userId: string, userName: string, userRole: any): Promise<void> {
    const issue = await issueRepository.getById(id);
    if (!issue) return;

    await issueRepository.update(id, { status: 'Verified' });
    eventBus.emit('BUG_VERIFIED', issue, {
      projectId: issue.projectId,
      senderUserId: userId,
      senderRole: userRole,
      entityId: id,
      entityKey: issue.key,
    });

    await activityService.logActivity(
      issue.projectId,
      userId,
      userName,
      userRole,
      'BUG_VERIFIED',
      'Issue',
      id,
      issue.key,
      `QA verified and approved fix for ${issue.key}`
    );
  }
}

export const taskService = new TaskService();
export const issueService = new IssueService();
