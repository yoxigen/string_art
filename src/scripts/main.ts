import Player from './editor/Player';
import patternTypes from './pattern_types';
import EditorControls from './editor/EditorControls';
import EditorSizeControls from './editor/EditorSizeControls';
import { Thumbnails } from './thumbnails/Thumbnails';
import { deserializeConfig, serializeConfig } from './Serialize';
import { isShareSupported, share } from './share';
import { initServiceWorker } from './pwa';
import CanvasRenderer from './renderers/CanvasRenderer';
import SVGRenderer from './renderers/SVGRenderer';
import { downloadPatternAsSVG } from './download/SVGDownload';
import { downloadFile } from './download/Download';
import './components/components';
import type Renderer from './renderers/Renderer';
import type { Dimensions } from './types/general.types';
import { PrimitiveValue } from './types/config.types';
import Persistance from './Persistance';
import StringArt from './StringArt';
import { compareObjects } from './helpers/object_utils';
import { confirm } from './helpers/dialogs';

interface SetPatternOptions {
  config?: Record<string, PrimitiveValue>;
  draw?: boolean;
  isDefaultConfig?: boolean;
}

window.addEventListener('error', function (event) {
  alert('Error: ' + event.message);
});

const elements: { [key: string]: HTMLElement } = {
  main: document.querySelector('main'),
  canvas: document.querySelector('#canvas_panel'),
  downloadBtn: document.querySelector('#download_btn'),
  downloadSVGBtn: document.querySelector('#download_svg_btn'),
  downloadNailsBtn: document.querySelector('#download_nails_btn'),
  downloadNailsNoNumbersBtn: document.querySelector(
    '#download_nails_no_numbers_btn'
  ),
  resetBtn: document.querySelector('#reset_btn'),
  shareBtn: document.querySelector('#share_btn'),
  playerBtn: document.querySelector('#player_btn'),
  buttons: document.querySelector('#buttons'),
  instructionsLink: document.querySelector(
    '#pattern_select_dropdown_instructions'
  ),
};

let currentRenderer: Renderer;

const player = new Player(document.querySelector('#player'));
const sizeControls = new EditorSizeControls({
  getCurrentSize: () => [
    elements.canvas.clientWidth,
    elements.canvas.clientHeight,
  ],
});

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
  currentRenderer =
    queryParams.get('renderer') === 'svg'
      ? new SVGRenderer(elements.canvas)
      : new CanvasRenderer(elements.canvas);

  const patterns = patternTypes.map(Pattern => new Pattern(currentRenderer));
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

  elements.downloadBtn.addEventListener('click', () => downloadCanvas());
  elements.downloadSVGBtn.addEventListener('click', downloadSVG);
  elements.downloadNailsBtn.addEventListener('click', () =>
    downloadNailsImage()
  );
  elements.downloadNailsNoNumbersBtn.addEventListener('click', () =>
    downloadNailsImage(false)
  );
  elements.resetBtn.addEventListener('click', reset);
  elements.shareBtn.addEventListener(
    'click',
    async () =>
      await share({
        renderer: currentRenderer,
        pattern: currentPattern,
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

  elements.canvas.addEventListener('wheel', ({ deltaY }) => {
    const direction = -deltaY / Math.abs(deltaY); // Up is 1, down is -1
    player.advance(direction);
  });
  // // If just a click, advance by one. If touch is left, play until removed
  // elements.canvas.addEventListener('mousedown', () => {
  //   let timeout;

  //   const advance = () => {
  //     clearTimeout(timeout);
  //     player.advance();
  //     elements.canvas.removeEventListener('mouseup', advance);
  //   };

  //   timeout = setTimeout(() => {
  //     player.play();
  //     const stopPlay = () => {
  //       player.pause();
  //       elements.canvas.removeEventListener('mouseup', stopPlay);
  //     };
  //     elements.canvas.addEventListener('mouseup', stopPlay);
  //   }, 200);

  //   elements.canvas.addEventListener('mouseup', advance);
  // });

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
        currentPattern &&
          currentPattern.draw({ position: currentPattern.position });
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
        pattern.renderer = currentRenderer;
        selectPattern(pattern, {
          draw: false,
          config: state.config
            ? deserializeConfig(pattern, state.config)
            : null,
        });

        thumbnails.close();
        currentPattern.draw();
      } else {
        thumbnails.open();
      }
    } else {
      unselectPattern();
      thumbnails.open();
    }
  }

  function findPatternById(patternId: string): StringArt<any> | null {
    let pattern: StringArt<any> = patterns.find(({ id }) => id === patternId);

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

    window.addEventListener('resize', () => {
      if (currentPattern) {
        currentPattern.draw();
      }
    });

    elements.resetBtn.addEventListener('click', reset);
    const showShare = await isShareSupported({
      renderer: currentRenderer,
      pattern: currentPattern,
    });
    if (showShare) {
      unHide(elements.shareBtn);
    }
  }

  function downloadCanvas(filename?: string) {
    currentRenderer.disablePixelRatio();
    currentPattern.setSize(currentPattern.fixedSize);

    currentPattern.draw();

    downloadFile(
      currentRenderer.toDataURL(),
      filename ?? currentPattern.name + '.png'
    );

    // Reset to the original config from before the download:
    currentRenderer.enablePixelRatio();
    currentPattern.setSize(currentPattern.fixedSize);
    currentPattern.draw();
  }

  function downloadSVG() {
    downloadPatternAsSVG(currentPattern, currentRenderer.getSize());
  }

  function downloadNailsImage(withNumbers = true) {
    const currentConfig = currentPattern.config;
    currentPattern.config = {
      ...currentConfig,
      darkMode: false,
      showNails: true,
      showNailNumbers: withNumbers,
      showStrings: false,
      nailsColor: '#000000',
      backgroundColor: '#ffffff',
    };

    downloadCanvas(`${currentPattern.name}_nails_map.png`);

    currentPattern.config = currentConfig;
    currentPattern.draw();
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

  function onInputsChange() {
    player.update(currentPattern);
    const configQuery = serializeConfig(currentPattern);
    history.replaceState(
      {
        pattern: currentPattern.id,
        config: configQuery,
        renderer: currentRenderer instanceof SVGRenderer ? 'svg' : undefined,
      },
      currentPattern.name,
      `?pattern=${currentPattern.id}${
        configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''
      }${currentRenderer instanceof SVGRenderer ? '&renderer=svg' : ''}`
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
        setSize(size);
      }
    );
  }

  function setSize(size: Dimensions | null) {
    if (size && size.length === 2) {
      currentPattern.setSize(size);
      if (!elements.canvas.classList.contains('overflow')) {
        elements.canvas.classList.add('overflow');
      }
    } else {
      elements.canvas.classList.remove('overflow');
      currentPattern.setSize(null);
    }

    currentPattern.draw({ updateSize: false });
  }

  function selectPattern(
    pattern: Pattern,
    { config, draw = true }: SetPatternOptions = {}
  ) {
    const isFirstTime = !currentPattern;

    currentPattern = pattern;
    currentPattern.renderer = currentRenderer;
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
      currentPattern.draw({
        redrawNails: control.affectsNails !== false,
        redrawStrings: control.affectsStrings !== false,
        updateSize: false,
      });
    });
    controls.addEventListener('change', onInputsChange);

    if (draw) {
      requestAnimationFrame(() => {
        currentPattern.draw();
      });
    }

    thumbnails.setCurrentPattern(pattern);
    document.title = `${pattern.name} - String Art Studio`;
    document.body.setAttribute('data-pattern', pattern.id);

    if (isFirstTime) {
      initPattern();
      document.body.querySelectorAll('.pattern_only').forEach(unHide);
    }

    player.update(currentPattern, { draw: false });

    elements.main.dataset.isTemplate = String(currentPattern.isTemplate);
  }

  function unselectPattern() {
    currentPattern = null;
    currentRenderer.clear();
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
