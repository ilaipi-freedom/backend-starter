import { BaseQuery } from "src/types/BaseQuery";

export const pageOptions = (query: BaseQuery) => {
  if (query.isAll) return {} as any;
  return {
    take: Number(query.pageSize),
    skip: (query.page - 1) * query.pageSize,
  };
};
