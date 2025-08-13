import EventBus from './helpers/EventBus';
import patternTypes from './pattern_types';
import StringArt from './StringArt';
import { AppData, PatternData } from './types/persistance.types';

const APP_DATA_STORAGE_KEY = 'string_art_app_data';

export default class Persistance extends EventBus<{
  newPattern: { pattern: StringArt<any> };
}> {
  elements: {
    saveBtn: HTMLButtonElement;
    saveDialog: HTMLDialogElement;
    patternNameInput: HTMLInputElement;
  };

  currentPattern: StringArt<any>;

  constructor() {
    super();

    this.elements = {
      saveBtn: document.querySelector('#save_btn'),
      saveDialog: document.querySelector('#save_dialog'),
      patternNameInput: document.querySelector('#save_dialog_name'),
    };

    this.elements.saveBtn.addEventListener('click', () => {
      const nextId = this.#getNextAvailableId();
      this.elements.patternNameInput.value = `Pattern #${nextId}`;
      this.elements.patternNameInput.select();
      this.elements.saveDialog.showModal();
    });

    document
      .querySelector('#save_dialog_cancel')
      .addEventListener('click', () => {
        this.elements.saveDialog.returnValue = '';
        this.elements.saveDialog.close();
      });

    this.elements.saveDialog.addEventListener('close', e => {
      if (this.elements.saveDialog.returnValue === 'confirm') {
        const patternName = this.elements.patternNameInput.value;

        this.savePattern({
          type: (this.currentPattern.constructor as any).type,
          config: this.currentPattern.config,
          name: patternName,
        });
      }

      // Reset the input field after closing
      this.elements.patternNameInput.value = '';
    });
  }

  setPattern(pattern: StringArt<any>) {
    this.currentPattern = pattern;
  }

  static patternDataToStringArt({
    type: patternType,
    ...patternData
  }: PatternData): StringArt<any> {
    const Pattern = patternTypes.find(({ type }) => type === patternType);
    if (Pattern == null) {
      throw new Error(`No pattern of type "${patternType}" found!`);
    }

    const pattern = new Pattern();
    Object.assign(pattern, patternData);

    return pattern;
  }

  static getSavedPatterns(): StringArt<any>[] {
    const { patterns } = this.loadAppData();
    return patterns.map(this.patternDataToStringArt);
  }

  static getPatternByID(patternID: string): StringArt<any> | null {
    const patterns = this.getSavedPatterns();
    return patterns.find(({ id }) => id === patternID);
  }

  #getNextAvailableId(): string {
    const appData = Persistance.loadAppData();
    const lastId = appData?.patterns?.length
      ? Number(appData.patterns[appData.patterns.length - 1].id)
      : 0;
    const nextId = isNaN(lastId) ? 1 : lastId + 1;
    return String(nextId);
  }

  savePattern(patternData: Omit<PatternData, 'id'>): PatternData {
    const appData = Persistance.loadAppData();
    const nextId = this.#getNextAvailableId();

    const newPatternData: PatternData = {
      ...patternData,
      id: nextId,
    };

    appData.patterns.push(newPatternData);
    this.saveAppData(appData);

    this.emit('newPattern', {
      pattern: Persistance.patternDataToStringArt(newPatternData),
    });

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

  saveAppData(appData: AppData): void {
    localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(appData));
  }
}
