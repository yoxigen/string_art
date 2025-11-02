import patternTypes from '../pattern_types';
import Persistance from '../Persistance';
import StringArt from '../infra/StringArt';

export function createPatternInstance(type: string): StringArt {
  let Pattern = patternTypes.find(({ type: _type }) => _type === type);
  if (!Pattern) {
    throw new Error(`Unknown pattern type, "${type}"!`);
  }

  // @ts-ignore
  return new Pattern();
}

/**
 *
 * @returns Returns an instance of each pattern type, with default configs
 */
export function getAllPatternsTypes(): StringArt[] {
  // @ts-ignore
  const patterns: StringArt[] = patternTypes.map(
    PatternType => new PatternType()
  );
  return patterns;
}

/**
 * Finds a pattern with the given ID, can be a template or a saved pattern
 */
export function findPatternById(patternId: string): StringArt | null {
  let pattern = patternTypes.find(({ type }) => type === patternId);

  if (pattern) {
    // @ts-ignore
    return new pattern();
  } else {
    return Persistance.getPatternByID(patternId);
  }
}
