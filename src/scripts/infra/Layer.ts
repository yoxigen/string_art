import { ColorValue } from '../helpers/color/color.types';
import { NailGroupKey, NailKey } from '../types/stringart.types';

export default interface Layer {
  name?: string;
  directions: Generator<NailKey | { group: NailGroupKey; nail: NailKey }>;
  color?: ColorValue;
  nailsGroup?: NailGroupKey;
}
