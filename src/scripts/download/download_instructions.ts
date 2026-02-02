import { ColorValue } from '../helpers/color/color.types';
import Controller from '../infra/Controller';
import Nails from '../infra/nails/Nails';
import Renderer from '../infra/renderers/Renderer';
import { TestRenderer } from '../infra/renderers/TestRenderer';
import StringArt from '../infra/StringArt';
import { Coordinates, Dimensions } from '../types/general.types';
import { NailGroupKey, NailKey } from '../types/stringart.types';

interface Layer {
  color: ColorValue;
  points: NailKey[];
}

export type Instructions = {
  layers: Layer[];
  nails: Coordinates[];
};

class InstructionsController extends Controller {
  layers: Layer[] = [];

  private currentLayer: Layer;

  startLayer({ color }: { name?: string; color?: ColorValue }): void {
    if (this.currentLayer?.color !== color) {
      this.layers.push((this.currentLayer = { color, points: [] }));
    }
  }

  goto(nailKey: NailKey, groupKey: NailGroupKey): void {
    // If the current layer hasn't been started yet, there's no need to initialize the current layer
    if (this.currentLayer?.points.length) {
      this.startLayer({ color: this.currentLayer.color });
    }

    this.currentLayer.points.push(nailKey);
    // const coordinates = this.nails.getNailCoordinates(nailKey, groupKey);
    //this.renderer.setStartingPoint(coordinates);
  }

  stringTo(nailKey: NailKey, groupKey?: NailGroupKey) {
    // this.renderer.lineTo(this.nails.getNailCoordinates(nailKey, groupKey));
    this.currentLayer.points.push(nailKey);
  }
}

export interface DownloadInstructionsOptions {
  dimensions: Dimensions;
}

export function createPatternInstructions(
  pattern: StringArt,
  options: DownloadInstructionsOptions
): Instructions {
  const renderer = new TestRenderer(options.dimensions);
  const nails = new Nails();

  const controller = new InstructionsController(renderer, nails);

  pattern.draw(renderer, {
    controller,
  });

  const instructions: Instructions = {
    layers: controller.layers,
    nails: pattern.getNailsCoordinates(),
  };

  return instructions;
}
