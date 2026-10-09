import { db } from '../../db/db';
import {
  Project,
  Requirement,
  Epic,
  UserStory,
  Task,
  Sprint,
  Issue,
  TestCase,
  Document,
  DocumentVersion,
  ChangeRequest,
  Meeting,
  Activity,
  Notification,
  Risk,
  User,
  ResearchMetric,
} from '../../types/entities';
import {
  IProjectRepository,
  IRequirementRepository,
  IEpicRepository,
  IUserStoryRepository,
  ITaskRepository,
  ISprintRepository,
  IIssueRepository,
  ITestCaseRepository,
  IDocumentRepository,
  IDocumentVersionRepository,
  IChangeRequestRepository,
  IMeetingRepository,
  IActivityRepository,
  INotificationRepository,
  IRiskRepository,
  IUserRepository,
  IResearchMetricRepository,
} from '../interfaces';

export class DexieProjectRepository implements IProjectRepository {
  async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  }
  async getAll(): Promise<Project[]> {
    return db.projects.toArray();
  }
  async create(item: Project): Promise<string> {
    await db.projects.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Project>): Promise<number> {
    return db.projects.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  }
  async getByKey(key: string): Promise<Project | undefined> {
    return db.projects.where('key').equals(key).first();
  }
  async getByStatus(status: string): Promise<Project[]> {
    return db.projects.where('status').equals(status).toArray();
  }
}

export class DexieRequirementRepository implements IRequirementRepository {
  async getById(id: string): Promise<Requirement | undefined> {
    return db.requirements.get(id);
  }
  async getAll(): Promise<Requirement[]> {
    return db.requirements.toArray();
  }
  async create(item: Requirement): Promise<string> {
    await db.requirements.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Requirement>): Promise<number> {
    return db.requirements.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.requirements.delete(id);
  }
  async getByProject(projectId: string): Promise<Requirement[]> {
    return db.requirements.where('projectId').equals(projectId).toArray();
  }
  async getByKey(key: string): Promise<Requirement | undefined> {
    return db.requirements.where('key').equals(key).first();
  }
}

export class DexieEpicRepository implements IEpicRepository {
  async getById(id: string): Promise<Epic | undefined> {
    return db.epics.get(id);
  }
  async getAll(): Promise<Epic[]> {
    return db.epics.toArray();
  }
  async create(item: Epic): Promise<string> {
    await db.epics.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Epic>): Promise<number> {
    return db.epics.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.epics.delete(id);
  }
  async getByProject(projectId: string): Promise<Epic[]> {
    return db.epics.where('projectId').equals(projectId).toArray();
  }
}

export class DexieUserStoryRepository implements IUserStoryRepository {
  async getById(id: string): Promise<UserStory | undefined> {
    return db.userStories.get(id);
  }
  async getAll(): Promise<UserStory[]> {
    return db.userStories.toArray();
  }
  async create(item: UserStory): Promise<string> {
    await db.userStories.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<UserStory>): Promise<number> {
    return db.userStories.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.userStories.delete(id);
  }
  async getByProject(projectId: string): Promise<UserStory[]> {
    return db.userStories.where('projectId').equals(projectId).toArray();
  }
  async getByRequirement(reqId: string): Promise<UserStory[]> {
    return db.userStories.where('requirementId').equals(reqId).toArray();
  }
  async getBySprint(sprintId: string): Promise<UserStory[]> {
    return db.userStories.where('sprintId').equals(sprintId).toArray();
  }
}

export class DexieTaskRepository implements ITaskRepository {
  async getById(id: string): Promise<Task | undefined> {
    return db.tasks.get(id);
  }
  async getAll(): Promise<Task[]> {
    return db.tasks.toArray();
  }
  async create(item: Task): Promise<string> {
    await db.tasks.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Task>): Promise<number> {
    return db.tasks.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }
  async getByProject(projectId: string): Promise<Task[]> {
    return db.tasks.where('projectId').equals(projectId).toArray();
  }
  async getBySprint(sprintId: string): Promise<Task[]> {
    return db.tasks.where('sprintId').equals(sprintId).toArray();
  }
  async getByAssignee(assigneeId: string): Promise<Task[]> {
    return db.tasks.where('assigneeId').equals(assigneeId).toArray();
  }
  async getByStatus(projectId: string, status: string): Promise<Task[]> {
    return db.tasks.where('projectId').equals(projectId).and((t) => t.status === status).toArray();
  }
}

export class DexieSprintRepository implements ISprintRepository {
  async getById(id: string): Promise<Sprint | undefined> {
    return db.sprints.get(id);
  }
  async getAll(): Promise<Sprint[]> {
    return db.sprints.toArray();
  }
  async create(item: Sprint): Promise<string> {
    await db.sprints.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Sprint>): Promise<number> {
    return db.sprints.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.sprints.delete(id);
  }
  async getByProject(projectId: string): Promise<Sprint[]> {
    return db.sprints.where('projectId').equals(projectId).toArray();
  }
  async getActiveSprint(projectId: string): Promise<Sprint | undefined> {
    return db.sprints.where('projectId').equals(projectId).and((s) => s.status === 'Active').first();
  }
}

export class DexieIssueRepository implements IIssueRepository {
  async getById(id: string): Promise<Issue | undefined> {
    return db.issues.get(id);
  }
  async getAll(): Promise<Issue[]> {
    return db.issues.toArray();
  }
  async create(item: Issue): Promise<string> {
    await db.issues.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Issue>): Promise<number> {
    return db.issues.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.issues.delete(id);
  }
  async getByProject(projectId: string): Promise<Issue[]> {
    return db.issues.where('projectId').equals(projectId).toArray();
  }
  async getOpenBugs(projectId: string): Promise<Issue[]> {
    return db.issues.where('projectId').equals(projectId).and((i) => i.status !== 'Closed').toArray();
  }
}

export class DexieTestCaseRepository implements ITestCaseRepository {
  async getById(id: string): Promise<TestCase | undefined> {
    return db.testCases.get(id);
  }
  async getAll(): Promise<TestCase[]> {
    return db.testCases.toArray();
  }
  async create(item: TestCase): Promise<string> {
    await db.testCases.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<TestCase>): Promise<number> {
    return db.testCases.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.testCases.delete(id);
  }
  async getByProject(projectId: string): Promise<TestCase[]> {
    return db.testCases.where('projectId').equals(projectId).toArray();
  }
  async getByRequirement(reqId: string): Promise<TestCase[]> {
    return db.testCases.where('requirementId').equals(reqId).toArray();
  }
}

export class DexieDocumentRepository implements IDocumentRepository {
  async getById(id: string): Promise<Document | undefined> {
    return db.documents.get(id);
  }
  async getAll(): Promise<Document[]> {
    return db.documents.toArray();
  }
  async create(item: Document): Promise<string> {
    await db.documents.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Document>): Promise<number> {
    return db.documents.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.documents.delete(id);
  }
  async getByProject(projectId: string): Promise<Document[]> {
    return db.documents.where('projectId').equals(projectId).toArray();
  }
  async getByCategory(projectId: string, category: string): Promise<Document[]> {
    return db.documents.where('projectId').equals(projectId).and((d) => d.category === category).toArray();
  }
}

export class DexieDocumentVersionRepository implements IDocumentVersionRepository {
  async getById(id: string): Promise<DocumentVersion | undefined> {
    return db.documentVersions.get(id);
  }
  async getAll(): Promise<DocumentVersion[]> {
    return db.documentVersions.toArray();
  }
  async create(item: DocumentVersion): Promise<string> {
    await db.documentVersions.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<DocumentVersion>): Promise<number> {
    return db.documentVersions.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.documentVersions.delete(id);
  }
  async getByDocument(documentId: string): Promise<DocumentVersion[]> {
    return db.documentVersions.where('documentId').equals(documentId).toArray();
  }
}

export class DexieChangeRequestRepository implements IChangeRequestRepository {
  async getById(id: string): Promise<ChangeRequest | undefined> {
    return db.changeRequests.get(id);
  }
  async getAll(): Promise<ChangeRequest[]> {
    return db.changeRequests.toArray();
  }
  async create(item: ChangeRequest): Promise<string> {
    await db.changeRequests.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<ChangeRequest>): Promise<number> {
    return db.changeRequests.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.changeRequests.delete(id);
  }
  async getByProject(projectId: string): Promise<ChangeRequest[]> {
    return db.changeRequests.where('projectId').equals(projectId).toArray();
  }
}

export class DexieMeetingRepository implements IMeetingRepository {
  async getById(id: string): Promise<Meeting | undefined> {
    return db.meetings.get(id);
  }
  async getAll(): Promise<Meeting[]> {
    return db.meetings.toArray();
  }
  async create(item: Meeting): Promise<string> {
    await db.meetings.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Meeting>): Promise<number> {
    return db.meetings.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.meetings.delete(id);
  }
  async getByProject(projectId: string): Promise<Meeting[]> {
    return db.meetings.where('projectId').equals(projectId).toArray();
  }
}

export class DexieActivityRepository implements IActivityRepository {
  async getById(id: string): Promise<Activity | undefined> {
    return db.activities.get(id);
  }
  async getAll(): Promise<Activity[]> {
    return db.activities.reverse().toArray();
  }
  async create(item: Activity): Promise<string> {
    await db.activities.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Activity>): Promise<number> {
    return db.activities.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.activities.delete(id);
  }
  async getByProject(projectId: string, limit = 50): Promise<Activity[]> {
    return db.activities.where('projectId').equals(projectId).reverse().limit(limit).toArray();
  }
  async getRecent(limit = 20): Promise<Activity[]> {
    return db.activities.orderBy('timestamp').reverse().limit(limit).toArray();
  }
}

export class DexieNotificationRepository implements INotificationRepository {
  async getById(id: string): Promise<Notification | undefined> {
    return db.notifications.get(id);
  }
  async getAll(): Promise<Notification[]> {
    return db.notifications.reverse().toArray();
  }
  async create(item: Notification): Promise<string> {
    await db.notifications.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Notification>): Promise<number> {
    return db.notifications.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.notifications.delete(id);
  }
  async getByUser(userId: string): Promise<Notification[]> {
    return db.notifications.where('recipientUserId').equals(userId).reverse().toArray();
  }
  async markAsRead(id: string): Promise<void> {
    await db.notifications.update(id, { read: true });
  }
  async markAllAsRead(userId: string): Promise<void> {
    const unread = await db.notifications.where('recipientUserId').equals(userId).filter((n) => !n.read).toArray();
    await Promise.all(unread.map((n) => db.notifications.update(n.id, { read: true })));
  }
}

export class DexieRiskRepository implements IRiskRepository {
  async getById(id: string): Promise<Risk | undefined> {
    return db.risks.get(id);
  }
  async getAll(): Promise<Risk[]> {
    return db.risks.toArray();
  }
  async create(item: Risk): Promise<string> {
    await db.risks.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<Risk>): Promise<number> {
    return db.risks.update(id, { ...changes, updatedAt: new Date().toISOString() });
  }
  async delete(id: string): Promise<void> {
    await db.risks.delete(id);
  }
  async getByProject(projectId: string): Promise<Risk[]> {
    return db.risks.where('projectId').equals(projectId).toArray();
  }
}

export class DexieUserRepository implements IUserRepository {
  async getById(id: string): Promise<User | undefined> {
    return db.users.get(id);
  }
  async getAll(): Promise<User[]> {
    return db.users.toArray();
  }
  async create(item: User): Promise<string> {
    await db.users.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<User>): Promise<number> {
    return db.users.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.users.delete(id);
  }
  async getByEmail(email: string): Promise<User | undefined> {
    return db.users.where('email').equalsIgnoreCase(email).first();
  }
  async getByRole(role: string): Promise<User[]> {
    return db.users.where('role').equals(role).toArray();
  }
}

export class DexieResearchMetricRepository implements IResearchMetricRepository {
  async getById(id: string): Promise<ResearchMetric | undefined> {
    return db.researchMetrics.get(id);
  }
  async getAll(): Promise<ResearchMetric[]> {
    return db.researchMetrics.reverse().toArray();
  }
  async create(item: ResearchMetric): Promise<string> {
    await db.researchMetrics.add(item);
    return item.id;
  }
  async update(id: string, changes: Partial<ResearchMetric>): Promise<number> {
    return db.researchMetrics.update(id, changes);
  }
  async delete(id: string): Promise<void> {
    await db.researchMetrics.delete(id);
  }
  async getRecent(limit = 100): Promise<ResearchMetric[]> {
    return db.researchMetrics.orderBy('timestamp').reverse().limit(limit).toArray();
  }
}

// Export singleton repository instances
export const projectRepository = new DexieProjectRepository();
export const requirementRepository = new DexieRequirementRepository();
export const epicRepository = new DexieEpicRepository();
export const userStoryRepository = new DexieUserStoryRepository();
export const taskRepository = new DexieTaskRepository();
export const sprintRepository = new DexieSprintRepository();
export const issueRepository = new DexieIssueRepository();
export const testCaseRepository = new DexieTestCaseRepository();
export const documentRepository = new DexieDocumentRepository();
export const documentVersionRepository = new DexieDocumentVersionRepository();
export const changeRequestRepository = new DexieChangeRequestRepository();
export const meetingRepository = new DexieMeetingRepository();
export const activityRepository = new DexieActivityRepository();
export const notificationRepository = new DexieNotificationRepository();
export const riskRepository = new DexieRiskRepository();
export const userRepository = new DexieUserRepository();
export const researchMetricRepository = new DexieResearchMetricRepository();
