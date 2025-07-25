import type { Patient } from '@/types/patients';
import { api } from './api';
import type { ResWithPagination } from '@/types/common';

async function fetchPatientsPage(
  page = 1,
  limit = 20,
): Promise<ResWithPagination<Patient>> {
  const response = await api.get<ResWithPagination<Patient>>(`/patients`, {
    params: { page, limit },
  });
  return response.data;
}

export async function fetchAllPatients(options?: {
  throttled?: boolean;
  delayMs?: number;
}): Promise<Patient[]> {
  const { throttled = false, delayMs = 1000 } = options || {};

  const firstPage = await fetchPatientsPage(1, 20);
  const totalPages = firstPage.pagination.totalPages;

  if (totalPages === 1) {
    return firstPage.data;
  }

  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, i) => i + 2,
  );

  let otherPages: ResWithPagination<Patient>[];

  if (throttled) {
    // Fetch pages sequentially with delay to avoid rate limiting
    otherPages = [];
    for (const page of remainingPages) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      try {
        const pageData = await fetchPatientsPage(page, 20);
        otherPages.push(pageData);
      } catch (error) {
        console.warn(`Failed to fetch page ${page}:`, error);
        // Continue with other pages
      }
    }
  } else {
    // Fetch remaining pages in parallel, handling partial failures gracefully
    const pagePromises = remainingPages.map(page =>
      fetchPatientsPage(page, 20),
    );
    const results = await Promise.allSettled(pagePromises);

    // Extract successful results, log failures
    otherPages = results
      .filter(
        (
          result,
        ): result is PromiseFulfilledResult<ResWithPagination<Patient>> => {
          if (result.status === 'rejected') {
            console.warn('Failed to fetch page:', result.reason);
            return false;
          }
          return true;
        },
      )
      .map(result => result.value);
  }

  return [...firstPage.data, ...otherPages.flatMap(page => page.data)];
}

export { fetchPatientsPage };
