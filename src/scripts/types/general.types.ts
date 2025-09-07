export type Dimensions = [number, number];
export type Coordinates = [number, number];
export type LengthUnit = 'cm' | 'inch';
export type SizeUnit = LengthUnit | 'px';
export interface BoundingRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}
