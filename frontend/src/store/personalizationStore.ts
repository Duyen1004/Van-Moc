import type { Personalization } from "@/types/personalization";

export type PersonalizationState = {
  items: Personalization[];
};

export const initialPersonalizationState: PersonalizationState = {
  items: [],
};

export function upsertPersonalization(
  state: PersonalizationState,
  personalization: Personalization,
): PersonalizationState {
  const items = state.items.filter((item) => item.productId !== personalization.productId);

  return {
    ...state,
    items: [...items, personalization],
  };
}
