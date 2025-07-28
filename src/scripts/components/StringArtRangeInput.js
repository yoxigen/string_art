const DEFAULT_SNAP_DISTANCE = 0.05;
const THUMB_RADIUS = 8;
const TICK_WIDTH = 2;
const TICK_COLOR = 'rgba(0,0,0,.2)';

export default class StringArtRangeInput extends HTMLElement {
  #input = null;
  #backgroundStyle = null;
  #snap = DEFAULT_SNAP_DISTANCE;
  #prevValue = null;
  #prevSnapValue = null;
  #tickValues = null;
  #snapDistance = null;
  #background = null;
  #thumbColor = null;
  #snapDisabledTick = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

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

    let value;
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
      this.#snapDistance =
        (this.max - this.min) * this.#snap || DEFAULT_SNAP_DISTANCE;

      if (this.#tickValues && value != null) {
        const snappedValue = this.getClosestTick(value);
        if (snappedValue != null) {
          this.#prevSnapValue = snappedValue;
        }
      }
    }

    this.#setStyle();
  }

  get value() {
    return this.#input.value;
  }

  set value(v) {
    this.#input.value = v;
    this.#setStyle();
  }

  connectedCallback() {
    ['min', 'max', 'value', 'step'].forEach(attr => {
      if (this.hasAttribute(attr)) {
        this.#input[attr] = this.getAttribute(attr);
      }
    });

    this.#tickValues = this.getTickValues();
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        this.#setStyle();
      }
    });
    this.resizeObserver.observe(this.#input);

    this.#input.addEventListener('input', () => this.handleInput());
    this.#input.addEventListener('keydown', e => this.handleKeydown(e));
    this.#input.addEventListener(
      'change',
      () => (this.#snapDisabledTick = null)
    );
  }

  disconnectedCallback() {
    this.resizeObserver.unobserve(this);
  }

  getTickValues() {
    const ticks = this.getAttribute('snap');
    const ticksMatch = ticks?.match(/\d+(\.\d+)?/g);
    if (!ticksMatch) return [];
    return ticksMatch.map(Number).filter(n => !isNaN(n));
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

  handleInput() {
    const value = parseFloat(this.#input.value);
    const closestTick = this.getClosestTick(value);

    if (
      closestTick != null &&
      this.#snapDisabledTick !== closestTick &&
      this.#shouldAvoidSnap(value, closestTick)
    ) {
      this.#snapDisabledTick = closestTick;
    }

    if (closestTick !== this.#snapDisabledTick) {
      if (closestTick !== null) {
        this.#input.value = closestTick;
        if (closestTick !== this.#prevSnapValue) {
          this.#vibrate();
          this.#prevSnapValue = closestTick;
        }
      } else if (this.#prevSnapValue != null) {
        this.#prevSnapValue = null;
      }
    }

    this.#setStyle();
    this.#prevValue = value;

    this.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: this.#input.value },
      })
    );
  }

  handleKeydown(event) {
    const step = parseFloat(this.#input.step || 1);
    const value = parseFloat(this.#input.value);
    const min = parseFloat(this.#input.min || 0);
    const max = parseFloat(this.#input.max || 100);

    if (event.key === 'ArrowLeft') {
      this.#input.value = Math.max(min, value - step);
    } else if (event.key === 'ArrowRight') {
      this.#input.value = Math.min(max, value + step);
    } else if (event.key === 'ArrowUp') {
      const next = this.#tickValues.find(t => t > value);
      if (next !== undefined) {
        this.#input.value = next;
        this.#vibrate();
      }
    } else if (event.key === 'ArrowDown') {
      const reversed = [...this.#tickValues].reverse();
      const prev = reversed.find(t => t < value);
      if (prev !== undefined) {
        this.#input.value = prev;
        this.#vibrate();
      }
    } else {
      return; // don't emit change for other keys
    }

    // emit event and prevent default for arrow keys
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.#input.value },
      })
    );
  }

  getClosestTick(value) {
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
