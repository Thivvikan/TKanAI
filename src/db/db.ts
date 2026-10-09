import Dexie, { Table } from 'dexie';
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

export class AIEcosystemDatabase extends Dexie {
  organizations!: Table<Organization, string>;
  users!: Table<User, string>;
  teams!: Table<Team, string>;
  projects!: Table<Project, string>;
  requirements!: Table<Requirement, string>;
  epics!: Table<Epic, string>;
  userStories!: Table<UserStory, string>;
  tasks!: Table<Task, string>;
  sprints!: Table<Sprint, string>;
  issues!: Table<Issue, string>;
  testCases!: Table<TestCase, string>;
  documents!: Table<Document, string>;
  documentVersions!: Table<DocumentVersion, string>;
  changeRequests!: Table<ChangeRequest, string>;
  meetings!: Table<Meeting, string>;
  comments!: Table<Comment, string>;
  activities!: Table<Activity, string>;
  notifications!: Table<Notification, string>;
  risks!: Table<Risk, string>;
  researchMetrics!: Table<ResearchMetric, string>;

  constructor() {
    super('AI_Ecosystem_ResearchDB');
    this.version(1).stores({
      organizations: 'id, name',
      users: 'id, email, role, teamId',
      teams: 'id, name',
      projects: 'id, key, status, clientUserId, pmId, poId',
      requirements: 'id, key, projectId, type, priority, status, epicId',
      epics: 'id, key, projectId, status',
      userStories: 'id, key, requirementId, epicId, projectId, sprintId, status, assigneeId',
      tasks: 'id, key, projectId, sprintId, storyId, epicId, requirementId, status, assigneeId, type',
      sprints: 'id, projectId, status',
      issues: 'id, key, projectId, requirementId, taskId, severity, status, assigneeId',
      testCases: 'id, key, projectId, requirementId, status',
      documents: 'id, key, projectId, category, status, version',
      documentVersions: 'id, documentId, version, timestamp',
      changeRequests: 'id, key, projectId, clientUserId, status',
      meetings: 'id, projectId, date',
      comments: 'id, projectId, entityType, entityId',
      activities: 'id, projectId, timestamp, actionType',
      notifications: 'id, recipientUserId, read, timestamp',
      risks: 'id, projectId, severity, score, status',
      researchMetrics: 'id, timestamp, metricType',
    });
  }
}

export const db = new AIEcosystemDatabase();
