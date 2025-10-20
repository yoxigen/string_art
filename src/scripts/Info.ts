import DimensionsInput from './components/inputs/DimensionsInput';
import { fitInside, prettifyLength } from './helpers/size_utils';
import StringArt from './StringArt';
import { Dimensions } from './types/general.types';

const DEFAULT_TARGET_SIZE_CM: Dimensions = [30, 30];

class Info {
  elements: {
    infoPanel: HTMLDivElement;
    nailsCount: HTMLSpanElement;
    threadsTotalLength: HTMLSpanElement;
    threadsPerColor: HTMLDivElement;
    closestDistanceBetweenNails: HTMLDataElement;
    dimensions: DimensionsInput;
  };

  targetSizeCm: Dimensions = [30, 30];
  pattern: StringArt;
  lastSize: Dimensions;

  constructor() {
    this.elements = {
      infoPanel: document.querySelector('#info_panel'),
      nailsCount: document.querySelector('#nails_count'),
      threadsTotalLength: document.querySelector('#threads_total_length'),
      threadsPerColor: document.querySelector('#threads_per_color'),
      closestDistanceBetweenNails: document.querySelector(
        '#closest_distance_between_nails'
      ),
      dimensions: document.querySelector('#info_dimensions'),
    };

    this.elements.dimensions.addEventListener(
      'dimensionchange',
      ({
        detail: { value: dimensions },
      }: CustomEvent<{
        value: Dimensions;
      }>) => {
        this.targetSizeCm = dimensions;
        if (this.pattern) {
          this.update(this.lastSize);
        }
      }
    );
  }

  setPattern(pattern: StringArt, size: Dimensions) {
    this.pattern = pattern;
    this.targetSizeCm = DEFAULT_TARGET_SIZE_CM;
    this.update(size);
  }

  update(size: Dimensions) {
    if (!this.pattern) {
      throw new Error("Can't update info - no pattern.");
    }

    this.lastSize = size;

    const aspectRatio = this.pattern.getAspectRatio({ size });
    const fittedPatternSize = fitInside([aspectRatio, 1], size);

    this.elements.dimensions.aspectRatio = aspectRatio;
    this.elements.dimensions.value = fitInside(
      fittedPatternSize,
      this.targetSizeCm
    );

    const { nailsCount, threadsLength, closestDistanceBetweenNails } =
      this.pattern.getInfo(size);

    this.elements.nailsCount.textContent = nailsCount.toLocaleString();
    this.elements.threadsTotalLength.textContent = String(
      this.#threadLengthToDistance(threadsLength.total, fittedPatternSize)
    );
    this.elements.closestDistanceBetweenNails.textContent = String(
      this.#threadLengthToDistance(
        closestDistanceBetweenNails,
        fittedPatternSize
      )
    );
    this.elements.threadsPerColor.innerHTML = '';

    const maxColorLength = Math.max(
      ...threadsLength.perColor.map(({ length }) => length)
    );

    threadsLength.perColor.forEach(({ color, length }) => {
      const colorEl = document.createElement('li');
      const colorValueEl = document.createElement('div');
      colorEl.appendChild(colorValueEl);
      colorValueEl.innerText = this.#threadLengthToDistance(
        length,
        fittedPatternSize
      );
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
    const fittedSize = fitInside(sourceSize, this.targetSizeCm);
    const ratio = Math.min(
      fittedSize[0] / sourceSize[0],
      fittedSize[1] / sourceSize[1]
    );
    return prettifyLength(length * ratio, 'cm');
  }
}

const info = new Info();
export default info;
