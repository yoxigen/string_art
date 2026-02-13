import EventBus from './helpers/EventBus';
import { findPatternById } from './helpers/pattern_utils';
import {
  Folder,
  getPatternURL,
  getQueryParams,
  serializeQueryParams,
  StringArtQueryParams,
} from './helpers/url_utils';
import StringArt from './infra/StringArt';
import { deserializeConfig, serializeConfig } from './Serialize';
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
  dialogClosed: string;
  dialog: string;
  folder: Folder;
}> {
  #popStateListener: (this: Window, ev: PopStateEvent) => any;
  #currentRenderer: RendererType = 'canvas';
  #currentDialog: string | null = null;
  #currentFolder: string | null = null;

  constructor() {
    super();

    const onPopState = (this.#popStateListener = ({
      state,
    }: {
      state: StringArtQueryParams;
    }) => {
      this.#updateFromState(state ?? {});
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', onPopState);
    }
  }

  #updateFromState(state: StringArtQueryParams) {
    const {
      pattern: patternId,
      name: patternName,
      config,
      renderer = 'canvas',
      dialog,
      folder,
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

    if (dialog && dialog !== this.#currentDialog) {
      this.navigateToDialog(dialog, false);
    } else if (this.#currentDialog && !dialog) {
      this.closeDialog(false);
    }

    if (folder != this.#currentFolder) {
      this.emit('folder', (this.#currentFolder = folder ?? 'design'));
      this.#currentFolder = folder;
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
    const setHistoryState = (
      replaceState ? history.replaceState : history.pushState
    ).bind(history);

    setHistoryState(
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

    if (this.#currentDialog) {
      this.closeDialog(false);
    }

    this.emit('folder', 'design');
  }

  navigateToFolder(folder: string) {
    this.#currentFolder = folder;
    history.pushState(
      {
        ...history.state,
        folder,
      },
      null,
      `/${folder === 'design' ? '' : folder}${document.location.search}`
    );
  }

  navigateToDialog(dialogId: string, pushState = true) {
    const params = getQueryParams();
    if (this.#currentDialog) {
      if (this.#currentDialog != dialogId) {
        this.emit('dialogClosed', params.dialog);
        this.#currentDialog = null;
      } else {
        return;
      }
    }

    if (pushState) {
      if (dialogId) {
        params.dialog = dialogId;
      } else {
        if (!params.dialog) {
          return;
        }
        delete params.dialog;
      }

      history.pushState(
        { ...params, folder: history.state.folder },
        null,
        `/${
          history.state.folder === 'design' || !history.state.folder
            ? ''
            : history.state.folder
        }?${serializeQueryParams(params)}`
      );
    }

    if (dialogId) {
      this.#currentDialog = dialogId;
      this.emit('dialog', dialogId);
    }
  }

  closeDialog(setState = true) {
    if (this.#currentDialog) {
      this.emit('dialogClosed', this.#currentDialog);
      this.#currentDialog = null;
      if (setState) {
        history.back();
      }
    }
  }
}

const routing = new Routing();
export default routing;
