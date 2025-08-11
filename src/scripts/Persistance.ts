import patternTypes from './pattern_types';
import StringArt from './StringArt';
import { AppData, PatternData } from './types/persistance.types';

const APP_DATA_STORAGE_KEY = 'string_art_app_data';

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

        const newPattern = this.savePattern({
          type: this.currentPattern.id,
          config: this.currentPattern.config,
          name: patternName,
        });
        console.log('Saved pattern:', newPattern);
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

  static PatternDataToStringArt(patternData: PatternData): StringArt<any> {
    const Pattern = patternTypes.find(({ type }) => type === patternData.type);
    if (Pattern == null) {
      throw new Error(`No pattern of type "${patternData.type}" found!`);
    }

    const stringArt = new Pattern();
  }

  static getSavedPatterns(): StringArt<any>[] {
    const { patterns } = this.loadAppData();
  }

  static savePattern(patternData: Omit<PatternData, 'id'>): PatternData {
    const newPatternData: PatternData = {
      ...patternData,
      id: crypto.randomUUID(),
    };
    const appData = this.loadAppData();
    appData.patterns.push(newPatternData);
    this.saveAppData(appData);

    return newPatternData;
  }

  static loadAppData(): AppData {
    const rawData = localStorage.getItem(APP_DATA_STORAGE_KEY);
    try {
      return rawData ? JSON.parse(rawData) : { patterns: [] };
    } catch (error) {
      throw new Error(
        'App data is corrupted, failed to load it. ' + error.message
      );
    }
  }

  static saveAppData(appData: AppData): void {
    localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
  }
}
