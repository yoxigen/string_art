import EventBus from '../helpers/EventBus';
import CanvasRenderer from '../renderers/CanvasRenderer';
import Renderer from '../renderers/Renderer';
import SVGRenderer from '../renderers/SVGRenderer';
import StringArt, { DrawOptions } from '../StringArt';
import { Dimensions } from '../types/general.types';

export default class Viewer extends EventBus<{
  positionChange: { changeBy: number };
}> {
  element: HTMLElement;
  renderer: Renderer;
  pattern: StringArt;

  constructor(rendererType: 'svg' | 'canvas' = 'canvas') {
    super();

    const RendererType = rendererType === 'svg' ? SVGRenderer : CanvasRenderer;
    this.element = document.querySelector('#canvas_panel');
    this.setRenderer(new RendererType(this.element));

    this.element.addEventListener('wheel', ({ deltaY }) => {
      const direction = -deltaY / Math.abs(deltaY); // Up is 1, down is -1
      this.emit('positionChange', { changeBy: direction });
    });
  }

  get position(): number {
    return this.pattern?.position ?? -1;
  }

  setRenderer(renderer: Renderer) {
    this.renderer = renderer;

    renderer.addEventListener('sizeChange', ({ size }) =>
      this.#updateOnSizeChange(size)
    );
  }

  setPattern(pattern: StringArt) {
    this.pattern = pattern;
    if (!pattern) {
      this.renderer.clear();
    }
  }

  #updateOnSizeChange(size: Dimensions) {
    if (size[0] && size[1]) {
      this.pattern?.draw(this.renderer);
    }
  }

  update(options?: DrawOptions) {
    this.pattern?.draw(this.renderer, options);
  }

  goto(position: number) {
    this.pattern.goto(this.renderer, position);
  }

  next(): { done: boolean } {
    return { done: this.pattern.drawNext().done };
  }

  getStepCount(): number {
    return this.pattern.getStepCount({ size: this.renderer.getSize() });
  }
}
