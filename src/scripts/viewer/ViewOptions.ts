import EventBus from '../helpers/EventBus';

export type InstructionsViewMode = 'auto' | 'show' | 'hide';

class ViewOptions extends EventBus<{
  instructionsModeChange: InstructionsViewMode;
  showInstructionsChange: { showInstructions: boolean };
}> {
  #showInstructions = false;
  #instructionsMode: InstructionsViewMode = 'auto';

  get instructionsMode(): InstructionsViewMode {
    return this.#instructionsMode;
  }

  set instructionsMode(mode: InstructionsViewMode) {
    if (mode !== this.#instructionsMode) {
      this.#instructionsMode = mode;
      this.emit('instructionsModeChange', mode);
    }
  }

  get showInstructions(): boolean {
    return this.#showInstructions;
  }

  set showInstructions(showInstructions: boolean) {
    if (showInstructions !== this.#showInstructions) {
      this.#showInstructions = showInstructions;
      this.emit('showInstructionsChange', { showInstructions });
    }
  }
}

const viewOptions = new ViewOptions();
export default viewOptions;
