export interface SortOrder {
  column: string;
  direction: string;
}

export interface QueryOptions {
  where: any[];
  order: SortOrder;
  skip: number;
  take: number;
  run: boolean;
}
