import { fitInside } from './helpers/size_utils';
import StringArt from './StringArt';
import { Dimensions } from './types/general.types';

class Info {
  elements: {
    infoPanel: HTMLDivElement;
    nailsCount: HTMLSpanElement;
    threadsTotalLength: HTMLSpanElement;
    threadsPerColor: HTMLDivElement;
  };

  targetSize: Dimensions = [30, 30];

  constructor() {
    this.elements = {
      infoPanel: document.querySelector('#info_panel'),
      nailsCount: document.querySelector('#nails_count'),
      threadsTotalLength: document.querySelector('#threads_total_length'),
      threadsPerColor: document.querySelector('#threads_per_color'),
    };
  }

  update(pattern: StringArt, size: Dimensions) {
    const { nailsCount, threadsLength } = pattern.getInfo(size);

    this.elements.nailsCount.textContent = String(nailsCount);
    this.elements.threadsTotalLength.textContent = String(
      this.#threadLengthToDistance(threadsLength.total, size)
    );

    this.elements.threadsPerColor.innerHTML = '';

    const maxColorLength = Math.max(
      ...threadsLength.perColor.map(({ length }) => length)
    );

    threadsLength.perColor.forEach(({ color, length }) => {
      const colorEl = document.createElement('li');
      const colorValueEl = document.createElement('div');
      colorEl.appendChild(colorValueEl);
      colorValueEl.innerText = this.#threadLengthToDistance(length, size);
      colorValueEl.style.background = color;
      colorValueEl.className = 'info__thread_color_value';
      colorValueEl.style.transform = `scaleX(${length / maxColorLength})`;
      this.elements.threadsPerColor.appendChild(colorEl);
    });
  }

  /**
   *
   * @param length Converts a pixel length unit to physical distance units
   */
  #threadLengthToDistance(length: number, sourceSize: Dimensions): string {
    const fittedSize = fitInside(sourceSize, this.targetSize);
    const ratio = Math.min(
      fittedSize[0] / sourceSize[0],
      fittedSize[1] / sourceSize[1]
    );
    return Math.round(length * ratio) / 100 + ' m';
  }
}

const info = new Info();
export default info;
