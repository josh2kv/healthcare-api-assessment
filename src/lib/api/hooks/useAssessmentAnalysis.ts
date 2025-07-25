import { useAllPatientsQuery } from './useAllPatientsQuery';
import {
  generateAlertLists,
  calculateTotalRiskScore,
} from '@/lib/risk-scoring';
import type { AlertLists } from '@/types/patients';

export interface AssessmentAnalysis extends AlertLists {
  totalPatients: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number; // 0-2
    medium: number; // 3
    high: number; // 4+
  };
}

export function useAssessmentAnalysis() {
  const queryResult = useAllPatientsQuery();
  const { data: patients, isLoading, error, isError } = queryResult;

  const analysis = (): AssessmentAnalysis | null => {
    if (!patients || patients.length === 0) return null;

    // Filter out any undefined/null patients from failed requests
    const validPatients = patients.filter(patient => patient != null);

    if (validPatients.length === 0) return null;

    // Generate alert lists using risk scoring logic
    const alertLists = generateAlertLists(validPatients);

    // Calculate additional analytics
    const riskScores = validPatients.map(calculateTotalRiskScore);
    const totalRisk = riskScores.reduce((sum, score) => sum + score, 0);
    const averageRiskScore = totalRisk / validPatients.length;

    // Risk distribution
    const riskDistribution = {
      low: riskScores.filter(score => score <= 2).length,
      medium: riskScores.filter(score => score === 3).length,
      high: riskScores.filter(score => score >= 4).length,
    };

    return {
      ...alertLists,
      totalPatients: validPatients.length,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      riskDistribution,
    };
  };

  return {
    analysis: analysis(),
    isLoading,
    error,
    isError,
    // Pass through all the query metadata
    totalPages: queryResult.totalPages,
    expectedTotal: queryResult.expectedTotal,
    actualTotal: queryResult.actualTotal,
    isComplete: queryResult.isComplete,
    successfulPages: queryResult.successfulPages,
    isLoadingAdditionalPages: queryResult.isLoadingAdditionalPages,
    completionPercentage: queryResult.completionPercentage,
  };
}
