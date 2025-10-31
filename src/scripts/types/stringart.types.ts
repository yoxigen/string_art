import { ColorValue } from '../helpers/color/color.types';
import type { Coordinates, Dimensions } from './general.types';

export type RendererType = 'canvas' | 'svg';

export interface Nail {
  point: Coordinates;
  number: string | number;
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
