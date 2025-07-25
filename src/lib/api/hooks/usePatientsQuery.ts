import { useQuery } from '@tanstack/react-query';
import { fetchAllPatients } from '@/lib/api/patients';

export function usePatientsQuery() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchAllPatients,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
}
