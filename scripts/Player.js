export default class Player {
    constructor(parentEl) {
        this.elements = {
            step: parentEl.querySelector('#step'),
            stepInstructions: parentEl.querySelector('#step_instructions'),
            playerPosition: parentEl.querySelector('#player_position'),
            playBtn: parentEl.querySelector('#play_btn'),
            pauseBtn: parentEl.querySelector('#pause_btn')
        };
        this.stepCount = 0;
        this.position = 0;

        this.elements.playerPosition.addEventListener('input', ({ target }) => {
            this.setPosition(+target.value)
        });

        this.elements.playBtn.addEventListener('click', () => {
            this.stringArt.play();
            parentEl.classList.toggle('playing');
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            this.stringArt.pause();
            parentEl.classList.toggle('playing');
        });
    }

    update(stringArt) {
        this.stringArt = stringArt;
        this.stepCount = stringArt.getStepCount();
        this.elements.playerPosition.setAttribute('max', this.stepCount);
        this.elements.playerPosition.value = this.stepCount;
        this.setPosition(this.stepCount);
    }

    setPosition(position) {
        this.position = position;
        this.elements.step.innerText = `${position}/${this.stepCount}`;
        this.stringArt.draw({ steps: position });
    }
}