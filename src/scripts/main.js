import Player from './editor/Player.js';
import patternTypes from './pattern_types.js';
import EditorControls from './editor/EditorControls.js';
import EditorSizeControls from './editor/EditorSizeControls.js';
import { Thumbnails } from './thumbnails/Thumbnails.js';

const elements = {
  canvas: document.querySelector('canvas'),
  patternLink: document.querySelector('#pattern_link'),
  downloadBtn: document.querySelector('#download_btn'),
  downloadNailsBtn: document.querySelector('#download_nails_btn'),
  resetBtn: document.querySelector('#reset_btn'),
  buttons: document.querySelector('#buttons'),
};

const patterns = patternTypes.map(Pattern => new Pattern(elements.canvas));

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
let activeDialog;

window.addEventListener('load', main);

function main() {
  initRouting();
  initSize();

  if (history.state?.pattern) {
    updateState(history.state);
  } else {
    const queryParams = new URLSearchParams(document.location.search);
    const queryPattern = queryParams.get('pattern');

    if (queryPattern) {
      const config = queryParams.get('config');
      updateState({ pattern: queryPattern, config });
    } else {
      selectPattern(patterns[0]);
    }
  }

  window.addEventListener('resize', () => currentPattern.draw());

  elements.canvas.addEventListener('click', () => {
    player.toggle();
  });

  elements.downloadBtn.addEventListener('click', downloadCanvas);
  elements.downloadNailsBtn.addEventListener('click', downloadNailsImage);
  elements.resetBtn.addEventListener('click', reset);

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
      currentPattern.draw({ position: currentPattern.position });
    }
  });
}

function downloadCanvas() {
  const downloadLink = document.createElement('a');
  downloadLink.download = currentPattern.name + '.png';
  downloadLink.href = elements.canvas.toDataURL('image/png');
  downloadLink.setAttribute('target', 'download');
  downloadLink.click();
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
  if (confirm('Are you sure you wish to reset to defaults?')) {
    setCurrentPattern(currentPattern, { config: {} });
  }
}

function onInputsChange({ withConfig = true } = {}) {
  player.update(currentPattern);
  const configQuery = withConfig ? JSON.stringify(currentPattern.config) : null;
  history.replaceState(
    {
      pattern: currentPattern.id,
      config: configQuery,
    },
    currentPattern.name,
    `?pattern=${currentPattern.id}${
      withConfig ? `&config=${encodeURIComponent(configQuery)}` : ''
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

function setSize({ width, height }) {
  elements.canvas.removeAttribute('width');
  elements.canvas.removeAttribute('height');

  if (width && height) {
    elements.canvas.style.width = `${width}px`;
    elements.canvas.style.height = `${height}px`;
    if (!elements.canvas.parentElement.classList.contains('overflow')) {
      elements.canvas.parentElement.classList.add('overflow');
    }
  } else {
    elements.canvas.parentElement.classList.remove('overflow');
    elements.canvas.removeAttribute('style');
  }

  currentPattern.draw();
}

function initRouting() {
  window.addEventListener('popstate', ({ state }) => {
    updateState(state);
  });
}

function updateState(state) {
  const pattern = findPatternById(state.pattern);
  selectPattern(pattern, {
    draw: false,
    config: state.config ? JSON.parse(state.config) : {},
  });

  currentPattern.draw();
}

function findPatternById(patternId) {
  const pattern = patterns.find(({ id }) => id === patternId);
  if (!pattern) {
    throw new Error(`Pattern with id "${patternId} not found!`);
  }
  return pattern;
}

function selectPattern(pattern, { config, draw = true } = {}) {
  currentPattern = pattern;
  if (config) {
    currentPattern.config = config;
  }
  if (controls) {
    controls.destroy();
  }
  controls = new EditorControls({ pattern, config });
  controls.addEventListener('input', () => currentPattern.draw());
  controls.addEventListener('change', onInputsChange);

  elements.patternLink.setAttribute('href', pattern.link);
  if (draw) {
    currentPattern.draw();
  }
  player.update(currentPattern, { draw: false });
  thumbnails.setCurrentPattern(pattern);
  document.title = `${pattern.name} - String Art Studio`;
}
