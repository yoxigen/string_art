const DEFAULT_SNAP_DISTANCE = 5;
const COLOR = '#007bff';
const THUMB_RADIUS = 8;
const TICK_WIDTH = 2;
const TICK_COLOR = 'rgba(0,0,0,.2)';

export default class StringArtRangeInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
          <style>
            .wrapper {
              position: relative;
              width: 100%;
            }

            input[type="range"] {
              width: 100%;
              appearance: none;
              background: transparent;
              border: none;
              margin: 0;
              cursor: pointer;
            }

            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: ${THUMB_RADIUS * 2}px;
              height: ${THUMB_RADIUS * 2}px;
              border-radius: 50%;
              background: ${COLOR};
              cursor: pointer;
              border: none;
              margin-top: -4px;
              z-index: 10;
            }

            input[type="range"]::-webkit-slider-runnable-track {
              height: 8px;
              border-radius: 4px;
              margin: 0;
            }

            .ticks {
              position: absolute;
              top: 0;
              left: ${THUMB_RADIUS}px;
              width: calc(100% - ${2 * THUMB_RADIUS}px);
              height: 4px;
              display: flex;
              justify-content: space-between;
              pointer-events: none;
              z-index: 1;
            }

            .tick {
              width: 2px;
              height: 10px;
              background: black;
              margin-left: -1px
            }
          </style>
          <style id="background"></style>
          <div class="wrapper">
            <div class="ticks"></div>
            <input type="range">
          </div>
        `;

    this.input = this.shadowRoot.querySelector('input[type="range"]');
    this.ticksContainer = this.shadowRoot.querySelector('.ticks');
    this.backgroundStyle = this.shadowRoot.querySelector('#background');

    this.prevSnapValue = null;
  }

  static get observedAttributes() {
    return ['min', 'max', 'value', 'step', 'ticks', 'snap'];
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'ticks') {
      this.tickValues = this.getTickValues();
    } else if (this.input) {
      this.input[name] = newVal;
    }

    if (name === 'min' || name === 'max') {
      this[name] = Number(newVal);
    }

    if (name === 'value') {
      this.value = Number(newVal);
    }
    this.setBackground();
  }

  connectedCallback() {
    ['min', 'max', 'value', 'step'].forEach(attr => {
      if (this.hasAttribute(attr)) {
        this.input[attr] = this.getAttribute(attr);
      }
    });

    this.tickValues = this.getTickValues();
    this.snapDistance = this.getAttribute('snap') ?? DEFAULT_SNAP_DISTANCE;

    this.setBackground();

    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('keydown', e => this.handleKeydown(e));
  }

  getTickValues() {
    const ticks = this.getAttribute('ticks');
    const ticksMatch = ticks.match(/\d+(\.\d+)?/g);
    if (!ticksMatch) return [];
    return ticksMatch.map(Number).filter(n => !isNaN(n));
  }

  renderTicks() {
    this.ticksContainer.innerHTML = '';
    const min = Number(this.getAttribute('min') || 0);
    const max = Number(this.getAttribute('max') || 100);
    const ticks = this.tickValues.filter(v => v !== min && v !== max);

    ticks.forEach(val => {
      const percent = ((val - min) / (max - min)) * 100;
      const tick = document.createElement('div');
      tick.className = 'tick';
      tick.style.position = 'absolute';
      tick.style.left = `${percent}%`;
      this.ticksContainer.appendChild(tick);
    });
  }

  handleInput() {
    const value = parseFloat(this.input.value);
    const closestTick = this.getClosestTick(value);

    // Snap to tick
    if (
      closestTick !== null &&
      Math.abs(closestTick - value) < this.snapDistance
      //this.prevSnapValue !== closestTick
    ) {
      this.input.value = closestTick;
      this.prevSnapValue = closestTick;
      this.vibrate();
    }

    this.setBackground();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.input.value },
      })
    );
  }

  handleKeydown(event) {
    const step = parseFloat(this.input.step || 1);
    const value = parseFloat(this.input.value);
    const min = parseFloat(this.input.min || 0);
    const max = parseFloat(this.input.max || 100);

    if (event.key === 'ArrowLeft') {
      this.input.value = Math.max(min, value - step);
    } else if (event.key === 'ArrowRight') {
      this.input.value = Math.min(max, value + step);
    } else if (event.key === 'ArrowUp') {
      const next = this.tickValues.find(t => t > value);
      if (next !== undefined) {
        this.input.value = next;
        this.vibrate();
      }
    } else if (event.key === 'ArrowDown') {
      const reversed = [...this.tickValues].reverse();
      const prev = reversed.find(t => t < value);
      if (prev !== undefined) {
        this.input.value = prev;
        this.vibrate();
      }
    } else {
      return; // don't emit change for other keys
    }

    // emit event and prevent default for arrow keys
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.input.value },
      })
    );
  }

  getClosestTick(val) {
    if (!this.tickValues || this.tickValues.length === 0) return null;

    let closest = this.tickValues[0];
    let minDiff = Math.abs(val - closest);

    for (const tick of this.tickValues) {
      const diff = Math.abs(val - tick);
      if (diff < minDiff) {
        closest = tick;
        minDiff = diff;
      }
    }

    return closest;
  }

  vibrate() {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  setBackground() {
    const value = Number(this.input.value);
    const rangePercent = 100 / (this.max - this.min);
    const valuePercent = value * rangePercent;

    const tickPositions = this.tickValues?.map(v => v * rangePercent);
    const tickPositionsInGradient = tickPositions
      .filter(p => p > 0 && p < 100)
      ?.map(
        p =>
          `transparent calc(${p}% - ${
            TICK_WIDTH / 2
          }px), ${TICK_COLOR} calc(${p}% - ${
            TICK_WIDTH / 2
          }px), ${TICK_COLOR} calc(${p}% + ${
            TICK_WIDTH / 2
          }px), transparent calc(${p}% + ${TICK_WIDTH / 2}px)`
      )
      .join(', ');
    const ticksBackground = tickPositions?.length
      ? `linear-gradient(to right, ${tickPositionsInGradient}), `
      : null;

    const styles = [
      `input[type="range"]::-webkit-slider-runnable-track {
        background: ${
          ticksBackground ? ticksBackground : ''
        }linear-gradient(to right, ${COLOR} ${valuePercent}%, #ddd ${valuePercent}%);
    }`,
    ];

    this.backgroundStyle.innerHTML = styles.join('\n');
  }
}

customElements.define('string-art-range-input', StringArtRangeInput);
