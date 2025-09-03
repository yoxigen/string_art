import Player from './editor/Player';
import patternTypes from './pattern_types';
import EditorControls, {
  ControlValueChangeEventData,
} from './editor/EditorControls';
import EditorSizeControls from './editor/EditorSizeControls';
import { Thumbnails } from './thumbnails/Thumbnails';
import { deserializeConfig, serializeConfig } from './Serialize';
import { isShareSupported, share } from './share';
import { initServiceWorker } from './pwa';
import SVGRenderer from './renderers/SVGRenderer';
import { downloadPattern } from './download/Download';
import './components/components';
import type Renderer from './renderers/Renderer';
import type { Dimensions } from './types/general.types';
import { PrimitiveValue } from './types/config.types';
import Persistance from './Persistance';
import StringArt from './StringArt';
import { compareObjects } from './helpers/object_utils';
import { confirm } from './helpers/dialogs';
import Viewer from './viewer/Viewer';
import { getPatternURL } from './helpers/url_utils';
import type DownloadDialog from './components/dialogs/download_dialog/DownloadDialog';

interface SetPatternOptions {
  config?: Record<string, PrimitiveValue>;
  draw?: boolean;
  isDefaultConfig?: boolean;
}

window.addEventListener('error', function (event) {
  alert('Error:\n' + event.message + '\n\nStack:\n' + event.error.stack);
});

const elements = {
  main: document.querySelector('main'),
  downloadBtn: document.querySelector('#download_btn'),
  resetBtn: document.querySelector('#reset_btn'),
  shareBtn: document.querySelector('#share_btn'),
  playerBtn: document.querySelector('#player_btn'),
  buttons: document.querySelector('#buttons'),
  instructionsLink: document.querySelector(
    '#pattern_select_dropdown_instructions'
  ),
};

const persistance = new Persistance();
const thumbnails = new Thumbnails(persistance);

window.addEventListener('load', main);

async function main() {
  let controls: EditorControls<any>;

  initRouting();

  await initServiceWorker();

  document.body.querySelectorAll('.pattern_only').forEach(hide);
  unHide(document.querySelector('main'));

  const queryParams = new URLSearchParams(document.location.search);
  const viewer = new Viewer(
    queryParams.get('renderer') === 'svg' ? 'svg' : 'canvas'
  );
  const player = new Player(document.querySelector('#player'), viewer);

  const sizeControls = new EditorSizeControls({
    getCurrentSize: () => viewer.size,
  });

  const patterns = patternTypes.map(Pattern => new Pattern());
  type Pattern = StringArt<any>;
  let currentPattern: Pattern;

  if (history.state?.pattern) {
    updateState(history.state);
  } else {
    const queryPattern = queryParams.get('pattern');

    if (queryPattern) {
      const config = queryParams.get('config');
      updateState({ pattern: queryPattern, config });
    } else {
      thumbnails.toggle();
    }
  }

  elements.downloadBtn.addEventListener('click', () => {
    const downloadDialog = document.querySelector(
      '#download_dialog'
    ) as DownloadDialog;
    downloadDialog!.show(viewer.pattern);

    //downloadPattern(currentPattern, { size: viewer.renderer.getLogicalSize() })
  });
  // elements.downloadSVGBtn.addEventListener('click', () =>
  //   downloadPattern(currentPattern, {
  //     type: 'svg',
  //     size: viewer.renderer.getLogicalSize(),
  //   })
  // );
  // elements.downloadNailsBtn.addEventListener('click', () =>
  //   downloadNailsImage()
  // );
  // elements.downloadNailsNoNumbersBtn.addEventListener('click', () =>
  //   downloadNailsImage(false)
  // );
  elements.resetBtn.addEventListener('click', reset);
  elements.shareBtn.addEventListener(
    'click',
    async () =>
      await share({
        renderer: viewer.renderer,
        pattern: viewer.pattern,
      })
  );

  function deactivateTabs(exclude?: string[]) {
    document
      .querySelectorAll('#buttons [data-toggle-for].active')
      .forEach(btn => {
        if (
          btn instanceof HTMLElement &&
          !exclude?.includes(btn.getAttribute('data-toggle-for'))
        ) {
          btn.click();
        }
      });
  }

  elements.instructionsLink.addEventListener('click', e => {
    e.preventDefault();
    history.pushState({ pattern: null }, 'String Art Studio', './');
    unselectPattern();
  });

  thumbnails.addEventListener('select', ({ patternId }) => {
    const pattern = findPatternById(patternId);
    setCurrentPattern(pattern);
  });

  document.body.addEventListener('click', e => {
    const toggleBtn =
      e.target instanceof HTMLElement && e.target.closest('[data-toggle-for]');
    if (toggleBtn instanceof HTMLElement && toggleBtn) {
      const dialogId = toggleBtn.dataset.toggleFor;

      deactivateTabs([dialogId]);
      toggleBtn.classList.toggle('active');

      const toggledElement = document.querySelector('#' + dialogId);
      if (toggledElement) {
        toggledElement.classList.toggle('open');
        document.body.classList.toggle('dialog_' + dialogId);
        currentPattern && viewer.update();
      }
    }
  });

  persistance.addEventListener('deletePattern', ({ pattern }) => {
    const templatePattern = findPatternById(pattern.type);
    if (templatePattern) {
      templatePattern.config = pattern.config;
      setCurrentPattern(templatePattern, { isDefaultConfig: false });
    }
  });

  persistance.addEventListener('save', ({ pattern }) => {
    setCurrentPattern(pattern);
  });

  function initRouting() {
    window.addEventListener('popstate', ({ state }) => {
      updateState(state);
    });
  }

  function updateState(state?: { pattern: string; config: any }) {
    if (state?.pattern) {
      const pattern = findPatternById(state.pattern);
      if (pattern) {
        viewer.setPattern(pattern);
        selectPattern(pattern, {
          draw: false,
          config: state.config
            ? deserializeConfig(pattern, state.config)
            : null,
        });

        thumbnails.close();
        viewer.update();
      } else {
        thumbnails.open();
      }
    } else {
      unselectPattern();
      thumbnails.open();
    }
  }

  function findPatternById(patternId: string): StringArt | null {
    // @ts-ignore
    let pattern: StringArt = patterns.find(({ id }) => id === patternId);

    if (!pattern) {
      // Try from persistance
      pattern = Persistance.getPatternByID(patternId);
    }
    return pattern;
  }

  async function initPattern() {
    if (!currentPattern) {
      throw new Error("Can't init pattern - no current pattern available!");
    }

    initSize();

    elements.resetBtn.addEventListener('click', reset);
    const showShare = await isShareSupported();
    if (showShare) {
      unHide(elements.shareBtn);
    }
  }

  function downloadNailsImage(withNumbers = true) {
    // @ts-ignore
    const patternCopy = new currentPattern.constructor();

    patternCopy.config = {
      ...patternCopy.config,
      darkMode: false,
      showNails: true,
      showNailNumbers: withNumbers,
      showStrings: false,
      nailsColor: '#000000',
      backgroundColor: '#ffffff',
    };

    downloadPattern(patternCopy, {
      size: viewer.renderer.getLogicalSize(),
      filename: `${currentPattern.name} - nails map`,
    });
  }

  function reset() {
    confirm({
      title: 'Reset options',
      description: currentPattern.isTemplate
        ? 'Are you sure you wish to reset options to defaults?'
        : 'Are you sure you wish to reset to the latest saved options?',
      submit: 'Reset',
    }).then(
      () => {
        const pattern = findPatternById(currentPattern.id);
        setCurrentPattern(
          pattern,
          currentPattern.isTemplate ? { config: {} } : {}
        ); // For a template, make sure to reset the config, for saved patterns loading the pattern above gets the latest saved options
      },
      () => {}
    );
  }

  function onInputsChange({ control }: ControlValueChangeEventData<any, any>) {
    if (control.affectsStepCount !== false) {
      player.update(viewer.getStepCount());
    }
    const configQuery = serializeConfig(currentPattern);
    history.replaceState(
      {
        pattern: currentPattern.id,
        config: configQuery,
        renderer: viewer.renderer instanceof SVGRenderer ? 'svg' : undefined,
      },
      currentPattern.name,
      getPatternURL(currentPattern, {
        renderer: viewer.renderer instanceof SVGRenderer ? 'svg' : 'canvas',
        patternAsTemplate: false,
      })
    );

    setIsDefaultConfig();
  }

  function setIsDefaultConfig(value?: boolean) {
    // Determine whether the pattern is currently on its last saved (for saved patterns) or default state (for templates):
    const isDefaultConfig =
      value ?? currentPattern.isTemplate
        ? compareObjects(currentPattern.config, currentPattern.defaultConfig)
        : compareObjects(
            currentPattern.config,
            findPatternById(currentPattern.id).config
          );

    elements.main.dataset.isDefaultConfig = String(isDefaultConfig);
  }

  function setCurrentPattern(
    pattern: Pattern,
    setPatternOptions?: SetPatternOptions
  ) {
    selectPattern(pattern, setPatternOptions);
    history.pushState(
      { pattern: pattern.id },
      pattern.name,
      '?pattern=' + pattern.id
    );

    elements.main.dataset.isDefaultConfig = String(
      setPatternOptions?.isDefaultConfig !== false
    );
  }

  function initSize() {
    sizeControls.element.addEventListener(
      'sizechange',
      ({ detail: size }: CustomEvent<Dimensions | null>) => {
        viewer.setSize(size);
      }
    );
  }

  function selectPattern(
    pattern: Pattern,
    { config, draw = true }: SetPatternOptions = {}
  ) {
    const isFirstTime = !currentPattern;

    currentPattern = pattern;
    viewer.setPattern(pattern);
    if (config) {
      // @ts-ignore
      currentPattern.setConfig(config);
    }
    if (controls) {
      controls.destroy();
    }

    persistance.setPattern(currentPattern);
    controls = new EditorControls<any>(pattern.configControls, pattern.config);
    controls.addEventListener('input', ({ control, value }) => {
      currentPattern.setConfigValue(control.key, value);
      controls.config = currentPattern.config;
      viewer.update({
        redrawNails: control.affectsNails !== false,
        redrawStrings: control.affectsStrings !== false,
      });
    });
    controls.addEventListener('change', onInputsChange);

    thumbnails.setCurrentPattern(pattern);
    document.title = `${pattern.name} - String Art Studio`;
    document.body.setAttribute('data-pattern', pattern.id);

    if (isFirstTime) {
      initPattern();
    }
    document.body.querySelectorAll('.pattern_only').forEach(unHide);
    if (draw) {
      viewer.update();
    }

    player.update(viewer.getStepCount(), { draw: false });

    elements.main.dataset.isTemplate = String(currentPattern.isTemplate);
  }

  function unselectPattern() {
    viewer.setPattern(null);
    thumbnails.setCurrentPattern(null);
    controls && controls.destroy();
    document.body.querySelectorAll('.pattern_only').forEach(hide);
    document.body.removeAttribute('data-pattern');
  }
}

function unHide(element: Element) {
  element.removeAttribute('hidden');
}

function hide(element: Element) {
  element.setAttribute('hidden', 'hidden');
}
