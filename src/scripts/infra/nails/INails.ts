import { Coordinates } from '../../types/general.types';
import NailsGroup from './NailsGroup';

export default interface INails {
  addNail(key: string | number, coordinates: Coordinates): void;
  addGroup(nailsGroup: NailsGroup): void;
}
