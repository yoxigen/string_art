import { serializeConfig } from '../Serialize';
import type StringArt from '../infra/StringArt';
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

export type Folder = 'design' | 'instructions' | 'info';

export interface StringArtQueryParams {
  pattern?: string;
  config?: string;
  name?: string;
  renderer?: RendererType;
  dialog?: string;
  folder?: Folder;
}

export function getQueryParams(): StringArtQueryParams {
  const queryParams = new URLSearchParams(document.location.search);
  return {
    pattern: queryParams.get('pattern'),
    config: queryParams.get('config'),
    name: queryParams.get('name'),
    renderer: queryParams.get('renderer') === 'svg' ? 'svg' : null,
    dialog: queryParams.get('dialog'),
  };
}

export function serializeQueryParams(params: StringArtQueryParams): string {
  const urlParams = new URLSearchParams();

  for (const key in params) {
    const value = params[key];
    if (value) {
      urlParams.append(key, value);
    }
  }

  return urlParams.toString();
}

export function getCurrentFolder(): string {
  return document.location.pathname.replace(/\/$/, '');
}
