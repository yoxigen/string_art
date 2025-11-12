import { ColorValue } from '../helpers/color/color.types';
import { NailGroupKey, NailKey } from '../types/stringart.types';

export type Layer =
  | {
      name?: string;
      directions: Generator<NailKey>;
      color?: ColorValue;
      nailsGroup?: NailGroupKey;
    }
  | {
      name?: string;
      directions: Generator<NailKey | { group: NailGroupKey; nail: NailKey }>;
      color?: ColorValue;
      nailsGroup?: NailGroupKey;
      hasMultipleNailGroups: true;
    };
