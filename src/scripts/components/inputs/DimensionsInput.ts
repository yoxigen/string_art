import { Dimensions } from '../../types/general.types';
import * as styles from 'bundle-text:./DimensionsInput.css';

const sheet = new CSSStyleSheet();
sheet.replaceSync(String(styles));

interface DimensionProps {
  element: HTMLInputElement;
  value: number;
  max: number | null;
  defaultValue: number | null;
}

type Dimension = 'width' | 'height';
const DIMENSIONS: ReadonlyArray<Dimension> = ['width', 'height'];

export default class DimensionsInput extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;

  #dimensions: {
    width: DimensionProps;
    height: DimensionProps;
  };

  #aspectRatio: number | null;
  isReadonly = false;
  floatingPoints: number;
  #connectorElement: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.adoptedStyleSheets = [sheet];

    this.shadowRoot.innerHTML = `
      <span id="wrapper">
        <input
          type="number"
          id="width"
          maxlength="3"
          min="1"
          class="dialog-input size-input"
          name="width"
        />
        <span id="connector">&times;</span>
        <input
          type="number"
          id="height"
          maxlength="3"
          min="1"
          class="dialog-input size-input"
          name="height"
        />
      </span>
    `;

    this.#dimensions = {
      width: {
        element: shadow.querySelector('#width'),
        value: 0,
        max: null,
        defaultValue: null,
      },
      height: {
        element: shadow.querySelector('#height'),
        value: 0,
        max: null,
        defaultValue: null,
      },
    };

    this.#connectorElement = shadow.querySelector('#connector');
    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return [
      'width',
      'height',
      'aspect-ratio',
      'max-width',
      'max-height',
      'readonly',
      'default-width',
      'default-height',
      'floating-points',
    ];
  }

  get inputs(): HTMLInputElement[] {
    return [this.#dimensions.width.element, this.#dimensions.height.element];
  }

  get width(): number {
    return this.#dimensions.width.value;
  }

  set width(value: number) {
    this.setDimensionValue('width', value);
  }

  get height(): number {
    return this.#dimensions.height.value;
  }

  set height(value: number) {
    this.setDimensionValue('height', value);
  }

  get value(): Dimensions {
    return [this.width, this.height];
  }

  set value([width, height]: [number, number]) {
    this.width = width;
    this.height = height;
  }

  get maxWidth(): number | null {
    return this.#dimensions.width.max;
  }

  get maxHeight(): number | null {
    return this.#dimensions.height.max;
  }

  set maxWidth(value: number | string) {
    this.setMaxDimensionValue('width', value);
  }

  set maxHeight(value: number | string) {
    this.setMaxDimensionValue('height', value);
  }

  applyAspectRatio(targetDimension: Dimension, value: number): number {
    if (!this.#aspectRatio) {
      return value;
    }
    return targetDimension === 'width'
      ? value * this.#aspectRatio
      : value / this.#aspectRatio;
  }

  getOtherDimension(dimension: Dimension): Dimension {
    return dimension === 'width' ? 'height' : 'width';
  }

  get aspectRatio(): number | null {
    return this.#aspectRatio;
  }

  set aspectRatio(value: number | string) {
    this.#aspectRatio = value ? Number(value) : null;
    if (isNaN(this.#aspectRatio)) {
      this.#aspectRatio = null;
    }

    if (this.#aspectRatio) {
      if (!this.#connectorElement.classList.contains('linked')) {
        this.#connectorElement.classList.add('linked');
      }
      this.#connectorElement.innerHTML = '🔗';
    } else {
      this.#connectorElement.classList.remove('linked');
      this.#connectorElement.innerHTML = '&times;';
    }
  }

  setMaxDimensionValue(
    dimension: Dimension,
    value: number | string,
    updateOtherDimension = true
  ) {
    const props = this.#dimensions[dimension];

    value = Number(value);
    let normalizedValue = value;
    if (this.floatingPoints != null) {
      normalizedValue = value.toFixedPrecision(this.floatingPoints);
    }

    if (normalizedValue === props.max) {
      return;
    }

    props.max = isNaN(normalizedValue) ? null : normalizedValue;
    if (props.max) {
      if (props.value && props.value > normalizedValue) {
        this[dimension] = normalizedValue;
      }
      props.element.setAttribute('max', String(props.max));
    } else {
      props.element.removeAttribute('max');
    }

    if (updateOtherDimension && this.#aspectRatio) {
      const otherDimension = this.getOtherDimension(dimension);
      const otherDimensionMaxValue = this.applyAspectRatio(
        otherDimension,
        value
      );
      if (
        !this.#dimensions[otherDimension].max ||
        otherDimensionMaxValue < this.#dimensions[otherDimension].max
      ) {
        this.setMaxDimensionValue(
          otherDimension,
          otherDimensionMaxValue,
          false
        );
      }
    }
  }

  setDimensionValue(
    dimension: Dimension,
    value: number,
    updateOtherDimension = true
  ) {
    const props = this.#dimensions[dimension];

    let normalizedValue = value;
    if (this.floatingPoints != null) {
      normalizedValue = value.toFixedPrecision(this.floatingPoints);
    }

    if (normalizedValue === this[dimension]) {
      return;
    }
    if (isNaN(normalizedValue)) {
      console.warn('Attempting to set a NaN value to DimensionsInput width.');
    } else {
      if (props.max) {
        normalizedValue = Math.min(normalizedValue, props.max);
      }
      props.value = normalizedValue;
      props.element.value = String(normalizedValue);

      if (updateOtherDimension && this.#aspectRatio) {
        const otherDimension = this.getOtherDimension(dimension);
        this.setDimensionValue(
          otherDimension,
          this.applyAspectRatio(otherDimension, value),
          false
        );
      }
    }
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (name === 'aspect-ratio') {
      this.aspectRatio = newVal;
    } else if (name === 'max-width') {
      this.maxWidth = newVal;
    } else if (name === 'max-height') {
      this.maxHeight = newVal;
    } else if (name === 'floating-points') {
      this.setFloatingPoints(Number(newVal));
    }
  }

  connectedCallback() {
    this.shadowRoot.addEventListener('input', e =>
      this.#handleInput(e as InputEvent)
    );
    this.#syncAttributes();
  }

  #handleInput(e: InputEvent) {
    if (e.target instanceof HTMLInputElement) {
      const value = Number(e.target.value);

      for (const dimension of DIMENSIONS) {
        if (e.target === this.#dimensions[dimension].element) {
          this[dimension] = value;
          break;
        }
      }

      this.internals.setFormValue(String(this.value.join(',')));

      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: this.value },
        })
      );
    }
  }

  #syncAttributes() {
    for (const dimension of DIMENSIONS) {
      const props = this.#dimensions[dimension];

      if (this.hasAttribute('default-' + dimension)) {
        const value = Number(this.getAttribute('default-' + dimension));
        props.defaultValue = isNaN(value) ? 0 : value;
        props.element.placeholder = String(value);
      }

      this.setMaxDimensionValue(
        dimension,
        this.getAttribute('max-' + dimension)
      );

      if (this.hasAttribute(dimension)) {
        const value = Number(this.getAttribute(dimension));
        this[dimension] = isNaN(value) ? props.defaultValue : value;
      }
    }

    this.aspectRatio = this.getAttribute('aspect-ratio');

    if (this.hasAttribute('floating-points')) {
      const value = Number(this.getAttribute('floating-points'));
      this.setFloatingPoints(isNaN(value) ? null : value);
    }
  }

  setFloatingPoints(value: number) {
    if (value != null && !isNaN(value)) {
      this.floatingPoints = value;
      this.inputs.forEach(input =>
        input.setAttribute('step', String(1 / 10 ** this.floatingPoints))
      );

      DIMENSIONS.forEach(dimension => {
        if (this[dimension]) {
          this[dimension] = this[dimension].toFixedPrecision(value);
        }
      });
    } else {
      this.floatingPoints = null;
      this.inputs.forEach(input => input.removeAttribute('step'));
    }
  }
}

customElements.define('dimensions-input', DimensionsInput);
