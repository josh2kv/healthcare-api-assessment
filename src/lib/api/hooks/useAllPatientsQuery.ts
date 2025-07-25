import { useQuery } from '@tanstack/react-query';
import { fetchAllPatients } from '../patients';

export function useAllPatientsQuery() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: fetchAllPatients,
  });
}
