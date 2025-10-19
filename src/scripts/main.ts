import Player from './editor/Player';
import EditorControls, {
  ControlValueChangeEventData,
} from './editor/EditorControls';
import { Thumbnails } from './thumbnails/Thumbnails';
import { isShareSupported, share } from './share';
import { initServiceWorker } from './pwa';
import SVGRenderer from './renderers/SVGRenderer';
import './components/components';
import Persistance from './Persistance';
import StringArt from './StringArt';
import { confirm } from './helpers/dialogs';
import Viewer from './viewer/Viewer';
import type DownloadDialog from './components/dialogs/download_dialog/DownloadDialog';
import { findPatternById } from './helpers/pattern_utils';
import routing from './routing';
import { hide, unHide } from './helpers/dom_utils';
import info from './Info';

window.addEventListener('error', function (event) {
  alert('Error:\n' + event.message + '\n\nStack:\n' + event.error.stack);
});

window.addEventListener('load', main);

async function main() {
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

  let controls: EditorControls<any>;

  let currentPattern: Pattern;
  const viewer = new Viewer();
  const player = new Player(document.querySelector('#player'), viewer);

  await initServiceWorker();

  document.body.querySelectorAll('.pattern_only').forEach(hide);

  type Pattern = StringArt<any>;

  const showShare = await isShareSupported();
  if (showShare) {
    unHide(elements.shareBtn);
  }

  elements.downloadBtn.addEventListener('click', () => {
    const downloadDialog = document.querySelector(
      '#download_dialog'
    ) as DownloadDialog;
    downloadDialog!.show(viewer.pattern);
  });

  elements.resetBtn.addEventListener('click', reset);
  elements.shareBtn.addEventListener(
    'click',
    async () =>
      await share({
        renderer: viewer.renderer,
        pattern: viewer.pattern,
      })
  );

  elements.instructionsLink.addEventListener('click', e => {
    e.preventDefault();
    routing.navigateToMain();
  });

  thumbnails.addEventListener('select', ({ patternId }) => {
    const pattern = findPatternById(patternId);
    routing.navigateToPattern(pattern);
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
      routing.navigateToPattern(templatePattern);
    }
  });

  persistance.addEventListener('save', ({ pattern }) => {
    routing.navigateToPattern(pattern);
  });

  unHide(document.querySelector('main'));
  initRouting();

  function initRouting() {
    routing.addEventListener('pattern', ({ pattern, renderer }) => {
      selectPattern(pattern);
      viewer.setPattern(pattern);
      thumbnails.close();
    });

    routing.addEventListener('main', () => {
      thumbnails.open();
      unselectPattern();
    });

    routing.init();
  }

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
        routing.navigateToPattern(pattern);
      },
      () => {}
    );
  }

  function onInputsChange({ control }: ControlValueChangeEventData<any, any>) {
    if (control.affectsStepCount !== false) {
      player.update(viewer.getStepCount());
    }
    routing.navigateToPattern(currentPattern, {
      renderer: viewer.renderer instanceof SVGRenderer ? 'svg' : undefined,
      replaceState: true,
    });

    setIsDefaultConfig();
    info.update(currentPattern, viewer.size);
  }

  function setIsDefaultConfig() {
    elements.main.dataset.isDefaultConfig = String(
      currentPattern.isDefaultConfig
    );
  }

  function selectPattern(pattern: Pattern) {
    currentPattern = pattern;

    viewer.setPattern(pattern);
    controls?.destroy();

    persistance.setPattern(currentPattern);
    controls = new EditorControls<any>(pattern.configControls, pattern.config);
    controls.addEventListener('input', ({ control, value }) => {
      if (currentPattern) {
        currentPattern.setConfigValue(control.key, value);
        controls.config = currentPattern.config;
        viewer.update({
          redrawNails: control.affectsNails !== false,
          redrawStrings: control.affectsStrings !== false,
        });
      }
    });
    controls.addEventListener('change', onInputsChange);

    thumbnails.setCurrentPattern(pattern);
    document.title = `${pattern.name} - String Art Studio`;
    document.body.setAttribute('data-pattern', pattern.id);

    document.body.querySelectorAll('.pattern_only').forEach(unHide);
    viewer.update();

    player.update(viewer.getStepCount(), { draw: false });

    elements.main.dataset.isTemplate = String(currentPattern.isTemplate);
    setIsDefaultConfig();
  }

  function unselectPattern() {
    currentPattern = null;
    viewer.setPattern(null);
    thumbnails.setCurrentPattern(null);
    controls && controls.destroy();
    document.body.querySelectorAll('.pattern_only').forEach(hide);
    document.body.removeAttribute('data-pattern');
  }
}
