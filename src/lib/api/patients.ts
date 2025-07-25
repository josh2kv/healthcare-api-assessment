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

export async function fetchAllPatients(): Promise<Patient[]> {
  const firstPage = await fetchPatientsPage(1, 20);
  const totalPages = firstPage.pagination.totalPages;

  if (totalPages === 1) {
    return firstPage.data;
  }

  // Fetch remaining pages in parallel
  const remainingPages = Array.from(
    { length: totalPages - 1 },
    (_, i) => i + 2,
  );
  const pagePromises = remainingPages.map(page => fetchPatientsPage(page, 20));
  const otherPages = await Promise.all(pagePromises);

  return [...firstPage.data, ...otherPages.flatMap(page => page.data)];
}

export { fetchPatientsPage };
