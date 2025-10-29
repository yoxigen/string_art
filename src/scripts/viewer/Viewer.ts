import EventBus from '../helpers/EventBus';
import CanvasRenderer from '../infra/renderers/CanvasRenderer';
import Renderer from '../infra/renderers/Renderer';
import SVGRenderer from '../infra/renderers/SVGRenderer';
import routing from '../routing';
import StringArt, { DrawOptions } from '../infra/StringArt';
import { Dimensions } from '../types/general.types';
import { RendererType } from '../types/stringart.types';
import viewOptions from './ViewOptions';

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

    viewOptions.addEventListener(
      'showInstructionsChange',
      ({ showInstructions }) => {
        this.#withRenderer();
        if (showInstructions) {
          this.renderer.showInstructions();
        } else {
          this.renderer.hideInstructions();
        }
      }
    );

    routing.addEventListener('renderer', rendererType => {
      this.rendererType = rendererType;
      this.renderer = null;
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
      this.pattern?.draw(this.renderer, { sizeChanged: true });
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
    viewOptions.showInstructions = false;
    this.#withRenderer();
    this.pattern?.draw(this.renderer, options);
  }

  goto(position: number) {
    this.#withRenderer();
    this.pattern.goto(this.renderer, position, {
      showInstructions: viewOptions.showInstructions,
    });
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
      this.setRenderer(new RendererType(this.element));
    }
  }
}
