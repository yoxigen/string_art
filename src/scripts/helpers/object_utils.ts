/**
 * Returns true if the two objects have the same values. Deep compares the objects.
 */
export function compareObjects(
  obj1: Object,
  obj2: Object,
  /**
   * An array of keys to compare. If not specified, all keys are compared.
   */
  props?: ReadonlyArray<string>
): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    if ((obj1 === null) !== (obj2 === null)) {
      return false;
    }

    if (obj1 instanceof Array && obj2 instanceof Array) {
      if (obj1.length !== obj2.length) {
        return false;
      }

      for (let i = 0; i < obj1.length; i++) {
        if (!compareObjects(obj1[i], obj2[i])) {
          return false;
        }
      }

      return true;
    }

    if (!props) {
      props = Object.keys(obj1);
      if (props.length !== Object.keys(obj2).length) {
        return false;
      }
    }

    if (props && props.some(p => !compareObjects(obj1[p], obj2[p]))) {
      return false;
    }

    return true;
  }

  return obj1 === obj2;
}

/**
 * Maps the keys of an object. The mapped accepts the original key and the value of that property
 * @returns
 */
export function mapKeys<T extends Record<string, any>, K extends string>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => K
): Record<K, T[keyof T]> {
  const mappedObj = {} as Record<K, any>;
  Object.entries(obj).forEach(
    ([key, value]) => (mappedObj[mapper(key, value)] = value)
  );
  return mappedObj;
}
