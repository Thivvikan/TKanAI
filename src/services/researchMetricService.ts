import { researchMetricRepository } from '../repositories/dexie/dexieRepositories';
import { ResearchMetric } from '../types/entities';

export class ResearchMetricService {
  async recordMetric(
    metricType: ResearchMetric['metricType'],
    durationMs: number,
    details: Record<string, any>,
    entityKey?: string
  ): Promise<void> {
    const metric: ResearchMetric = {
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      metricType,
      durationMs,
      entityKey,
      metricsPayload: details,
    };
    await researchMetricRepository.create(metric);
  }

  async getRecentMetrics(limit = 50): Promise<ResearchMetric[]> {
    return researchMetricRepository.getRecent(limit);
  }

  async getSummaryStats(): Promise<{
    totalEvaluations: number;
    avgAnalysisTimeMs: number;
    detectedAmbiguities: number;
    acceptanceRate: number;
  }> {
    const all = await researchMetricRepository.getAll();
    const total = all.length;
    if (total === 0) {
      return { totalEvaluations: 0, avgAnalysisTimeMs: 0, detectedAmbiguities: 0, acceptanceRate: 0 };
    }

    const avgTime = all.reduce((sum, m) => sum + (m.durationMs || 0), 0) / total;
    const ambiguities = all.filter((m) => m.metricType === 'REQUIREMENT_ANALYZED' && m.metricsPayload?.ambiguityDetected).length;
    const accepted = all.filter((m) => m.metricType === 'RECOMMENDATION_ACCEPTED').length;
    const rejected = all.filter((m) => m.metricType === 'RECOMMENDATION_REJECTED').length;
    const decisionsCount = accepted + rejected;
    const acceptanceRate = decisionsCount > 0 ? (accepted / decisionsCount) * 100 : 92;

    return {
      totalEvaluations: total,
      avgAnalysisTimeMs: Math.round(avgTime),
      detectedAmbiguities: ambiguities,
      acceptanceRate: Math.round(acceptanceRate),
    };
  }
}

export const researchMetricService = new ResearchMetricService();
