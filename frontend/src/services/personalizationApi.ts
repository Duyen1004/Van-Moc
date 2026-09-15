import { api } from "@/lib/api";
import type { Personalization } from "@/types/personalization";

export async function savePersonalization(payload: Personalization) {
  const { data } = await api.post<Personalization>("/personalizations", payload);
  return data;
}
