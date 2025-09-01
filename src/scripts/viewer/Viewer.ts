import Renderer from '../renderers/Renderer';
import StringArt from '../StringArt';
import { Dimensions } from '../types/general.types';

export default class Viewer {
  element: HTMLElement;
  renderer: Renderer;
  pattern: StringArt;

  #rendererSizeEventListenerRemove: Function;

  constructor(renderer: Renderer) {
    this.element = document.querySelector('#canvas_panel');
    this.setRenderer(renderer);
  }

  setRenderer(
    renderer: Renderer,
    { updateOnSizeChange = true }: { updateOnSizeChange?: boolean } = {}
  ) {
    this.#rendererSizeEventListenerRemove?.();
    this.renderer = renderer;

    if (updateOnSizeChange) {
      this.#rendererSizeEventListenerRemove = renderer.addEventListener(
        'sizeChange',
        ({ size }) => this.#updateOnSizeChange(size)
      );
    }
  }

  #updateOnSizeChange(size: Dimensions) {
    if (size[0] && size[1]) {
      this.pattern?.draw(this.renderer);
    }
  }
}
