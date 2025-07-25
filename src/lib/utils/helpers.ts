// Helper function to add delay between requests
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get error status from unknown error type
export function getErrorStatus(error: unknown): number | undefined {
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

// Helper function to get retry_after from 429 response
export function getRetryAfter(error: unknown): number | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'retry_after' in error.response.data &&
    typeof (error.response.data as { retry_after: unknown }).retry_after ===
      'number'
  ) {
    return (error.response.data as { retry_after: number }).retry_after;
  }
  return undefined;
}
