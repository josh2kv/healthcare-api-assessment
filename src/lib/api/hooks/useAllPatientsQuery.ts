import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchPatientsPage } from '../patients';
import type { Patient } from '@/types/patients';
import { delay, getErrorStatus, getRetryAfter } from '@/lib/utils/helpers';

export function useAllPatientsQuery() {
  // First, get the first page to determine total pages and total patients
  const firstPageQuery = useQuery({
    queryKey: ['patients', 'page', 1],
    queryFn: () => fetchPatientsPage(1, 20),
    retry: (failureCount: number, error: unknown) => {
      const status = getErrorStatus(error);
      // For 429 (rate limit), keep retrying indefinitely
      if (status === 429) {
        return true;
      }
      // For 500+ server errors, retry exactly 3 times
      if (status && status >= 500) {
        return failureCount < 3;
      }
      return false; // Don't retry for other errors (4xx client errors, etc.)
    },
    retryDelay: (attemptIndex: number, error: unknown) => {
      const status = getErrorStatus(error);
      // For 429 rate limit, use server's retry_after if available
      if (status === 429) {
        const retryAfter = getRetryAfter(error);
        if (retryAfter) {
          // Convert seconds to milliseconds and add small buffer
          return retryAfter * 1000 + 500;
        }
        // Fallback if no retry_after provided
        return Math.min(5000 + attemptIndex * 2000, 30000); // 5s, 7s, 9s, ... up to 30s
      }
      // For 500+ errors, use exactly 3 seconds
      if (status && status >= 500) {
        return 3000; // Always 3 seconds for server errors
      }
      // Fallback (shouldn't be used)
      return 1000;
    },
  });

  const totalPages = firstPageQuery.data?.pagination.totalPages || 1;
  const expectedTotal = firstPageQuery.data?.pagination.total || 0;

  // Create queries for remaining pages with persistent retries and staggered delays
  const remainingPageQueries = useQueries({
    queries: Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      queryKey: ['patients', 'page', i + 2],
      queryFn: async () => {
        await delay(1000);
        return fetchPatientsPage(i + 2, 20);
      },
      enabled: !!firstPageQuery.data && totalPages > 1, // Only run after first page loads
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount: number, error: unknown) => {
        const status = getErrorStatus(error);
        // For 429 (rate limit), keep retrying indefinitely
        if (status === 429) {
          return true;
        }
        // For 500+ server errors, retry exactly 3 times
        if (status && status >= 500) {
          return failureCount < 3;
        }
        return false; // Don't retry for other errors
      },
      retryDelay: (attemptIndex: number, error: unknown) => {
        const status = getErrorStatus(error);
        // For 429 rate limit, use server's retry_after if available
        if (status === 429) {
          const retryAfter = getRetryAfter(error);
          if (retryAfter) {
            // Convert seconds to milliseconds and add small buffer
            return retryAfter * 1000 + 500;
          }
          // Fallback if no retry_after provided
          return Math.min(5000 + attemptIndex * 3000, 30000); // 5s, 8s, 11s, ... up to 30s
        }
        // For 500+ errors, use exactly 3 seconds
        if (status && status >= 500) {
          return 3000; // Always 3 seconds for server errors
        }
        // Fallback (shouldn't be used)
        return 1000;
      },
    })),
  });

  // Count how many patients we actually have
  const allPatients: Patient[] = [];

  if (firstPageQuery.data?.data) {
    allPatients.push(...firstPageQuery.data.data);
  }

  remainingPageQueries.forEach(query => {
    if (query.data?.data) {
      allPatients.push(...query.data.data);
    }
  });

  // Calculate progress
  const actualTotal = allPatients.length;
  const isComplete = expectedTotal > 0 && actualTotal >= expectedTotal;
  const successfulPages =
    (firstPageQuery.data ? 1 : 0) +
    remainingPageQueries.filter(q => q.data?.data).length;

  // Only show loading for first page, or if we haven't collected all patients yet
  const isLoading =
    firstPageQuery.isLoading ||
    (!isComplete && remainingPageQueries.some(q => q.isLoading));

  // Only show error if first page fails completely
  const isError = firstPageQuery.isError;
  const error = firstPageQuery.error;

  return {
    data: allPatients.length > 0 ? allPatients : undefined,
    isLoading,
    isError,
    error,
    // Enhanced metadata about collection progress
    totalPages,
    expectedTotal,
    actualTotal,
    isComplete,
    successfulPages,
    isLoadingAdditionalPages:
      !isComplete && remainingPageQueries.some(q => q.isLoading),
    completionPercentage:
      expectedTotal > 0 ? Math.round((actualTotal / expectedTotal) * 100) : 0,
  };
}
