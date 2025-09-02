import { serializeConfig } from '../Serialize';
import type StringArt from '../StringArt';

export function getPatternURL(
  pattern: StringArt<any>,
  {
    renderer,
  }: {
    renderer?: 'svg' | 'canvas';
  } = {}
): string {
  const configQuery = serializeConfig(pattern);

  return `?pattern=${pattern.isTemplate ? pattern.id : pattern.type}${
    configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''
  }${renderer === 'svg' ? '&renderer=svg' : ''}`;
}
