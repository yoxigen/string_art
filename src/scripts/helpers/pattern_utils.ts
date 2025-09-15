import patternTypes from '../pattern_types';
import StringArt from '../StringArt';

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
