import { DownloadInstructionsOptions } from '../components/dialogs/download_instructions/download_instructions_types';
import { DownloadPatternOptions } from '../download/Download';
import { PrimitiveValue } from './config.types';
import { ID } from './stringart.types';

export interface PatternData {
  id: ID;
  name: string;
  type: string;
  config: Record<string, PrimitiveValue>;
}

export interface AppData {
  patterns: PatternData[];
  downloadData: Record<ID, DownloadPatternOptions>;
  downloadInstructionsData: Record<ID, DownloadInstructionsOptions>;
}
