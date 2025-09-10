import { LengthUnit } from '../types/general.types';
import EventBus from './EventBus';

const UNITS_LOCALSTORAGE_KEY = 'units';

class Preferences extends EventBus<{
  unitsChange: LengthUnit;
}> {
  #userPreferredUnits: LengthUnit;

  getUserPreferredUnits(): LengthUnit {
    if (!this.#userPreferredUnits) {
      this.#userPreferredUnits =
        localStorage.getItem(UNITS_LOCALSTORAGE_KEY) === 'inch' ? 'inch' : 'cm';
    }

    return this.#userPreferredUnits;
  }

  setUserPreferredUnits(units: LengthUnit) {
    if (this.#userPreferredUnits !== units) {
      this.#userPreferredUnits = units;
      localStorage.setItem(UNITS_LOCALSTORAGE_KEY, units);
      this.emit('unitsChange', units);
    }
  }
}

const preferences = new Preferences();
export default preferences;
