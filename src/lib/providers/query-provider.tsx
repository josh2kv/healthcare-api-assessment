import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';

function getErrorStatus(error: unknown): number | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'status' in error.response &&
    typeof (error.response as { status: unknown }).status === 'number'
  ) {
    return (error.response as { status: number }).status;
  }
  return undefined;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              const status = getErrorStatus(error);
              // Don't retry for client errors (4xx) except 429 (rate limit)
              if (status && status >= 400 && status < 500 && status !== 429) {
                return false;
              }
              // Retry up to 3 times for network/server errors and rate limits
              return failureCount < 3;
            },
            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: (failureCount, error) => {
              const status = getErrorStatus(error);
              // Only retry for rate limits and server errors
              if (
                status &&
                (status === 429 || (status >= 500 && status < 600))
              ) {
                return failureCount < 2;
              }
              return false;
            },
            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
