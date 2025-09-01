import type StringArt from '../StringArt';
import Viewer from '../viewer/Viewer';

/**
 * Represents the navigation that controls the StringArt when playing
 */
export default class Player {
  viewer: Viewer;
  elements: {
    player: HTMLElement;
    step: HTMLSpanElement;
    playerPosition: HTMLInputElement;
    playBtn: HTMLButtonElement;
    pauseBtn: HTMLButtonElement;
    text: HTMLDivElement;
  };
  stepCount: number;
  #isPlaying: boolean;
  #renderRafId: number;

  constructor(parentEl: HTMLElement, viewer: Viewer) {
    this.viewer = viewer;
    this.elements = {
      player: parentEl,
      step: parentEl.querySelector('#step'),
      //stepInstructions: parentEl.querySelector('#step_instructions'),
      playerPosition: parentEl.querySelector(
        '#player_position'
      ) as HTMLInputElement,
      playBtn: parentEl.querySelector('#play_btn'),
      pauseBtn: parentEl.querySelector('#pause_btn'),
      text: parentEl.querySelector('#player_text'),
    };
    this.stepCount = 0;
    this.#isPlaying = false;

    this.elements.playerPosition.addEventListener('input', ({ target }) => {
      if ('value' in target) {
        this.goto(+target.value);
      }
    });

    this.elements.playBtn.addEventListener('click', () => {
      this.play();
    });

    this.elements.pauseBtn.addEventListener('click', () => {
      this.pause();
    });
  }

  updateStatus(isPlaying: boolean) {
    if (this.#isPlaying !== isPlaying) {
      this.elements.player.classList.toggle('playing');
      this.#isPlaying = isPlaying;
    }
  }

  update(stepCount: number, { draw = true } = {}) {
    this.stepCount = stepCount;
    this.elements.playerPosition.setAttribute('max', String(this.stepCount));
    this.elements.step.innerText = `${this.stepCount}/${this.stepCount}`;
    this.elements.text.style.removeProperty('width');
    this.elements.text.style.width =
      (this.elements.text.clientWidth || 70) + 'px';
    this.goto(this.stepCount, { updateStringArt: draw });
  }

  updatePosition(position: number) {
    this.elements.step.innerText = `${position}/${this.stepCount}`;
    this.elements.playerPosition.value = String(position);
  }

  goto(position: number, { updateStringArt = true } = {}) {
    if (position > this.stepCount || position < 1) {
      return;
    }

    this.pause();
    this.updatePosition(position);
    if (updateStringArt) {
      this.viewer.goto(position);
    }
  }

  advance(value = 1) {
    const currentPosition = Number(this.elements.playerPosition.value);

    this.goto(
      Math.max(
        1,
        Math.min(
          this.stepCount,
          Number(this.elements.playerPosition.value) + value
        )
      )
    );
  }

  setInstructions(instructions) {
    // this.elements.stepInstructions.innerText = instructions;
  }

  play() {
    this.updateStatus(true);
    cancelAnimationFrame(this.#renderRafId);

    if (this.viewer.position === this.stepCount) {
      this.viewer.goto(0);
    }

    const self = this;

    step();

    function step() {
      if (!self.viewer.next().done) {
        self.#renderRafId = requestAnimationFrame(step);
      } else {
        self.updateStatus(false);
      }
      self.updatePosition(self.viewer.position);
    }
  }

  pause() {
    cancelAnimationFrame(this.#renderRafId);
    this.updateStatus(false);
  }

  toggle() {
    if (this.#isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
}
