import DimensionsInput from './components/inputs/DimensionsInput';
import { fitInside, prettifyLength } from './helpers/size_utils';
import { MeasureRenderer } from './infra/renderers/MeasureRenderer';
import StringArt from './infra/StringArt';
import { Dimensions } from './types/general.types';
import { PatternInfo } from './types/info.types';

const DEFAULT_TARGET_SIZE_CM: Dimensions = [30, 30];
const DEFAULT_SIZES_CM = [20, 30, 40, 50, 60, 70, 80, 90, 100];

let controller: TaskController;

class Info {
  elements: {
    infoPanel: HTMLDivElement;
    nailsCount: HTMLSpanElement;
    threadsTotalLength: HTMLSpanElement;
    threadsPerColor: HTMLDivElement;
    closestDistanceBetweenNails: HTMLDataElement;
    dimensions: DimensionsInput;
    dimensionsSelect: HTMLSelectElement;
  };

  targetSizeCm: Dimensions = DEFAULT_TARGET_SIZE_CM;
  pattern: StringArt;
  lastSize: Dimensions;
  patternMargin: number;
  patternNailRadius: number;

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
      dimensionsSelect: document.querySelector('#info_dimensions_select'),
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
          this.update();
        }
      }
    );

    this.elements.dimensionsSelect.addEventListener('change', e => {
      const value = Number(this.elements.dimensionsSelect.value);
      this.targetSizeCm = [value, value];
      this.update();
    });
  }

  #setAvailableDimensions() {
    const aspectRatio = this.pattern.getAspectRatio({ size: [100, 100] });
    const sizes = DEFAULT_SIZES_CM.map(v =>
      aspectRatio >= 1
        ? [v, Math.round(v / aspectRatio)]
        : [Math.round(v * aspectRatio), v]
    );
    this.elements.dimensionsSelect.innerHTML = sizes
      .map(
        (size, i) =>
          `<option value="${DEFAULT_SIZES_CM[i]}">${size.join('x')} cm`
      )
      .join('\n');

    this.elements.dimensionsSelect.value = this.targetSizeCm[0].toString();
  }

  setPattern(pattern: StringArt, size: Dimensions) {
    this.pattern = pattern.copy();
    this.lastSize = size;
    this.patternMargin = pattern.config.margin;
    this.patternNailRadius = pattern.config.nailRadius;
    this.update();
    this.#setAvailableDimensions();
  }

  async update() {
    if (!this.pattern) {
      throw new Error("Can't update info - no pattern.");
    }

    controller?.abort();

    const fittedSize = fitInside(this.lastSize, this.targetSizeCm);
    const sizeRatio = Math.min(
      fittedSize[0] / this.lastSize[0],
      fittedSize[1] / this.lastSize[1]
    );

    this.pattern.assignConfig({
      margin: this.patternMargin * sizeRatio,
      nailRadius: this.patternNailRadius * sizeRatio,
    });

    this.elements.dimensions.value = this.targetSizeCm;

    controller = new TaskController({ priority: 'background' });

    const { nailsCount, threadsLength, closestDistanceBetweenNails } =
      await scheduler.postTask(() => this.getInfo(this.targetSizeCm), {
        signal: controller.signal,
      });

    this.elements.nailsCount.textContent = nailsCount.toLocaleString();
    this.elements.threadsTotalLength.textContent = String(
      this.#threadLengthToDistance(threadsLength.total)
    );
    this.elements.closestDistanceBetweenNails.textContent = String(
      this.#threadLengthToDistance(closestDistanceBetweenNails)
    );
    this.elements.threadsPerColor.innerHTML = '';

    const maxColorLength = Math.max(
      ...threadsLength.perColor.map(({ length }) => length)
    );

    [...threadsLength.perColor]
      .sort((a, b) => b.length - a.length)
      .forEach(({ color, length }) => {
        const colorEl = document.createElement('li');
        const colorValueEl = document.createElement('div');
        colorEl.appendChild(colorValueEl);
        colorValueEl.style.background = color;
        colorValueEl.className = 'info__thread_color_value';
        colorValueEl.style.width = `max(calc(${
          (100 * length) / maxColorLength
        }% - 70px), 6px)`;

        const colorValueDisplay = document.createElement('span');
        colorValueDisplay.innerText = this.#threadLengthToDistance(length);
        colorValueDisplay.className = 'info__thread_color_value_text';
        colorEl.appendChild(colorValueDisplay);
        this.elements.threadsPerColor.appendChild(colorEl);
      });
  }

  /**
   *
   * @param length Converts a pixel length unit to physical distance units
   */
  #threadLengthToDistance(length: number, ratio = 1): string {
    return prettifyLength(length * ratio, 'cm');
  }

  getInfo(size: Dimensions): PatternInfo {
    const renderer = new MeasureRenderer(size);
    this.pattern.draw(renderer, {
      sizeChanged: true,
      redrawStrings: true,
      redrawNails: true,
      precision: 100, // Setting precision to sub-millimeter
    });
    return renderer.getInfo();
  }
}

const info = new Info();
export default info;
