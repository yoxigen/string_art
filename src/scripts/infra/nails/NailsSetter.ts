import { Coordinates } from '../../types/general.types';
import { NailGroupKey } from '../../types/stringart.types';
import NailsGroup from './NailsGroup';

export default interface NailsSetter {
  addNail(key: string | number, coordinates: Coordinates): void;
  addGroup(nailsGroup: NailsGroup, key: NailGroupKey): void;
}
