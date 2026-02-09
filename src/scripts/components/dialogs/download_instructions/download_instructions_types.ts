import { ColorFormat } from '../../../helpers/color/color.types';

export interface DownloadInstructionsOptions {
  format: 'txt' | 'json';
  includeNailPositions: boolean;
  includeInstructions: boolean;
  colorFormat: ColorFormat;
  filename?: string;
}
