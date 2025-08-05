import { GroupValue } from '../../types/config.types';

export interface ColorConfig {
  color: ColorValue;
  multicolorRange: number;
  colorCount: number;
  multicolorByLightness: boolean;
  minLightness: number;
  maxLightness: number;
  multicolorStart: number;
  darkMode: boolean;
  saturation: number;
  reverseColors: boolean;
  repeatColors: boolean;
  mirrorColors: boolean;
  isMultiColor: boolean;
  colorGroup: GroupValue;
}

export type ColorValue = string;
