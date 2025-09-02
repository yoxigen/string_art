import { serializeConfig } from '../Serialize';
import type StringArt from '../StringArt';

export function getPatternURL(
  pattern: StringArt<any>,
  {
    renderer,
    patternAsTemplate = false,
  }: {
    renderer?: 'svg' | 'canvas';
    patternAsTemplate?: boolean;
  } = {}
): string {
  const configQuery = serializeConfig(pattern);

  return `?pattern=${!patternAsTemplate ? pattern.id : pattern.type}${
    configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''
  }${renderer === 'svg' ? '&renderer=svg' : ''}`;
}
