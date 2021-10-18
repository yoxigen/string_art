export default class Player {
    constructor(parentEl) {
        this.elements = {
            player: parentEl,
            step: parentEl.querySelector('#step'),
            stepInstructions: parentEl.querySelector('#step_instructions'),
            playerPosition: parentEl.querySelector('#player_position'),
            playBtn: parentEl.querySelector('#play_btn'),
            pauseBtn: parentEl.querySelector('#pause_btn')
        };
        this.stepCount = 0;

        this.elements.playerPosition.addEventListener('input', ({ target }) => {
            this.setPosition(+target.value)
        });

        this.elements.playBtn.addEventListener('click', () => {
            this.play();
            this.togglePlaying();
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            this.pause();
            this.togglePlaying();
        });
    }

    togglePlaying() {
        this.elements.player.classList.toggle('playing');
        this._isPlaying = !this._isPlaying;
    }

    update(stringArt) {
        this.stringArt = stringArt;
        this.stepCount = stringArt.getStepCount();
        this.elements.playerPosition.setAttribute('max', this.stepCount);
        this.setPosition(this.stepCount);
    }

    updatePosition(position) {
        this.elements.step.innerText = `${position}/${this.stepCount}`;
        this.elements.playerPosition.value = position;
    }
    setPosition(position) {
        this.updatePosition(position);
        this.stringArt.goto(position);
    }

    setInstructions(instructions) {
        this.elements.stepInstructions.innerText = instructions;
    }

    play() {
        this._isPlaying = true;
        cancelAnimationFrame(this.renderRafId);

        if (this.stringArt.position === this.stepCount) {
            this.stringArt.goto(0);
        }

        const self = this;

        step();
            
        function step() {
            if (!self.stringArt.drawNext().done) {
                self.renderRafId = requestAnimationFrame(step);
            } else {
                self.togglePlaying();
            }
            self.updatePosition(self.stringArt.position);
        }
    }

    pause() {
        cancelAnimationFrame(this.renderRafId);
        this._isPlaying = false;
    }

    toggle() {
        if (this._isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
}