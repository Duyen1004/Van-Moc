export type EngravingPosition = "front" | "back" | "side";

export type Personalization = {
  productId: string;
  message: string;
  font: string;
  position: EngravingPosition;
};
