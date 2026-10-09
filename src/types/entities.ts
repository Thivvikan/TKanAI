import { UserRole } from './roles';

// ==========================================
// ORGANIZATION & USERS
// ==========================================
export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  industry: string;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    allowClientDirectStories: boolean;
    requirePOApprovalForTasks: boolean;
    autoTriggerAIRiskAnalysis: boolean;
    defaultSprintDurationWeeks: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  title: string;
  teamId?: string;
  active: boolean;
  department?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadId: string;
  memberIds: string[];
  createdAt: string;
}

// ==========================================
// PROJECT ENTITIES
// ==========================================
export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ProjectType = 'Web Application' | 'Mobile App' | 'Enterprise SaaS' | 'API / Cloud Microservices' | 'AI / Data Platform';

export interface Project {
  id: string;
  key: string; // e.g. "ZYR"
  name: string;
  description: string;
  type: ProjectType;
  clientUserId: string;
  pmId: string;
  poId: string;
  startDate: string;
  expectedEndDate: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  technologyStack: string[];
  tags: string[];
  healthScore: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// REQUIREMENTS MANAGEMENT
// ==========================================
export type RequirementType =
  | 'Functional'
  | 'Non-Functional'
  | 'Business'
  | 'Technical'
  | 'Security'
  | 'Performance'
  | 'UI/UX';

export type RequirementStatus =
  | 'Draft'
  | 'Under Review'
  | 'AI Analysis'
  | 'Client Review'
  | 'Approved'
  | 'Rejected'
  | 'Implemented'
  | 'Verified'
  | 'Archived';

export type RequirementPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIAmbiguityFeedback {
  score: number; // 0 - 100 (100 = crystal clear)
  ambiguityDetected: boolean;
  issues: string[];
  missingActors: string[];
  missingConstraints: string[];
  suggestedText: string;
  priorityRecommendation: RequirementPriority;
  recommendedType: RequirementType;
  potentialConflicts: string[];
  potentialRisks: string[];
  analyzedAt: string;
}

export interface Requirement {
  id: string;
  key: string; // e.g. "REQ-001"
  projectId: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: RequirementPriority;
  status: RequirementStatus;
  source: 'Client Request' | 'Business Goal' | 'Regulatory' | 'Technical Architecture' | 'Internal Discovery';
  reporterId: string;
  ownerId: string;
  acceptanceCriteria: string[];
  dependencies: string[]; // array of requirement keys
  relatedRequirementIds: string[];
  relatedTaskIds: string[];
  relatedDocumentIds: string[];
  epicId?: string;
  version: number;
  aiAnalysis?: AIAmbiguityFeedback;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// AGILE & EPICS / STORIES / TASKS
// ==========================================
export type EpicStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';

export interface Epic {
  id: string;
  key: string; // e.g. "EPIC-01"
  projectId: string;
  name: string;
  description: string;
  ownerId: string;
  priority: RequirementPriority;
  status: EpicStatus;
  startDate: string;
  targetDate: string;
  progress: number; // 0 - 100
  color: string;
  createdAt: string;
}

export type StoryStatus = 'Backlog' | 'Ready' | 'In Sprint' | 'In Review' | 'Done';

export interface UserStory {
  id: string;
  key: string; // e.g. "US-101"
  projectId: string;
  requirementId?: string;
  epicId: string;
  sprintId?: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  description?: string;
  acceptanceCriteria: string[];
  priority: RequirementPriority;
  storyPoints: number;
  assigneeId?: string;
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
}

export type TaskType =
  | 'Development'
  | 'Testing'
  | 'Design'
  | 'Documentation'
  | 'Research'
  | 'DevOps'
  | 'Bug'
  | 'Meeting'
  | 'Other';

export type TaskStatus =
  | 'Backlog'
  | 'To Do'
  | 'In Progress'
  | 'Code Review'
  | 'QA'
  | 'Client Review'
  | 'Done';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
}

export interface Task {
  id: string;
  key: string; // e.g. "TASK-124"
  projectId: string;
  sprintId?: string;
  storyId?: string;
  epicId?: string;
  requirementId?: string;
  title: string;
  description: string;
  type: TaskType;
  priority: RequirementPriority;
  status: TaskStatus;
  assigneeId: string;
  reporterId: string;
  estimatedHours: number;
  actualHours: number;
  startDate?: string;
  dueDate: string;
  labels: string[];
  dependencies: string[]; // Task IDs
  attachments: Attachment[];
  commentsCount: number;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// SPRINTS
// ==========================================
export type SprintStatus = 'Planned' | 'Active' | 'Completed' | 'Cancelled';

export interface Sprint {
  id: string;
  projectId: string;
  name: string; // "Sprint 01 - Seat Selection & Booking"
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocity: number;
  committedPoints: number;
  completedPoints: number;
  createdAt: string;
}

// ==========================================
// ISSUES & BUGS
// ==========================================
export type IssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IssueStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Fixed'
  | 'Retest'
  | 'Verified'
  | 'Closed';

export interface AIBugIntelligence {
  category: string;
  suggestedSeverity: IssueSeverity;
  suggestedPriority: RequirementPriority;
  possibleRootCause: string;
  affectedComponent: string;
  recommendedFix: string;
  potentialDuplicates: string[];
}

export interface Issue {
  id: string;
  key: string; // e.g. "BUG-042"
  projectId: string;
  title: string;
  description: string;
  type: 'Bug' | 'Defect' | 'Regression' | 'Security Vulnerability';
  severity: IssueSeverity;
  priority: RequirementPriority;
  status: IssueStatus;
  reporterId: string;
  assigneeId?: string;
  environment: 'Development' | 'Staging' | 'UAT' | 'Production';
  stepsToReproduce: string[];
  expectedResult: string;
  actualResult: string;
  relatedRequirementId?: string;
  relatedTaskId?: string;
  aiIntelligence?: AIBugIntelligence;
  createdAt: string;
  resolvedAt?: string;
  updatedAt: string;
}

// ==========================================
// TEST CASES & QA LAB
// ==========================================
export type TestCaseStatus = 'Draft' | 'Ready' | 'Passed' | 'Failed' | 'Blocked';

export interface TestCase {
  id: string;
  key: string; // e.g. "TC-018"
  projectId: string;
  requirementId?: string;
  storyId?: string;
  title: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  status: TestCaseStatus;
  lastExecutedAt?: string;
  lastExecutedBy?: string;
  createdAt: string;
}

// ==========================================
// DOCUMENTATION HUB & VERSIONING
// ==========================================
export type DocumentCategory =
  | 'Project Charter'
  | 'BRD'
  | 'SRS'
  | 'Functional Requirements'
  | 'Non-Functional Requirements'
  | 'System Architecture'
  | 'Database Design'
  | 'API Documentation'
  | 'UI/UX Documentation'
  | 'Test Plan'
  | 'Deployment Guide'
  | 'Technical Documentation'
  | 'User Manual'
  | 'Meeting Minutes'
  | 'Release Notes';

export type DocumentStatus =
  | 'Draft'
  | 'Under Review'
  | 'AI Validated'
  | 'PM Review'
  | 'Client Review'
  | 'Approved'
  | 'Published'
  | 'Archived';

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string; // e.g. "v1.0", "v1.1"
  authorId: string;
  timestamp: string;
  changeReason: string;
  changeSummary: string;
  contentMarkdown: string;
  approved: boolean;
}

export interface Document {
  id: string;
  key: string; // e.g. "DOC-SRS-01"
  projectId: string;
  title: string;
  category: DocumentCategory;
  description: string;
  authorId: string;
  ownerId: string;
  version: string; // "v1.2"
  status: DocumentStatus;
  contentMarkdown: string;
  linkedRequirementIds: string[];
  linkedTaskIds: string[];
  linkedIssueIds: string[];
  healthScore: number; // 0 - 100
  aiAuditNotes?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

// ==========================================
// CLIENT PORTAL & CHANGE REQUESTS
// ==========================================
export type ChangeRequestStatus =
  | 'Submitted'
  | 'AI Impact Analyzed'
  | 'Under PM Review'
  | 'Approved'
  | 'Rejected'
  | 'Implemented';

export interface AIChangeImpact {
  affectedRequirementsCount: number;
  affectedRequirementKeys: string[];
  affectedStoriesCount: number;
  affectedStoryKeys: string[];
  affectedTasksCount: number;
  affectedTaskKeys: string[];
  affectedDocumentsCount: number;
  affectedDocumentKeys: string[];
  estimatedEffortHours: number;
  scheduleImpactDays: number;
  overallRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summaryRationale: string;
  recommendedAction: string;
}

export interface ChangeRequest {
  id: string;
  key: string; // e.g. "CR-007"
  projectId: string;
  clientUserId: string;
  title: string;
  description: string;
  reason: string;
  priority: RequirementPriority;
  status: ChangeRequestStatus;
  aiImpactAnalysis?: AIChangeImpact;
  pmDecisionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// MEETINGS & AI ACTION EXTRACTION
// ==========================================
export interface AIMeetingDecision {
  decision: string;
  context: string;
}

export interface AIMeetingActionItem {
  action: string;
  assigneeRole: UserRole;
  suggestedTaskType: TaskType;
  targetArtifact: string;
}

export interface Meeting {
  id: string;
  projectId: string;
  title: string;
  date: string;
  time: string;
  attendees: string[]; // User IDs
  agenda: string[];
  notesMarkdown: string;
  aiSummary?: string;
  aiDecisions: AIMeetingDecision[];
  aiActionItems: AIMeetingActionItem[];
  createdAt: string;
}

// ==========================================
// RISK INTELLIGENCE & ADVISORY
// ==========================================
export type RiskCategory =
  | 'Schedule'
  | 'Technical'
  | 'Requirement'
  | 'Resource'
  | 'Quality'
  | 'Documentation';

export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  category: RiskCategory;
  severity: RiskSeverity;
  probability: number; // 0 - 100%
  score: number; // 0 - 100 (severity * probability)
  status: 'Open' | 'Mitigating' | 'Accepted' | 'Resolved';
  reason: string;
  aiRecommendation: string;
  mitigationPlan?: string;
  affectedEntityKey?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// COLLABORATION, NOTIFICATIONS & AUDIT
// ==========================================
export interface Comment {
  id: string;
  projectId: string;
  entityType: 'Requirement' | 'Task' | 'Issue' | 'Document' | 'ChangeRequest';
  entityId: string;
  userId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar: string;
  content: string;
  isClientVisible: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actionType: string;
  entityType: string;
  entityId: string;
  entityKey: string;
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  link?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  read: boolean;
  timestamp: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// ==========================================
// RESEARCH METRICS & TELEMETRY
// ==========================================
export interface ResearchMetric {
  id: string;
  timestamp: string;
  metricType:
    | 'REQUIREMENT_ANALYZED'
    | 'USER_STORY_GENERATED'
    | 'TASK_DECOMPOSED'
    | 'BUG_DIAGNOSED'
    | 'CHANGE_IMPACT_CALCULATED'
    | 'DOC_HEALTH_AUDITED'
    | 'RECOMMENDATION_ACCEPTED'
    | 'RECOMMENDATION_REJECTED';
  durationMs: number;
  entityKey?: string;
  metricsPayload: Record<string, any>;
}
