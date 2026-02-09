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
  layers?: Layer[];
  nails?: Coordinates[];
};

class InstructionsController extends Controller {
  layers: Layer[] = [];

  private currentLayer: Layer;
  private layerStart: [NailKey, NailGroupKey];

  constructor(renderer: Renderer, private pattern: StringArt) {
    super(renderer, new Nails());
  }

  startLayer({ color }: { name?: string; color?: ColorValue }): void {
    if (this.currentLayer?.color !== color) {
      this.layers.push((this.currentLayer = { color, points: [] }));
    }

    if (this.layerStart) {
      this.goto(...this.layerStart);
      this.layerStart = null;
    }
  }

  goto(nailKey: NailKey, groupKey: NailGroupKey): void {
    if (!this.currentLayer) {
      this.layerStart = [nailKey, groupKey];
      return;
    }

    // If the current layer hasn't been started yet, there's no need to initialize the current layer
    if (this.currentLayer?.points.length) {
      this.startLayer({ color: this.currentLayer.color });
    }

    this.currentLayer.points.push(
      this.pattern.getNailNumber(nailKey, groupKey)
    );
    // const coordinates = this.nails.getNailCoordinates(nailKey, groupKey);
    //this.renderer.setStartingPoint(coordinates);
  }

  stringTo(nailKey: NailKey, groupKey?: NailGroupKey) {
    // this.renderer.lineTo(this.nails.getNailCoordinates(nailKey, groupKey));
    this.currentLayer.points.push(
      this.pattern.getNailNumber(nailKey, groupKey)
    );
  }
}

export interface DownloadInstructionsOptions {
  dimensions: Dimensions;
  includeNails: boolean;
}

const DEFAULT_OPTIONS: DownloadInstructionsOptions = {
  dimensions: [100, 100],
  includeNails: true,
};

export function createPatternInstructions(
  pattern: StringArt,
  options: Partial<DownloadInstructionsOptions> = {}
): Instructions {
  const allOptions = Object.assign({}, DEFAULT_OPTIONS, options);
  const renderer = new TestRenderer(options.dimensions);
  const nails = new Nails();

  const controller = new InstructionsController(renderer, pattern);

  pattern.draw(renderer, {
    controller,
  });

  const instructions: Instructions = {
    layers: controller.layers,
  };

  if (allOptions.includeNails) {
    instructions.nails = pattern.getNailsCoordinates();
  }

  return instructions;
}
