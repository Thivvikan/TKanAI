import {
  Organization,
  User,
  Team,
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
  Comment,
  Activity,
  Notification,
  Risk,
  ResearchMetric,
} from '../types/entities';

export interface IBaseRepository<T, ID = string> {
  getById(id: ID): Promise<T | undefined>;
  getAll(): Promise<T[]>;
  create(item: T): Promise<ID>;
  update(id: ID, changes: Partial<T>): Promise<number>;
  delete(id: ID): Promise<void>;
}

export interface IProjectRepository extends IBaseRepository<Project> {
  getByKey(key: string): Promise<Project | undefined>;
  getByStatus(status: string): Promise<Project[]>;
}

export interface IRequirementRepository extends IBaseRepository<Requirement> {
  getByProject(projectId: string): Promise<Requirement[]>;
  getByKey(key: string): Promise<Requirement | undefined>;
}

export interface IEpicRepository extends IBaseRepository<Epic> {
  getByProject(projectId: string): Promise<Epic[]>;
}

export interface IUserStoryRepository extends IBaseRepository<UserStory> {
  getByProject(projectId: string): Promise<UserStory[]>;
  getByRequirement(reqId: string): Promise<UserStory[]>;
  getBySprint(sprintId: string): Promise<UserStory[]>;
}

export interface ITaskRepository extends IBaseRepository<Task> {
  getByProject(projectId: string): Promise<Task[]>;
  getBySprint(sprintId: string): Promise<Task[]>;
  getByAssignee(assigneeId: string): Promise<Task[]>;
  getByStatus(projectId: string, status: string): Promise<Task[]>;
}

export interface ISprintRepository extends IBaseRepository<Sprint> {
  getByProject(projectId: string): Promise<Sprint[]>;
  getActiveSprint(projectId: string): Promise<Sprint | undefined>;
}

export interface IIssueRepository extends IBaseRepository<Issue> {
  getByProject(projectId: string): Promise<Issue[]>;
  getOpenBugs(projectId: string): Promise<Issue[]>;
}

export interface ITestCaseRepository extends IBaseRepository<TestCase> {
  getByProject(projectId: string): Promise<TestCase[]>;
  getByRequirement(reqId: string): Promise<TestCase[]>;
}

export interface IDocumentRepository extends IBaseRepository<Document> {
  getByProject(projectId: string): Promise<Document[]>;
  getByCategory(projectId: string, category: string): Promise<Document[]>;
}

export interface IDocumentVersionRepository extends IBaseRepository<DocumentVersion> {
  getByDocument(documentId: string): Promise<DocumentVersion[]>;
}

export interface IChangeRequestRepository extends IBaseRepository<ChangeRequest> {
  getByProject(projectId: string): Promise<ChangeRequest[]>;
}

export interface IMeetingRepository extends IBaseRepository<Meeting> {
  getByProject(projectId: string): Promise<Meeting[]>;
}

export interface IActivityRepository extends IBaseRepository<Activity> {
  getByProject(projectId: string, limit?: number): Promise<Activity[]>;
  getRecent(limit?: number): Promise<Activity[]>;
}

export interface INotificationRepository extends IBaseRepository<Notification> {
  getByUser(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

export interface IRiskRepository extends IBaseRepository<Risk> {
  getByProject(projectId: string): Promise<Risk[]>;
}

export interface IUserRepository extends IBaseRepository<User> {
  getByEmail(email: string): Promise<User | undefined>;
  getByRole(role: string): Promise<User[]>;
}

export interface IResearchMetricRepository extends IBaseRepository<ResearchMetric> {
  getRecent(limit?: number): Promise<ResearchMetric[]>;
}
