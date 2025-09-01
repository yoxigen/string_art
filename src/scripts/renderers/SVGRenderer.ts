import Renderer from './Renderer.js';
import { PI2 } from '../helpers/math_utils.js';
import type { Coordinates, Dimensions } from '../types/general.types.js';
import { ColorValue } from '../helpers/color/color.types.js';
import { Nail, NailsRenderOptions } from '../types/stringart.types.js';
import { areDimensionsEqual } from '../helpers/size_utils.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export default class SVGRenderer extends Renderer {
  svg: SVGElement;
  backgroundGroup: SVGGElement;
  background: SVGRectElement = null;
  linesGroup: SVGGElement;
  nailsGroup: SVGGElement;
  nailsCirclesGroup: SVGGElement;
  nailsTextGroup: SVGGElement;
  currentColor: ColorValue | null = null;
  lineWidth: number | string = 1;
  currentLineGroup: SVGGElement = null;

  constructor(parentElement: HTMLElement) {
    super(parentElement);

    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.style.setProperty('display', 'block');
    this.backgroundGroup = document.createElementNS(SVG_NS, 'g');
    this.backgroundGroup.setAttribute('data-id', 'background');
    this.linesGroup = document.createElementNS(SVG_NS, 'g');
    this.linesGroup.setAttribute('data-id', 'lines');
    this.nailsGroup = document.createElementNS(SVG_NS, 'g');
    this.nailsGroup.setAttribute('data-id', 'nails');

    this.nailsCirclesGroup = document.createElementNS(SVG_NS, 'g');
    this.nailsCirclesGroup.setAttribute('data-id', 'nailsCircles');

    this.nailsTextGroup = document.createElementNS(SVG_NS, 'g');
    this.nailsTextGroup.setAttribute('data-id', 'nailsText');

    this.nailsGroup.appendChild(this.nailsCirclesGroup);
    this.nailsGroup.appendChild(this.nailsTextGroup);

    this.svg.appendChild(this.backgroundGroup);
    this.svg.appendChild(this.linesGroup);
    this.svg.appendChild(this.nailsGroup);

    this.svg.setAttribute('xmlns', SVG_NS);

    parentElement.appendChild(this.svg);
  }

  get element(): SVGElement {
    return this.svg;
  }

  resetSize(): Dimensions {
    this.svg.style.removeProperty('width');
    this.svg.style.removeProperty('height');

    const newDimensions = this.getSize().map(Math.trunc) as Dimensions;
    const [width, height] = newDimensions;
    this.svg.setAttributeNS(SVG_NS, 'viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttributeNS(SVG_NS, 'width', String(width));
    this.svg.setAttributeNS(SVG_NS, 'height', String(height));
    this.svg.style.width = width + 'px';
    this.svg.style.height = height + 'px';

    if (
      !this.currentSize ||
      !areDimensionsEqual(newDimensions, this.currentSize)
    ) {
      this.currentSize = newDimensions;
      this.emit('sizeChange', { size: newDimensions });
    }

    return newDimensions;
  }

  resetNails() {
    this.nailsCirclesGroup.innerHTML = '';
    this.nailsTextGroup.innerHTML = '';
  }

  resetStrings() {
    this.linesGroup.innerHTML = '';
    this.currentColor = null;
    this.lineWidth = null;
  }

  setColor(color: ColorValue) {
    if (color !== this.currentColor) {
      this.currentLineGroup = document.createElementNS(SVG_NS, 'g');
      this.currentLineGroup.setAttribute('stroke', color);
      this.currentLineGroup.setAttribute(
        'stroke-width',
        String(this.lineWidth)
      );
      this.linesGroup.appendChild(this.currentLineGroup);
      this.currentColor = color;
    }
  }

  setLineWidth(width?: number) {
    this.lineWidth = width ?? '1';
    this.linesGroup.setAttributeNS(SVG_NS, 'stroke-width', String(width ?? 1));
    this.linesGroup.childNodes.forEach(group => {
      if (group instanceof SVGGElement) {
        group.setAttributeNS(SVG_NS, 'stroke-width', String(width ?? 1));
      }
    });
  }

  setBackground(color: ColorValue) {
    if (color) {
      if (!this.background) {
        this.background = document.createElementNS(SVG_NS, 'rect');
        this.background.setAttribute('width', '100%');
        this.background.setAttribute('height', '100%');
        this.backgroundGroup.appendChild(this.background);
      }

      this.background.setAttribute('fill', color);
    } else {
      this.background = null;
      this.backgroundGroup.innerHTML = '';
    }
  }

  getSize(): Dimensions {
    return [this.svg.clientWidth, this.svg.clientHeight];
  }

  setSize(size: Dimensions | null) {
    if (!size) {
      return this.resetSize();
    }

    this.svg.removeAttributeNS(SVG_NS, 'width');
    this.svg.removeAttributeNS(SVG_NS, 'height');

    this.svg.style.width = `${size[0]}px`;
    this.svg.style.height = `${size[1]}px`;

    const realSize = size.map(Math.trunc) as Dimensions;
    const [width, height] = realSize;

    this.svg.setAttributeNS(SVG_NS, 'viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttributeNS(SVG_NS, 'width', String(width));
    this.svg.setAttributeNS(SVG_NS, 'height', String(height));

    if (!this.currentSize || !areDimensionsEqual(realSize, this.currentSize)) {
      this.currentSize = realSize;
      this.emit('sizeChange', { size: realSize });
    }

    return realSize;
  }

  renderLines(
    startPosition: Coordinates,
    ...positions: Array<Coordinates>
  ): void {
    let previousPoint = startPosition;
    const fragment = document.createDocumentFragment();

    for (const position of positions) {
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', String(Math.trunc(previousPoint[0])));
      line.setAttribute('y1', String(Math.trunc(previousPoint[1])));
      line.setAttribute('x2', String(Math.trunc(position[0])));
      line.setAttribute('y2', String(Math.trunc(position[1])));
      previousPoint = position;

      fragment.appendChild(line);
    }

    this.currentLineGroup.appendChild(fragment);
  }

  renderNails(
    nails: ReadonlyArray<Nail>,
    { color, fontSize, radius, renderNumbers, margin = 0 }: NailsRenderOptions
  ) {
    const centerX = this.getSize()[0] / 2;
    this.nailsCirclesGroup.innerHTML = this.nailsTextGroup.innerHTML = '';
    const circlesFragment = document.createDocumentFragment();
    const textFragment = document.createDocumentFragment();

    const nailNumberOffset = radius + margin;

    this.nailsTextGroup.style.fontSize = String(fontSize);
    nails.forEach(({ point: [x, y], number }) => {
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', String(radius));
      circlesFragment.appendChild(circle);

      if (renderNumbers && number != null) {
        const isRightAlign = x < centerX;

        const numberPosition = [
          isRightAlign ? x - nailNumberOffset : x + nailNumberOffset,
          y,
        ];

        const textEl = document.createElementNS(SVG_NS, 'text');
        textEl.innerHTML = String(number);
        textEl.setAttribute('x', String(numberPosition[0]));
        textEl.setAttribute('y', String(numberPosition[1]));
        if (isRightAlign) {
          textEl.setAttribute('text-anchor', 'end');
        }
        textFragment.appendChild(textEl);
      }
    });

    this.nailsCirclesGroup.appendChild(circlesFragment);
    this.nailsTextGroup.appendChild(textFragment);

    if (color != null) {
      this.nailsCirclesGroup.setAttribute('fill', color);
      this.nailsTextGroup.setAttribute('fill', color);
    }
  }

  clear() {
    this.linesGroup.innerHTML = '';
    this.nailsGroup.innerHTML = '';
  }

  toDataURL() {
    return '';
  }
}
