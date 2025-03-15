import { BaseQuery } from 'src/types/BaseQuery';

export const pageOptions = (
  query: BaseQuery,
): { take?: number; skip?: number } => {
  if (query.isAll) return {};
  return {
    take: Number(query.pageSize),
    skip: (query.page - 1) * query.pageSize,
  };
};
