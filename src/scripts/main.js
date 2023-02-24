import Player from './editor/Player.js';
import patternTypes from './pattern_types.js';
import EditorControls from './editor/EditorControls.js';
import EditorSizeControls from './editor/EditorSizeControls.js';
import { Thumbnails } from './thumbnails/Thumbnails.js';
import { deserializeConfig, serializeConfig } from './Serialize.js';
import { isShareSupported, share } from './share.js';
import { initServiceWorker } from './pwa.js';
import CanvasRenderer from './renderers/CanvasRenderer.js';
import SVGRenderer from './renderers/SVGRenderer.js';
import { downloadPatternAsSVG } from './download/SVGDownload.js';
import { downloadFile } from './download/Download.js';

window.addEventListener('error', function (event) {
  alert('Error: ' + event.message);
});

const elements = {
  canvas: document.querySelector('#canvas_panel'),
  patternLink: document.querySelector('#pattern_link'),
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

let canvasRenderer;
let patterns;

let currentPattern;
const player = new Player(document.querySelector('#player'));
const sizeControls = new EditorSizeControls({
  getCurrentSize: () => [
    elements.canvas.clientWidth,
    elements.canvas.clientHeight,
  ],
});

const thumbnails = new Thumbnails();

let controls;

window.addEventListener('load', main);

async function main() {
  initRouting();

  await initServiceWorker();

  document.body.querySelectorAll('.pattern_only').forEach(hide);
  unHide(document.querySelector('main'));

  const queryParams = new URLSearchParams(document.location.search);
  canvasRenderer =
    queryParams.get('renderer') === 'svg'
      ? new SVGRenderer(elements.canvas)
      : new CanvasRenderer(elements.canvas);

  patterns = patternTypes.map(Pattern => new Pattern(canvasRenderer));

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
        renderer: canvasRenderer,
        pattern: currentPattern,
      })
  );
  elements.playerBtn.addEventListener('click', () => {
    document.querySelectorAll('#buttons [data-toggle-for]').forEach(btn => {
      if (btn.classList.contains('active')) {
        btn.click();
      }
    });
  });

  elements.instructionsLink.addEventListener('click', e => {
    e.preventDefault();
    history.pushState({ pattern: null }, 'String Art Studio', './');
    unselectPattern();
  });

  thumbnails.addOnChangeListener(({ detail }) => {
    const pattern = findPatternById(detail.pattern);
    setCurrentPattern(pattern);
  });

  document.body.addEventListener('click', e => {
    const toggleBtn = e.target.closest('[data-toggle-for]');
    if (toggleBtn) {
      const dialogId = toggleBtn.dataset.toggleFor;

      toggleBtn.classList.toggle('active');
      const toggledElement = document.querySelector('#' + dialogId);
      toggledElement.classList.toggle('open');
      document.body.classList.toggle('dialog_' + dialogId);
      currentPattern &&
        currentPattern.draw({ position: currentPattern.position });
    }
  });
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
    renderer: canvasRenderer,
    pattern: currentPattern,
  });
  if (showShare) {
    unHide(elements.shareBtn);
  }
}

function downloadCanvas() {
  downloadFile(canvasRenderer.toDataURL(), currentPattern.name + '.png');
}

function downloadSVG() {
  downloadPatternAsSVG(currentPattern, canvasRenderer.getSize());
}

function downloadNailsImage() {
  const currentConfig = currentPattern.config;
  currentPattern.config = {
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

function onInputsChange({ withConfig = true } = {}) {
  player.update(currentPattern);
  const configQuery = withConfig ? serializeConfig(currentPattern) : null;
  history.replaceState(
    {
      pattern: currentPattern.id,
      config: configQuery,
    },
    currentPattern.name,
    `?pattern=${currentPattern.id}${
      withConfig && configQuery
        ? `&config=${encodeURIComponent(configQuery)}`
        : ''
    }`
  );
}

function setCurrentPattern(pattern, setPatternOptions) {
  selectPattern(pattern, setPatternOptions);
  history.pushState(
    { pattern: pattern.id },
    pattern.name,
    '?pattern=' + pattern.id
  );
}

function initSize() {
  sizeControls.element.addEventListener('sizechange', ({ detail }) => {
    setSize(detail);
  });
}

function setSize(size) {
  if (size.width && size.height) {
    canvasRenderer.setSize(size);
    if (!elements.canvas.classList.contains('overflow')) {
      elements.canvas.classList.add('overflow');
    }
  } else {
    elements.canvas.classList.remove('overflow');
    canvasRenderer.setSize(null);
  }

  currentPattern.draw();
}

function initRouting() {
  window.addEventListener('popstate', ({ state }) => {
    updateState(state);
  });
}

function updateState(state) {
  if (state?.pattern) {
    const pattern = findPatternById(state.pattern);
    selectPattern(pattern, {
      draw: false,
      config: state.config ? deserializeConfig(pattern, state.config) : {},
    });

    thumbnails.close();
    currentPattern.draw();
  } else {
    unselectPattern();
    thumbnails.open();
  }
}

function findPatternById(patternId) {
  const pattern = patterns.find(({ id }) => id === patternId);
  if (!pattern) {
    throw new Error(`Pattern with id "${patternId}" not found!`);
  }
  return pattern;
}

function selectPattern(pattern, { config, draw = true } = {}) {
  const isFirstTime = !currentPattern;

  currentPattern = pattern;
  if (config) {
    currentPattern.setConfig(config);
  }
  if (controls) {
    controls.destroy();
  }
  controls = new EditorControls({ pattern, config });
  controls.addEventListener('input', () => currentPattern.draw());
  controls.addEventListener('change', onInputsChange);

  if (pattern.link) {
    elements.patternLink.setAttribute('href', pattern.link);
    elements.patternLink.innerText = pattern.linkText ?? 'Example';
    unHide(elements.patternLink);
  } else {
    hide(elements.patternLink);
  }

  if (draw) {
    requestAnimationFrame(() => {
      currentPattern.draw();
    });
  }

  player.update(currentPattern, { draw: false });
  thumbnails.setCurrentPattern(pattern);
  document.title = `${pattern.name} - String Art Studio`;
  document.body.setAttribute('data-pattern', pattern.id);

  if (isFirstTime) {
    initPattern();
    document.body.querySelectorAll('.pattern_only').forEach(unHide);
  }
}

function unHide(element) {
  element.removeAttribute('hidden');
}

function hide(element) {
  element.setAttribute('hidden', 'hidden');
}

function unselectPattern() {
  currentPattern = null;
  canvasRenderer.clear();
  hide(elements.patternLink);
  thumbnails.setCurrentPattern(null);
  controls && controls.destroy();
  document.body.querySelectorAll('.pattern_only').forEach(hide);
  document.body.removeAttribute('data-pattern');
}
