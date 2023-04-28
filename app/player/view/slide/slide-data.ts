export type SlideType =
  | "CUP"
  | "Circle"
  | "U"
  | "L"
  | "Thunder"
  | "V"
  | "Straight";

export interface SlideData {
  type: SlideType;
  destinationDifference: number;
}
