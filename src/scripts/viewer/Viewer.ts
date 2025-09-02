import EventBus from '../helpers/EventBus';
import CanvasRenderer from '../renderers/CanvasRenderer';
import Renderer from '../renderers/Renderer';
import SVGRenderer from '../renderers/SVGRenderer';
import StringArt, { DrawOptions } from '../StringArt';
import { Dimensions } from '../types/general.types';

type RendererType = 'svg' | 'canvas';

export default class Viewer extends EventBus<{
  positionChange: { changeBy: number };
}> {
  element: HTMLElement;
  renderer: Renderer | null;
  pattern: StringArt;
  rendererType: RendererType;

  constructor(rendererType: RendererType = 'canvas') {
    super();

    this.rendererType = rendererType;
    this.element = document.querySelector('#canvas_panel');

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
    if (!pattern && this.renderer) {
      this.renderer.clear();
    }
  }

  #updateOnSizeChange(size: Dimensions) {
    if (size[0] && size[1]) {
      this.pattern?.draw(this.renderer);
    }
  }

  update(options?: DrawOptions) {
    this.#withRenderer();
    this.pattern?.draw(this.renderer, options);
  }

  goto(position: number) {
    this.#withRenderer();
    this.pattern.goto(this.renderer, position);
  }

  next(): { done: boolean } {
    return { done: this.pattern.drawNext().done };
  }

  getStepCount(): number {
    this.#withRenderer();
    return this.pattern.getStepCount({ size: this.renderer.getSize() });
  }

  #withRenderer(): asserts this is { renderer: Renderer } {
    if (!this.renderer) {
      console.log('WITH');
      const RendererType =
        this.rendererType === 'svg' ? SVGRenderer : CanvasRenderer;
      this.setRenderer(new RendererType(this.element));
    }
  }
}
