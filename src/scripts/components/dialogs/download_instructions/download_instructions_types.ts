import { Dimensions, LengthUnit } from '../../../types/general.types';

export interface DownloadInstructionsOptions {
  size: Dimensions;
  margin: number;
  type: 'txt' | 'json';
  includeNailPositions: boolean;
  includeInstructions: boolean;
  colorFormat: 'rgb' | 'hsl' | 'hex';
  filename?: string;
  units?: LengthUnit;
}
