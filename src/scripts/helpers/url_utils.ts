import { serializeConfig } from '../Serialize';
import type StringArt from '../StringArt';
import { RendererType } from '../types/stringart.types';

export function getPatternURL(
  pattern: StringArt<any>,
  {
    renderer,
    patternAsTemplate = false,
  }: {
    renderer?: RendererType;
    patternAsTemplate?: boolean;
  } = {}
): string {
  const configQuery = pattern.isDefaultConfig
    ? undefined
    : serializeConfig(pattern);

  return `?pattern=${!patternAsTemplate ? pattern.id : pattern.type}${
    configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''
  }${renderer === 'svg' ? '&renderer=svg' : ''}`;
}

export interface StringArtQueryParams {
  pattern?: string;
  config?: string;
  name?: string;
  renderer?: RendererType;
}

export function getQueryParams(): StringArtQueryParams {
  const queryParams = new URLSearchParams(document.location.search);
  return {
    pattern: queryParams.get('pattern'),
    config: queryParams.get('config'),
    name: queryParams.get('name'),
    renderer: queryParams.get('renderer') === 'svg' ? 'svg' : null,
  };
}
