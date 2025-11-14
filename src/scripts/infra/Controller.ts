import { ColorValue } from '../helpers/color/color.types';
import { NailGroupKey, NailKey } from '../types/stringart.types';
import { Layer } from './Layer';
import Nails from './nails/Nails';
import Renderer from './renderers/Renderer';

interface Nail {
  nailKey: NailKey;
  groupKey: NailGroupKey;
}

/**
 * Controller is a metaphor for a person who creates the string art. It has methods similar to actions the person makes.
 */
export default class Controller {
  #lastNail: Nail;
  #lastString: [Nail, Nail];

  constructor(private renderer: Renderer, private nails: Nails) {}

  startLayer({ name, color }: { name?: string; color?: ColorValue }) {
    if (color) {
      this.renderer.setColor(color);
    }
  }

  goto(nailKey: NailKey, groupKey?: NailGroupKey): void {
    const coordinates = this.nails.getNailCoordinates(nailKey, groupKey);
    this.renderer.setStartingPoint(coordinates);
    this.#lastNail = { nailKey, groupKey };
  }

  stringTo(nailKey: NailKey, groupKey?: NailGroupKey) {
    this.renderer.lineTo(this.nails.getNailCoordinates(nailKey, groupKey));
    const nail = { nailKey, groupKey };
    this.#lastString = [this.#lastNail, nail];
    this.#lastNail = nail;
  }

  getLastStringNumbers(): [number, number] {
    return this.#lastString?.map(({ nailKey, groupKey }) =>
      this.nails.getNailNumber(nailKey, groupKey)
    ) as [number, number];
  }

  *drawLayer(layer: Layer): Generator<void> {
    const nailsGroup = layer.nailsGroup
      ? this.nails.getGroup(layer.nailsGroup)
      : this.nails;

    if (layer.color) {
      this.renderer.setColor(layer.color);
    }

    const firstNailResult = layer.directions.next();
    if (firstNailResult.done) {
      console.warn(
        `Layer ${layer.name ? `"${layer.name} "` : ''} has no directions.`
      );
    }

    this.renderer.setStartingPoint(
      nailsGroup.getNailCoordinates(firstNailResult.value)
    );

    if ('hasMultipleNailGroups' in layer) {
      for (const nailKey of layer.directions) {
        const coordinates =
          typeof nailKey === 'object'
            ? this.nails
                .getGroup(nailKey.group)
                .getNailCoordinates(nailKey.nail)
            : nailsGroup.getNailCoordinates(nailKey);
        this.renderer.lineTo(coordinates);
        yield;
      }
    } else {
      for (const nailKey of layer.directions) {
        this.renderer.lineTo(nailsGroup.getNailCoordinates(nailKey));
        yield;
      }
    }
  }

  *drawLayers(layers: Iterable<Layer>): Generator<void> {
    for (const layer of layers) {
      yield* this.drawLayer(layer);
    }
  }
}
