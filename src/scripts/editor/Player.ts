import Viewer from '../viewer/Viewer';
import viewOptions from '../viewer/ViewOptions';

const SLOW_PLAY_SPEED = 200;

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
  #cancelNextPlayStep: Function;
  #cancelHideInstruction: Function;

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
      this.play({ restartIfAtEnd: true });
    });

    this.elements.pauseBtn.addEventListener('click', () => {
      this.pause();
    });

    viewer.addEventListener('positionChange', ({ changeBy }) =>
      this.advance(changeBy)
    );

    viewer.addEventListener('click', () =>
      this.#isPlaying ? this.pause() : this.advance()
    );
    viewer.addEventListener('touchStart', () =>
      this.play({ speed: SLOW_PLAY_SPEED })
    );
    viewer.addEventListener('touchEnd', () => this.pause());

    viewOptions.addEventListener(
      'showInstructionsChange',
      ({ showInstructions }) => {
        if (showInstructions) {
          this.#cancelHideInstruction?.();
        }
      }
    );
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
    viewOptions.showInstructions = false;
    this.goto(this.stepCount, {
      updateStringArt: draw,
      showInstructions: false,
    });
  }

  updatePosition(position: number) {
    this.elements.step.innerText = `${position}/${this.stepCount}`;
    this.elements.playerPosition.value = String(position);
  }

  goto(
    position: number,
    { updateStringArt = true, showInstructions = true } = {}
  ) {
    if (position > this.stepCount || position < 1) {
      return;
    }

    this.#cancelHideInstruction?.();
    this.pause();
    this.updatePosition(position);
    if (showInstructions) {
      viewOptions.showInstructions = true;
    }
    if (updateStringArt) {
      this.viewer.goto(position);
    }

    if (
      viewOptions.instructionsMode === 'auto' &&
      position === this.stepCount &&
      viewOptions.showInstructions
    ) {
      const hideIntructionsTimeout = setTimeout(() => {
        viewOptions.showInstructions = false;
      }, 1000);
      this.#cancelHideInstruction = () => clearTimeout(hideIntructionsTimeout);
    }
  }

  advance(value = 1) {
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

  play({
    restartIfAtEnd = false,
    speed,
  }: {
    restartIfAtEnd?: boolean;
    /**
     * speed is the time between steps when playing, in milliseconds. If not specified, steps are as fast as possible, using `requestAnimationFrame`.
     */
    speed?: number;
  } = {}) {
    const isAtEnd = this.viewer.position === this.stepCount;

    if (isAtEnd && !restartIfAtEnd) {
      return;
    }

    this.updateStatus(true);
    this.#cancelNextPlayStep?.();

    viewOptions.showInstructions = false;
    // if (
    //   viewOptions.instructionsMode === 'auto' ||
    //   viewOptions.instructionsMode === 'show'
    // ) {
    //   viewOptions.showInstructions = true;
    // }

    if (isAtEnd) {
      this.viewer.goto(0);
    }

    const step = () => {
      if (!this.viewer.next().done) {
        if (speed) {
          const stepTimeout = setTimeout(step, speed);
          this.#cancelNextPlayStep = () => clearTimeout(stepTimeout);
        } else {
          const stepRafId = requestAnimationFrame(step);
          this.#cancelNextPlayStep = () => cancelAnimationFrame(stepRafId);
        }
      } else {
        this.updateStatus(false);
      }
      this.updatePosition(this.viewer.position);
    };
    step();
  }

  pause() {
    this.#cancelNextPlayStep?.();
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
