import { ColorValue } from '../helpers/color/color.types';
import { NailKey } from '../types/stringart.types';
import { Layer } from './Layer';
import Nails from './nails/Nails';
import Renderer from './renderers/Renderer';

export default class Controller {
  #nailNumbers: Map<NailKey, number>;
  #lastNail: NailKey;
  #lastString: [NailKey, NailKey];

  constructor(private renderer: Renderer, private nails: Nails) {}

  startLayer({ name, color }: { name?: string; color?: ColorValue }) {
    if (color) {
      this.renderer.setColor(color);
    }
  }

  goto(key: NailKey): void {
    const coordinates = this.nails.getNailCoordinates(key);
    this.renderer.setStartingPoint(coordinates);
    this.#lastNail = key;
  }

  stringTo(key: NailKey) {
    this.renderer.lineTo(this.nails.getNailCoordinates(key));
    this.#lastString = [this.#lastNail, key];
    this.#lastNail = key;
  }

  getLastStringNumbers(): [number, number] {
    return this.#lastString?.map(k => this.#nailNumbers.get(k)) as [
      number,
      number
    ];
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
