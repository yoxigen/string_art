const DEFAULT_SNAP_DISTANCE = 0.05;
const THUMB_RADIUS = 8;
const TICK_WIDTH = 2;
const TICK_COLOR = 'rgba(0,0,0,.2)';
const FAR_VALUES_DISTANCE = 0.2; // values are considered far from each other if they are at least a fifth of the width of the input apart

export default class StringArtRangeInput extends HTMLElement {
  static formAssociated = true;
  internals: ElementInternals;

  min: number;
  max: number;

  #input: HTMLInputElement = null;
  #backgroundStyle: HTMLStyleElement = null;
  #snap: number = DEFAULT_SNAP_DISTANCE;
  #prevValue: number = null;
  #prevSnapValue: number = null;
  #tickValues: Array<number> = null;
  #snapDistance: number = null;
  #background: string = null;
  #thumbColor: string = null;
  #snapDisabledTick: number = null;
  #resizeObserver: ResizeObserver;

  constructor() {
    super();
    this.attachShadow({ mode: 'open', delegatesFocus: true });

    this.shadowRoot.innerHTML = `
          <style>
            input[type="range"] {
              width: 100%;
              appearance: none;
              background: transparent;
              border: none;
              margin: 2px;
              cursor: pointer;
            }

            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: ${THUMB_RADIUS * 2}px;
              height: ${THUMB_RADIUS * 2}px;
              border-radius: 50%;
              background: var(--color-input);
              cursor: pointer;
              border: none;
              margin-top: -4px;
              z-index: 10;
              box-shadow: 0 0 5px rgba(0,0,0,.5)
            }

            input[type="range"]::-webkit-slider-thumb:hover {
              background: var(--color-input-hover);
            }
              
            input[type="range"]:active::-webkit-slider-thumb {
              background: var(--color-input-active);
            }

            input[type="range"]::-webkit-slider-runnable-track {
              height: 8px;
              border-radius: 4px;
              margin: 0;
            }
          </style>
          <style id="background"></style>
          <input type="range">
        `;

    this.#input = this.shadowRoot.querySelector('input[type="range"]');
    this.#backgroundStyle = this.shadowRoot.querySelector('#background');
    this.#snap = DEFAULT_SNAP_DISTANCE;
    this.#prevSnapValue = null;

    this.internals = this.attachInternals();
  }

  static get observedAttributes() {
    return ['min', 'max', 'value', 'step', 'snap', 'background', 'thumbcolor'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'snap') {
      this.#tickValues = this.getTickValues();
    } else if (this.#input) {
      this.#input[name] = newVal;
    }

    if (name === 'min' || name === 'max') {
      this[name] = Number(newVal);
    }

    let value: number;
    if (name === 'value') {
      value = Number(newVal);
    }

    if (name === 'background') {
      this.#background = newVal;
    }

    if (name === 'thumbcolor') {
      this.#thumbColor = newVal;
    }

    if (this.min != null && this.max != null) {
      if (this.min > this.max) {
        this.max = this.min;
        this.#input.max = String(this.min);
      }

      this.#snapDistance =
        (this.max - this.min) * this.#snap || DEFAULT_SNAP_DISTANCE;

      if (this.#tickValues && this.value != null) {
        const snappedValue = this.getClosestTick(value);
        if (snappedValue != null) {
          this.#prevSnapValue = snappedValue;
        }
      }
    }

    this.#setStyle();
  }

  get value(): number {
    return Number(this.#input.value);
  }

  set value(v: string | number) {
    this.#input.value = String(v);
    this.#setStyle();
  }

  connectedCallback() {
    ['min', 'max', 'value', 'step'].forEach(attr => {
      if (this.hasAttribute(attr)) {
        this.#input[attr] = this.getAttribute(attr);
      }
    });

    this.#tickValues = this.getTickValues();
    this.#resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        this.#setStyle();
      }
    });
    this.#resizeObserver.observe(this.#input);

    this.#input.addEventListener('input', () => this.handleInput());
    this.#input.addEventListener('keydown', e => this.handleKeydown(e));
    this.#input.addEventListener(
      'change',
      () => (this.#snapDisabledTick = null)
    );

    this.tabIndex = 0;
  }

  disconnectedCallback() {
    this.#resizeObserver.unobserve(this);
  }

  getTickValues() {
    const ticks = this.getAttribute('snap');
    const ticksMatch = ticks?.match(/\d+(\.\d+)?/g);
    if (!ticksMatch) return [];
    return ticksMatch
      .map(Number)
      .filter(n => !isNaN(n))
      .sort();
  }

  #shouldAvoidSnap(newValue, closestTick) {
    if (closestTick == null) {
      closestTick = this.getClosestTick(newValue);
    }

    if (closestTick == null) {
      return true;
    }

    // If moving away from the snap value, don't snap:
    const distanceFromTick = Math.abs(newValue - closestTick);

    if (
      distanceFromTick >= this.#snapDistance / 2 &&
      distanceFromTick > Math.abs(this.#prevValue - closestTick)
    ) {
      return true;
    }

    return false;
  }

  // Checks whether two values are far apart,
  #areValuesFar(value1: number, value2: number): boolean {
    const distance = Math.abs(value1 - value2) / (this.max - this.min);
    return distance >= FAR_VALUES_DISTANCE;
  }

  focus() {
    this.#input.focus();
  }

  blur() {
    this.#input.blur();
  }

  handleInput() {
    const value = Number(this.#input.value);
    const closestTick = this.getClosestTick(value);

    this.internals.setFormValue(this.#input.value);

    if (
      closestTick != null &&
      this.#snapDisabledTick !== closestTick &&
      this.#shouldAvoidSnap(value, closestTick)
    ) {
      this.#snapDisabledTick = closestTick;
    }

    if (closestTick !== this.#snapDisabledTick) {
      if (closestTick !== null) {
        this.#input.value = String(closestTick);
        if (closestTick !== this.#prevSnapValue) {
          this.#vibrate();
          this.#prevSnapValue = closestTick;
        }
      } else if (this.#prevSnapValue != null) {
        this.#prevSnapValue = null;
      }
    }

    if (
      this.#snapDisabledTick != null &&
      closestTick == null &&
      this.#areValuesFar(value, this.#snapDisabledTick)
    ) {
      this.#snapDisabledTick = null;
    }

    this.#setStyle();
    this.#prevValue = value;

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.#input.value },
      })
    );
  }

  handleKeydown(event: KeyboardEvent) {
    event.preventDefault();
    const step = Number(this.#input.step || 1);
    const value = Number(this.#input.value);

    let newValue;

    if (event.key === 'ArrowLeft') {
      newValue = Math.max(this.min, value - step);
    } else if (event.key === 'ArrowRight') {
      newValue = Math.min(this.max, value + step);
    } else if (event.key === 'ArrowUp') {
      const next = this.#tickValues.find(t => t > value);
      if (next !== undefined) {
        newValue = next;
      } else if (value !== this.max) {
        // no next tick found, go to max
        newValue = this.max;
      }
    } else if (event.key === 'ArrowDown') {
      const reversed = [...this.#tickValues].reverse();
      const prev = reversed.find(t => t < value);
      if (prev !== undefined) {
        newValue = prev;
      } else if (value !== this.min) {
        newValue = this.min;
      }
    }

    if (newValue != null) {
      this.value = newValue;
      this.#prevValue = newValue;
      // emit event and prevent default for arrow keys
      this.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: newValue },
          bubbles: true,
          composed: true,
        })
      );
    }

    return false;
  }

  getClosestTick(value: number): number {
    if (!this.#tickValues || this.#tickValues.length === 0) return null;

    for (const tickValue of this.#tickValues) {
      const distance = Math.abs(value - tickValue);
      if (distance <= this.#snapDistance) {
        return tickValue;
      }
    }

    return null;
  }

  #vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  #setStyle() {
    const inputWidth = this.#input.clientWidth;
    if (!inputWidth) {
      return;
    }

    const valueInRange = this.value - this.min;
    const range = this.max - this.min;
    const availableWidth = inputWidth - 2 * THUMB_RADIUS;
    const valueWidth = THUMB_RADIUS + (availableWidth * valueInRange) / range;

    // The center of the thumb of the range input doesn't reach 0 and 100%, so the actual range to display leaves out the thumb's radius on the left and right.
    // Due to this, the ticks are placed in the constricted range of [THUMB_RADIUS::inputWidth - 2 * THUMB_RADIUS]
    const tickPositions = this.#tickValues
      ?.filter(v => v !== this.min && v !== this.max)
      .map(
        v =>
          THUMB_RADIUS +
          (availableWidth * (v - this.min)) / range -
          TICK_WIDTH / 2
      );

    const tickPositionsInGradient = tickPositions
      ?.map(
        p =>
          `transparent ${p}px, ${TICK_COLOR} ${p}px, ${TICK_COLOR} ${
            p + TICK_WIDTH
          }px, transparent ${p + TICK_WIDTH}px`
      )
      .join(', ');
    const ticksBackground = tickPositions?.length
      ? `linear-gradient(to right, ${tickPositionsInGradient}), `
      : null;

    const styles = [
      `input[type="range"]::-webkit-slider-runnable-track {
        background: ${ticksBackground ? ticksBackground : ''}${
        this.#background ??
        `linear-gradient(to right, var(--color-input) ${valueWidth}px, #ddd ${valueWidth}px)`
      };
      }${
        this.#background
          ? ''
          : `
       input[type="range"]:hover::-webkit-slider-runnable-track {
        background: ${
          ticksBackground ? ticksBackground : ''
        }linear-gradient(to right, var(--color-input-hover) ${valueWidth}px, #ddd ${valueWidth}px);
      }
        input[type="range"]:active::-webkit-slider-runnable-track {
        background: ${
          ticksBackground ? ticksBackground : ''
        }linear-gradient(to right, var(--color-input-active) ${valueWidth}px, #ddd ${valueWidth}px);
      }`
      }`,
    ];

    if (this.#thumbColor != null) {
      styles.push(
        `input[type="range"]::-webkit-slider-thumb { background: ${
          this.#thumbColor
        } !important}`
      );
    }
    this.#backgroundStyle.innerHTML = styles.join('\n');
  }
}

customElements.define('string-art-range-input', StringArtRangeInput);
