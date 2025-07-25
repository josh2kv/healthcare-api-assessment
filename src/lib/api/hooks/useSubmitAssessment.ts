import { useMutation } from '@tanstack/react-query';
import { submitAssessment, type SubmissionResponse } from '../assessment';
import type { AlertLists } from '@/types/patients';

export function useSubmitAssessment() {
  return useMutation<SubmissionResponse, Error, AlertLists>({
    mutationFn: async alertLists => {
      const response = await submitAssessment(alertLists);

      // Log the full response for debugging
      console.log(
        '🚀 Full Submission Response:',
        JSON.stringify(response, null, 2),
      );

      return response;
    },
    retry: (failureCount, error) => {
      // Don't retry client errors (4xx), but retry server errors up to 2 times
      const status =
        error &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'status' in error.response &&
        typeof (error.response as { status: unknown }).status === 'number'
          ? (error.response as { status: number }).status
          : undefined;

      if (status && status >= 400 && status < 500) {
        return false; // Don't retry client errors
      }

      return failureCount < 2; // Retry server errors up to 2 times
    },
    retryDelay: attemptIndex => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 4000);
    },
  });
}
