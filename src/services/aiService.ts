import { AIEngine } from './ai/aiEngine';
import {
  Requirement,
  UserStory,
  Task,
  Issue,
  ChangeRequest,
  AIAmbiguityFeedback,
  AIBugIntelligence,
  AIChangeImpact,
  AIMeetingDecision,
  AIMeetingActionItem,
} from '../types/entities';
import { researchMetricService } from './researchMetricService';

export class AIService {
  async analyzeRequirement(req: Requirement): Promise<AIAmbiguityFeedback> {
    const startTime = performance.now();
    // Simulate brief AI inference latency (200-400ms) for realism
    await new Promise((r) => setTimeout(r, 250));
    const result = AIEngine.analyzeRequirement(req);
    const duration = Math.round(performance.now() - startTime);

    await researchMetricService.recordMetric('REQUIREMENT_ANALYZED', duration, {
      requirementKey: req.key,
      ambiguityDetected: result.ambiguityDetected,
      score: result.score,
    }, req.key);

    return result;
  }

  async generateUserStory(req: Requirement): Promise<Partial<UserStory>> {
    const startTime = performance.now();
    await new Promise((r) => setTimeout(r, 200));
    const result = AIEngine.generateUserStory(req);
    const duration = Math.round(performance.now() - startTime);

    await researchMetricService.recordMetric('USER_STORY_GENERATED', duration, {
      requirementKey: req.key,
      points: result.storyPoints,
    }, req.key);

    return result;
  }

  async decomposeStoryIntoTasks(story: UserStory): Promise<Partial<Task>[]> {
    const startTime = performance.now();
    await new Promise((r) => setTimeout(r, 200));
    const result = AIEngine.decomposeStoryIntoTasks(story);
    const duration = Math.round(performance.now() - startTime);

    await researchMetricService.recordMetric('TASK_DECOMPOSED', duration, {
      storyKey: story.key,
      generatedTaskCount: result.length,
    }, story.key);

    return result;
  }

  async diagnoseBug(title: string, description: string, bugKey?: string): Promise<AIBugIntelligence> {
    const startTime = performance.now();
    await new Promise((r) => setTimeout(r, 220));
    const result = AIEngine.diagnoseBug(title, description);
    const duration = Math.round(performance.now() - startTime);

    await researchMetricService.recordMetric('BUG_DIAGNOSED', duration, {
      category: result.category,
      severity: result.suggestedSeverity,
    }, bugKey);

    return result;
  }

  async analyzeChangeImpact(
    cr: Partial<ChangeRequest>,
    context: { requirements: Requirement[]; stories: UserStory[]; tasks: Task[]; documents: any[] }
  ): Promise<AIChangeImpact> {
    const startTime = performance.now();
    await new Promise((r) => setTimeout(r, 350));
    const result = AIEngine.analyzeChangeImpact(cr, context);
    const duration = Math.round(performance.now() - startTime);

    await researchMetricService.recordMetric('CHANGE_IMPACT_CALCULATED', duration, {
      crKey: cr.key,
      affectedReqs: result.affectedRequirementsCount,
      effortHours: result.estimatedEffortHours,
      risk: result.overallRiskLevel,
    }, cr.key);

    return result;
  }

  async extractMeetingDecisions(notes: string): Promise<{ summary: string; decisions: AIMeetingDecision[]; actionItems: AIMeetingActionItem[] }> {
    await new Promise((r) => setTimeout(r, 250));
    return AIEngine.extractMeetingDecisionsAndActions(notes);
  }

  async askProjectAssistant(prompt: string, projectData: {
    projectName: string;
    requirements: Requirement[];
    tasks: Task[];
    bugs: Issue[];
    risks: any[];
    sprints: any[];
  }): Promise<string> {
    await new Promise((r) => setTimeout(r, 300));
    const q = prompt.toLowerCase();

    if (q.includes('delayed') || q.includes('overdue')) {
      const delayed = projectData.tasks.filter((t) => t.status !== 'Done' && new Date(t.dueDate) < new Date());
      if (delayed.length === 0) {
        return `All active tasks in **${projectData.projectName}** are currently tracking on schedule with no overdue items.`;
      }
      return `There are **${delayed.length} delayed tasks** in **${projectData.projectName}**:\n` +
        delayed.map((t) => `- **${t.key}**: *${t.title}* (Due: ${t.dueDate}, Status: ${t.status}, Assigned: ${t.assigneeId})`).join('\n') +
        `\n\n**AI Recommendation:** Prioritize resolving blockers on these items or consider reassigning to available team members.`;
    }

    if (q.includes('risk') || q.includes('highest risk')) {
      return `**AI Project Risk Assessment for ${projectData.projectName}:**\n` +
        `- **Critical Technical Risk:** Concurrency race condition on seat locks (BUG-001) under simulated high traffic.\n` +
        `- **High Schedule Pressure:** Developer Kajakaran is handling 3 high-priority sprint items (32h remaining).\n` +
        `- **Mitigation Advice:** Verify Lua script deployment in TASK-101 and pair DevOps on Redis tuning.`;
    }

    if (q.includes('status') || q.includes('current status') || q.includes('overview')) {
      const doneTasks = projectData.tasks.filter((t) => t.status === 'Done').length;
      const totalTasks = projectData.tasks.length;
      const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
      const openBugs = projectData.bugs.filter((b) => b.status !== 'Closed').length;

      return `### Project 360 Status: **${projectData.projectName}**\n` +
        `- **Progress:** ${percent}% completed (${doneTasks}/${totalTasks} tasks)\n` +
        `- **Active Sprint:** Sprint 02 – Real-time Locking & Payment Flow (Ends Feb 16)\n` +
        `- **Open Defects:** ${openBugs} issues (${projectData.bugs.filter((b) => b.severity === 'Critical').length} Critical)\n` +
        `- **Requirements:** ${projectData.requirements.length} approved/under review specifications\n` +
        `- **Overall Health:** **88/100 (Good)** with minor concurrency risk mitigation in progress.`;
    }

    if (q.includes('workload') || q.includes('developer')) {
      return `**Team Workload Distribution:**\n` +
        `- **Kajakaran (Dev):** 4 active tasks (32h load) — *High allocation*\n` +
        `- **Hariarthan (QA):** 2 test suites & bug verification (16h load) — *Normal*\n` +
        `- **Sarangn (Design):** Design system updates (Completed) — *Available*\n` +
        `- **Karikaalan (DevOps):** DB indexing completed — *Available for support*`;
    }

    return `Based on the latest project telemetry for **${projectData.projectName}**: The project is active in Sprint 02 with 8 requirements, ${projectData.tasks.length} tasks, and ${projectData.bugs.length} tracked issues. Let me know if you would like me to analyze requirement ambiguity, generate test cases, or inspect sprint burndown.`;
  }
}

export const aiService = new AIService();
