export type TraceStep = {
  title: string;
  description: string;
  completedAt?: string;
};

export type TraceRecord = {
  code: string;
  productId: string;
  steps: TraceStep[];
};
