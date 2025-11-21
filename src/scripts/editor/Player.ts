import Viewer from '../viewer/Viewer';
import viewOptions from '../viewer/ViewOptions';

const SLOW_PLAY_SPEED = 200;
enum PlayerMode {
  CONTINUOUS,
  STEPS,
}

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
    prevBtn: HTMLButtonElement;
    nextBtn: HTMLButtonElement;
    startBtn: HTMLButtonElement;
    stepDirections: HTMLDivElement;
    stepDirectionsFrom: HTMLDivElement;
    stepDirectionsTo: HTMLDivElement;
    continuousMode: HTMLDivElement;
    stepsMode: HTMLDivElement;
    instructionsToggleBtn: HTMLButtonElement;
  };
  stepCount: number;
  #isPlaying: boolean;
  #cancelNextPlayStep: Function;
  #cancelHideInstruction: Function;
  mode: PlayerMode = PlayerMode.STEPS;

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
      prevBtn: parentEl.querySelector('#player_prev_btn'),
      nextBtn: parentEl.querySelector('#player_next_btn'),
      startBtn: parentEl.querySelector('#player_start_btn'),
      stepDirections: parentEl.querySelector('#player_step_directions'),
      stepDirectionsFrom: parentEl.querySelector(
        '#player_step_directions_from'
      ),
      stepDirectionsTo: parentEl.querySelector('#player_step_directions_to'),
      continuousMode: parentEl.querySelector('#player_continuous'),
      stepsMode: parentEl.querySelector('#player_steps'),
      instructionsToggleBtn: parentEl.querySelector(
        '#player_instructions_toggle_btn'
      ),
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

    this.elements.startBtn.addEventListener('click', () => {
      this.gotoStart();
    });

    this.elements.prevBtn.addEventListener('click', () => {
      this.prev();
    });

    this.elements.nextBtn.addEventListener('click', () => {
      this.next();
    });

    this.elements.instructionsToggleBtn.addEventListener('click', () => {
      const shouldShowInstructions = !viewOptions.showInstructions;
      viewOptions.showInstructions = shouldShowInstructions;
      if (shouldShowInstructions) {
        this.gotoStart();
      } else {
        this.gotoEnd();
      }
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
          this.elements.player.classList.add('with_steps');
        } else {
          this.elements.player.classList.remove('with_steps');
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
    this.#updateDirections();
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
      this.#updateDirections();
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

  prev() {
    viewOptions.showInstructions = true;
    this.viewer.goto(this.viewer.position - 1);
    this.#updateDirections();
  }

  next() {
    if (this.viewer.position === this.stepCount) {
      viewOptions.showInstructions = false;
      this.elements.nextBtn.setAttribute('disabled', 'disabled');
    } else {
      viewOptions.showInstructions = true;
      this.viewer.goto(this.viewer.position + 1);
      this.#updateDirections();
    }
  }

  gotoStart() {
    viewOptions.showInstructions = true;
    this.viewer.goto(0);
    this.#updateDirections();
  }

  gotoEnd() {
    this.viewer.goto(this.stepCount);
    this.#updateDirections();
  }

  #updateDirections() {
    this.updatePosition(this.viewer.position);
    const directions = this.viewer.getLastStringNailNumbers();

    if (directions) {
      this.elements.stepDirectionsFrom.textContent = directions[0].toString();
      this.elements.stepDirectionsTo.textContent = directions[1].toString();
      this.elements.playerPosition.value = this.viewer.position.toString();
    }

    if (this.viewer.position === 1) {
      this.elements.prevBtn.setAttribute('disabled', 'disabled');
      this.elements.startBtn.setAttribute('disabled', 'disabled');
      this.elements.nextBtn.removeAttribute('disabled');
    } else {
      this.elements.prevBtn.removeAttribute('disabled');
      this.elements.startBtn.removeAttribute('disabled');

      if (this.viewer.position === this.stepCount) {
        this.elements.nextBtn.setAttribute('disabled', 'disabled');
      } else {
        this.elements.nextBtn.removeAttribute('disabled');
      }
    }
  }
}
