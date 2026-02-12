import { ColorValue } from '../helpers/color/color.types';
import type { Coordinates, Dimensions } from './general.types';

export type RendererType = 'canvas' | 'svg';

export type NailKey = number;
export type NailGroupKey = string | number | null;

export interface Nail {
  point: Coordinates;
  number: NailKey;
}

export interface NailOptions {
  color: ColorValue;
  radius: number;
}

export interface NailsRenderOptions extends NailOptions {
  fontSize: number;
  renderNumbers?: boolean;
  margin?: number;
  numbersStart?: number;
}

export type ID = string;

export interface CalcOptions {
  size: Dimensions;
}
