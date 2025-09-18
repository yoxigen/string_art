import EventBus from '../helpers/EventBus';
import CanvasRenderer from '../renderers/CanvasRenderer';
import Renderer from '../renderers/Renderer';
import SVGRenderer from '../renderers/SVGRenderer';
import StringArt, { DrawOptions } from '../StringArt';
import { Dimensions } from '../types/general.types';

type RendererType = 'svg' | 'canvas';

export default class Viewer extends EventBus<{
  positionChange: { changeBy: number };
  click: void;
  touchStart: void;
  touchEnd: void;
}> {
  element: HTMLElement;
  renderer: Renderer | null;
  pattern: StringArt;
  rendererType: RendererType;
  cancelDraw: (() => void) | null;

  constructor(rendererType: RendererType = 'canvas') {
    super();

    this.rendererType = rendererType;
    this.element = document.querySelector('#canvas_panel');

    this.element.addEventListener('wheel', ({ deltaY }) => {
      const direction = -deltaY / Math.abs(deltaY); // Up is 1, down is -1
      this.emit('positionChange', { changeBy: direction });
    });

    // Cancelling this for the moment, as it creates problems on mobile, when doing back with gestures:
    // this.#setTapEvents();
  }

  get position(): number {
    return this.pattern?.position ?? -1;
  }

  get size(): Dimensions {
    return [this.element.clientWidth, this.element.clientHeight];
  }

  setSize(size: Dimensions | null) {
    this.#withRenderer();

    if (size) {
      if (!this.element.classList.contains('overflow')) {
        this.element.classList.add('overflow');
      }
      this.renderer.setFixedSize(size);
    } else {
      this.element.classList.remove('overflow');
      this.renderer.resetSize();
    }
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

  /**
   * Sets up click and touch events for the viewer
   */
  #setTapEvents() {
    let timeout: ReturnType<typeof setTimeout>;

    this.element.addEventListener('pointerdown', () => {
      this.emit('click', null);

      const cancelTouch = () => {
        clearTimeout(timeout);
        this.element.removeEventListener('pointerup', cancelTouch);
      };

      timeout = setTimeout(() => {
        this.element.removeEventListener('pointerup', cancelTouch);
        this.emit('touchStart', null);
        const end = () => {
          this.emit('touchEnd', null);
          this.element.removeEventListener('pointerup', end);
        };
        this.element.addEventListener('pointerup', end);
      }, 200);

      this.element.addEventListener('pointerup', cancelTouch);
    });
  }

  update(options?: DrawOptions) {
    this.#withRenderer();
    this.cancelDraw?.();
    this.cancelDraw = this.pattern?.draw(this.renderer, options);
  }

  goto(position: number) {
    this.#withRenderer();
    this.renderer.showInstructions();
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
      const RendererType =
        this.rendererType === 'svg' ? SVGRenderer : CanvasRenderer;
      this.setRenderer(
        new RendererType(this.element, { showInstructions: true })
      );
    }
  }
}
