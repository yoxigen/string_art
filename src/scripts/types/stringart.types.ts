import { ColorValue } from '../helpers/color/color.types';
import type { Coordinates } from './general.types';

export interface Nail {
  point: Coordinates;
  number: string | number;
}

export interface NailsRenderOptions {
  color: ColorValue;
  fontSize: number;
  radius: number;
  renderNumbers?: boolean;
  margin?: number;
}
