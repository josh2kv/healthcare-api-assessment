export interface ResPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ResMetadata {
  [key: string]: unknown;
}

export interface ResWithPagination<T> {
  data: T[];
  pagination: ResPagination;
  metadata: ResMetadata;
}
