import StringArt from './StringArt';

export default class Persistance {
  elements: {
    saveBtn: HTMLButtonElement;
    saveDialog: HTMLDialogElement;
    patternNameInput: HTMLInputElement;
  };

  currentPattern: StringArt<any>;

  constructor() {
    this.elements = {
      saveBtn: document.querySelector('#save_btn'),
      saveDialog: document.querySelector('#save_dialog'),
      patternNameInput: document.querySelector('#save_dialog_name'),
    };

    this.elements.saveBtn.addEventListener('click', () => {
      this.elements.saveDialog.showModal();
    });

    document
      .querySelector('#save_dialog_cancel')
      .addEventListener('click', () => {
        this.elements.saveDialog.close();
      });

    this.elements.saveDialog.addEventListener('close', e => {
      if (this.elements.saveDialog.returnValue === 'confirm') {
        const patternName = this.elements.patternNameInput.value;
        console.log('User entered:', patternName);
        // You can perform further actions with the user's input here
      } else {
        console.log('Dialog cancelled or closed without submission.');
      }
      // Reset the input field after closing
      this.elements.patternNameInput.value = '';
    });
  }

  setPattern(pattern: StringArt<any>) {
    this.currentPattern = pattern;
  }
}
