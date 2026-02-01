import { ColorValue } from '../helpers/color/color.types';
import Controller from '../infra/Controller';
import Renderer from '../infra/renderers/Renderer';
import StringArt from '../infra/StringArt';
import { NailGroupKey, NailKey } from '../types/stringart.types';

interface Layer {
  color: ColorValue;
  points: NailKey[];
}

class InstructionsController extends Controller {
  layers: Layer[] = [];

  private currentLayer: Layer;

  startLayer({ color }: { name?: string; color?: ColorValue }): void {
    this.currentLayer = { color, points: [] };
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

export function downloadInstructions(pattern: StringArt) {
  const controller = new InstructionsController();
}
