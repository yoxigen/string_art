import EventBus from './helpers/EventBus';
import patternTypes from './pattern_types';
import StringArt, { Pattern } from './StringArt';
import { AppData, PatternData } from './types/persistance.types';
import type InputDialog from './components/dialogs/InputDialog';
import { confirm, prompt } from './helpers/dialogs';

const APP_DATA_STORAGE_KEY = 'string_art_app_data';

export default class Persistance extends EventBus<{
  newPattern: { pattern: StringArt<any> };
  deletePattern: { pattern: StringArt<any> };
  save: { pattern: StringArt<any> };
}> {
  elements: {
    saveDialog: InputDialog;
  };

  currentPattern: StringArt<any>;

  constructor() {
    super();

    this.elements = {
      saveDialog: document.querySelector('#save_dialog'),
    };

    document.querySelector('#pattern_menu').addEventListener('select', e => {
      // @ts-ignore
      switch (e.detail.value) {
        case 'save_as':
          this.#showSaveAsDialog();
          break;
        case 'delete':
          this.deletePattern();
          break;
        case 'save':
          this.saveCurrentPattern();
          break;
        case 'rename':
          this.renameCurrentPattern();
          break;
      }
    });

    document.querySelector('#save_btn').addEventListener('click', () => {
      if (this.currentPattern.isTemplate) {
        this.#showSaveAsDialog();
      } else {
        this.saveCurrentPattern();
      }
    });
  }

  #showSaveAsDialog() {
    const nextId = this.#getNextAvailableId();
    const defaultName = `Pattern #${nextId}`;

    prompt({
      title: 'Save pattern',
      description: 'Name this pattern:',
      submit: 'Save',
      value: defaultName,
    }).then(
      patternName => {
        this.saveNewPattern({
          type: this.currentPattern.type,
          config: this.currentPattern.config,
          name:
            patternName == null || patternName === ''
              ? defaultName
              : patternName,
        });
      },
      () => {}
    );
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

  static getPatternByID(patternId: string): StringArt<any> | null {
    const patternData = this.loadPatternDataById(patternId);
    return patternData ? this.patternDataToStringArt(patternData) : null;
  }

  static loadPatternDataById(patternId: string): PatternData | null {
    const { patterns } = this.loadAppData();
    return patterns.find(({ id }) => id === patternId);
  }

  #getNextAvailableId(): string {
    const appData = Persistance.loadAppData();
    const lastId = appData?.patterns?.length
      ? Number(appData.patterns[appData.patterns.length - 1].id)
      : 0;
    const nextId = isNaN(lastId) ? 1 : lastId + 1;
    return String(nextId);
  }

  saveNewPattern(patternData: Omit<PatternData, 'id'>): PatternData {
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

  savePattern(patternData: PatternData) {
    const appData = Persistance.loadAppData();

    const patternIndex = appData.patterns.findIndex(
      ({ id }) => id === this.currentPattern.id
    );
    if (patternIndex !== -1) {
      appData.patterns[patternIndex] = patternData;
      this.saveAppData(appData);

      this.emit('save', {
        pattern: Persistance.patternDataToStringArt(patternData),
      });
    }
  }

  saveCurrentPattern() {
    const newPatternData: PatternData = {
      id: this.currentPattern.id,
      name: this.currentPattern.name,
      type: this.currentPattern.type,
      config: this.currentPattern.config,
    };

    this.savePattern(newPatternData);
    return newPatternData;
  }

  renameCurrentPattern() {
    prompt({
      title: 'Rename',
      description: 'Name this pattern:',
      submit: 'Save',
      value: this.currentPattern.name,
    }).then(newPatternName => {
      if (newPatternName !== this.currentPattern.name) {
        const patternData = Persistance.loadPatternDataById(
          this.currentPattern.id
        );
        patternData.name = newPatternName;
        this.savePattern(patternData);
      }

      this.currentPattern.name = newPatternName;
    });
  }

  deletePattern() {
    confirm({
      title: 'Delete pattern',
      description: 'Are you sure you wish to delete this pattern?',
      submit: 'Delete',
      type: 'error',
    }).then(
      () => {
        const appData = Persistance.loadAppData();
        const patternIndex = appData.patterns.findIndex(
          ({ id }) => id === this.currentPattern.id
        );
        if (patternIndex === -1) {
          throw new Error(
            `Can't delete pattern with ID "${this.currentPattern.id}", it's not found!`
          );
        }

        const pattern = appData.patterns.splice(patternIndex, 1)[0];
        this.saveAppData(appData);

        this.emit('deletePattern', {
          pattern: Persistance.patternDataToStringArt(pattern),
        });
      },
      () => {}
    );
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
