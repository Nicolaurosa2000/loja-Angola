import { PaginationMeta, PaginationParams } from '../interfaces';

export function getPaginationParams(query: PaginationParams): Required<PaginationParams> {
  return {
    page: Math.max(1, query.page || 1),
    limit: Math.min(100, Math.max(1, query.limit || 10)),
    sortBy: query.sortBy || 'createdAt',
    sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
  };
}

export function getPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function getPrismaPagination(page: number, limit: number): { skip: number; take: number } {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
