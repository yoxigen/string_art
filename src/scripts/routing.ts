import EventBus from './helpers/EventBus';
import { findPatternById } from './helpers/pattern_utils';
import {
  getPatternURL,
  getQueryParams,
  StringArtQueryParams,
} from './helpers/url_utils';
import { deserializeConfig, serializeConfig } from './Serialize';
import StringArt from './StringArt';
import { PrimitiveValue } from './types/config.types';
import { RendererType } from './types/stringart.types';

export interface PatternRoute<TConfig = Record<string, PrimitiveValue>> {
  pattern: StringArt<TConfig>;
  config?: TConfig;
  renderer?: RendererType;
}

class Routing extends EventBus<{
  pattern: PatternRoute;
  main: void;
  renderer: RendererType;
}> {
  #popStateListener: (this: Window, ev: PopStateEvent) => any;
  #currentRenderer: RendererType = 'canvas';

  constructor() {
    super();

    const onPopState = (this.#popStateListener = ({
      state,
    }: {
      state: StringArtQueryParams;
    }) => {
      this.#updateFromState(state ?? {});
    });

    window.addEventListener('popstate', onPopState);
  }

  #updateFromState(state: StringArtQueryParams) {
    const {
      pattern: patternId,
      name: patternName,
      config,
      renderer = 'canvas',
    } = state;

    const actualRenderer = renderer === 'svg' ? 'svg' : 'canvas';
    if (actualRenderer !== this.#currentRenderer) {
      this.#currentRenderer = actualRenderer;
      this.emit('renderer', actualRenderer);
    }

    if (patternId) {
      const pattern = findPatternById(patternId);

      if (pattern) {
        if (patternName) {
          pattern.name = patternName;
        }

        if (config) {
          // @ts-ignore
          pattern.setConfig(deserializeConfig(pattern, config));
        }
        this.emit('pattern', {
          pattern,
          renderer: actualRenderer,
        });
      } else {
        throw new Error(`Unknown pattern with ID "${patternId}".`);
      }
    } else {
      this.emit('main', null);
    }
  }

  init() {
    if (history.state?.patternId) {
      this.#updateFromState(history.state);
    } else {
      const queryParams = getQueryParams();
      this.#updateFromState(queryParams);
    }
  }

  destroy() {
    window.removeEventListener('popstate', this.#popStateListener);
  }

  navigateToMain() {
    history.pushState({ patternId: null }, 'String Art Studio', './');
    this.emit('main', null);
  }

  navigateToPattern(
    pattern: StringArt,
    {
      renderer = 'canvas',
      replaceState = false,
    }: { renderer?: RendererType; replaceState?: boolean } = {}
  ) {
    const configQuery = pattern.isDefaultConfig
      ? undefined
      : serializeConfig(pattern);
    (replaceState ? history.replaceState : history.pushState)(
      {
        pattern: pattern.id,
        config: configQuery,
        renderer,
        name: pattern.name,
      },
      pattern.name,
      getPatternURL(pattern, {
        renderer,
        patternAsTemplate: false,
      })
    );

    if (!replaceState) {
      this.emit('pattern', { pattern, renderer });
    }
  }
}

const routing = new Routing();
export default routing;
