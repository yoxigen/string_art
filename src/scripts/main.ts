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
import './components/StringArtRangeInput';
import './components/StringArtHueInput';
import type Renderer from './renderers/Renderer';
import type { Dimensions } from './types/general.types';
import { PrimitiveValue } from './types/config.types';
import Persistance from './Persistance';
import StringArt from './StringArt';

interface SetPatternOptions {
  config?: Record<string, PrimitiveValue>;
  draw?: boolean;
}

window.addEventListener('error', function (event) {
  alert('Error: ' + event.message);
});

const elements: { [key: string]: HTMLElement } = {
  canvas: document.querySelector('#canvas_panel'),
  downloadBtn: document.querySelector('#download_btn'),
  downloadSVGBtn: document.querySelector('#download_svg_btn'),
  downloadNailsBtn: document.querySelector('#download_nails_btn'),
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

  elements.downloadBtn.addEventListener('click', downloadCanvas);
  elements.downloadSVGBtn.addEventListener('click', downloadSVG);
  elements.downloadNailsBtn.addEventListener('click', downloadNailsImage);
  elements.resetBtn.addEventListener('click', reset);
  elements.shareBtn.addEventListener(
    'click',
    async () =>
      await share({
        renderer: currentRenderer,
        pattern: currentPattern,
      })
  );
  elements.playerBtn.addEventListener('click', () => {
    document.querySelectorAll('#buttons [data-toggle-for]').forEach(btn => {
      if (btn instanceof HTMLElement && btn.classList.contains('active')) {
        btn.click();
      }
    });
  });

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

      toggleBtn.classList.toggle('active');

      const toggledElement = document.querySelector('#' + dialogId);
      toggledElement.classList.toggle('open');
      document.body.classList.toggle('dialog_' + dialogId);
      currentPattern &&
        currentPattern.draw({ position: currentPattern.position });
    }
  });

  function initRouting() {
    window.addEventListener('popstate', ({ state }) => {
      updateState(state);
    });
  }

  function updateState(state?: { pattern: string; config: any }) {
    if (state?.pattern) {
      const pattern = findPatternById(state.pattern);
      pattern.renderer = currentRenderer;
      selectPattern(pattern, {
        draw: false,
        config: state.config ? deserializeConfig(pattern, state.config) : null,
      });

      thumbnails.close();
      currentPattern.draw();
    } else {
      unselectPattern();
      thumbnails.open();
    }
  }

  function findPatternById(patternId: string): StringArt<any> {
    let pattern: StringArt<any> = patterns.find(({ id }) => id === patternId);

    if (!pattern) {
      // Try from persistance
      pattern = Persistance.getPatternByID(patternId);
    }
    if (!pattern) {
      throw new Error(`Pattern with id "${patternId}" not found!`);
    }
    return pattern;
  }

  async function initPattern() {
    if (!currentPattern) {
      throw new Error("Can't init pattern - no current pattern available!");
    }

    initSize();

    window.addEventListener(
      'resize',
      () => currentPattern && currentPattern.draw()
    );

    elements.downloadBtn.addEventListener('click', downloadCanvas);
    elements.downloadNailsBtn.addEventListener('click', downloadNailsImage);
    elements.resetBtn.addEventListener('click', reset);
    const showShare = await isShareSupported({
      renderer: currentRenderer,
      pattern: currentPattern,
    });
    if (showShare) {
      unHide(elements.shareBtn);
    }
  }

  function downloadCanvas() {
    downloadFile(currentRenderer.toDataURL(), currentPattern.name + '.png');
  }

  function downloadSVG() {
    downloadPatternAsSVG(currentPattern, currentRenderer.getSize());
  }

  function downloadNailsImage() {
    const currentConfig = currentPattern.config;
    currentPattern.config = {
      ...currentConfig,
      darkMode: false,
      showNails: true,
      showNailNumbers: true,
      showStrings: false,
      nailsColor: '#000000',
    };
    currentPattern.draw();
    downloadCanvas();

    // Reset to the config before the download:
    currentPattern.config = currentConfig;
    currentPattern.draw();
  }

  function reset() {
    if (confirm('Are you sure you wish to reset options to defaults?')) {
      setCurrentPattern(currentPattern, { config: {} });
    }
  }

  function onInputsChange() {
    player.update(currentPattern);
    const configQuery = serializeConfig(currentPattern);
    history.replaceState(
      {
        pattern: currentPattern.id,
        config: configQuery,
      },
      currentPattern.name,
      `?pattern=${currentPattern.id}${
        configQuery ? `&config=${encodeURIComponent(configQuery)}` : ''
      }`
    );
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
  }

  function initSize() {
    sizeControls.element.addEventListener(
      'sizechange',
      ({ detail }: CustomEvent<Dimensions | null>) => {
        setSize(detail);
      }
    );
  }

  function setSize(size: Dimensions | null) {
    if (size && size.length === 2) {
      currentRenderer.setSize(size);
      if (!elements.canvas.classList.contains('overflow')) {
        elements.canvas.classList.add('overflow');
      }
    } else {
      elements.canvas.classList.remove('overflow');
      currentRenderer.setSize(null);
    }

    currentPattern.draw();
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
      // @ts-ignore can't type control perfectly, since we don't have TConfig to set for EditorControls.
      currentPattern.setConfigValue(control, value);
      controls.config = currentPattern.config;
      currentPattern.draw();
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
