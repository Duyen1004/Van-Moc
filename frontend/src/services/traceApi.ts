import { api } from "@/lib/api";
import type { TraceRecord } from "@/types/trace";

export async function getTraceByCode(code: string) {
  const { data } = await api.get<TraceRecord>(`/trace/${code}`);
  return data;
}
