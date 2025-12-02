import Player from './editor/Player';
import EditorControls, {
  ControlValueChangeEventData,
} from './editor/EditorControls';
import { Thumbnails } from './thumbnails/Thumbnails';
import { isShareSupported, share } from './share';
import { initServiceWorker } from './pwa';
import SVGRenderer from './infra/renderers/SVGRenderer';
import './components/components';
import Persistance from './Persistance';
import StringArt from './infra/StringArt';
import { confirm } from './helpers/dialogs';
import Viewer from './viewer/Viewer';
import type DownloadDialog from './components/dialogs/download_dialog/DownloadDialog';
import { findPatternById } from './helpers/pattern_utils';
import routing from './routing';
import { hide, unHide } from './helpers/dom_utils';
import info from './Info';
import 'scheduler-polyfill';
import posthog from 'posthog-js';
import { DropdownMenu } from './components/DropdownMenu';

window.addEventListener('error', function (event) {
  alert('Error:\n' + event.message + '\n\nStack:\n' + event.error.stack);
  posthog.captureException(event);
});

window.addEventListener('load', main);

async function main() {
  const elements = {
    main: document.querySelector('main'),
    resetBtn: document.querySelector('#controls_reset_btn'),
    buttons: document.querySelector('#buttons'),
    instructionsLink: document.querySelector(
      '#pattern_select_dropdown_instructions'
    ),
  };

  posthog.init('phc_hYSU225vNE9x5Xz1f9YBYf89Gzzqo0GAdXuMiu0NQII', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'always',
    persistence: 'localStorage',
  });

  const persistance = new Persistance();
  const thumbnails = new Thumbnails(persistance);

  let controls: EditorControls<any>;

  let currentPattern: Pattern;
  let showInfo = false;

  const viewer = (window['viewer'] = new Viewer());
  const player = new Player(document.querySelector('#player'), viewer);

  await initServiceWorker();

  document.body.querySelectorAll('.pattern_only').forEach(hide);

  type Pattern = StringArt<any>;

  const showShare = await isShareSupported();
  if (!showShare) {
    document.querySelector('#share_menu_item').remove();
  }

  const downloadDialog = document.querySelector(
    '#download_dialog'
  ) as DownloadDialog;

  // TODO: Return true/false whether the action should be added to the URL.
  // When URL changes, close an open dialog
  const menuActions = {
    save_as: () => persistance.showSaveAsDialog(),
    delete: () => persistance.deletePattern(),
    save: () => persistance.saveCurrentPattern(),
    rename: () => persistance.renameCurrentPattern(),
    export: () => persistance.exportAllPatterns(),
    download: () => downloadDialog!.show(viewer.pattern),
    instructions: () => showPanel('player'),
    design: () => showPanel('design'),
    info: () => showPanel('info'),
    share: () => sharePattern(),
  };

  routing.addEventListener('dialog', dialogId => {
    if (dialogId in menuActions) {
      menuActions[dialogId]();
    }
  });

  (document.querySelector('#pattern_menu') as DropdownMenu)!.addEventListener(
    'select',
    (e: CustomEvent) => {
      const menuItemValue = e.detail.value as keyof typeof menuActions;
      const itemElement = document.querySelector(
        `dropdown-menu-item[value="${menuItemValue}"]`
      );

      if (itemElement?.hasAttribute('selectable')) {
        document
          .querySelector('#pattern_menu [selected]')
          ?.removeAttribute('selected');

        itemElement.setAttribute('selected', 'selected');
      }

      const action = menuActions[menuItemValue];
      if (action) {
        action();
        posthog.capture('pattern_menu_select', {
          menu_item: menuItemValue,
        });
      } else {
        throw new Error(
          `No action available for menu item "${menuItemValue}".`
        );
      }
    }
  );

  document.body.addEventListener('click', e => {
    const toggleBtn =
      e.target instanceof HTMLElement && e.target.closest('[data-toggle-for]');
    if (toggleBtn instanceof HTMLElement && toggleBtn) {
      const dialogId = toggleBtn.dataset.toggleFor;

      toggleBtn.classList.toggle('active');

      const toggledElement = document.querySelector('#' + dialogId);
      if (toggledElement) {
        toggledElement.classList.toggle('open');
        document.body.classList.toggle('dialog_' + dialogId);
      }
    }
  });

  elements.resetBtn.addEventListener('click', reset);

  async function sharePattern() {
    await share({
      renderer: viewer.renderer,
      pattern: viewer.pattern,
    });
  }

  elements.instructionsLink.addEventListener('click', e => {
    e.preventDefault();
    routing.navigateToMain();
  });

  thumbnails.addEventListener('select', ({ patternId }) => {
    const pattern = findPatternById(patternId);
    routing.navigateToPattern(pattern);
    posthog.capture('thumbnail_select', {
      pattern: pattern.type,
      isTemplate: pattern.isTemplate,
    });
  });

  const PANELS = ['info', 'design', 'player'];

  function showPanel(panelId: string, navigateToFolder = true) {
    PANELS.forEach(panel => {
      if (panel !== panelId) {
        document.querySelector('#' + panel).classList.remove('open');
        document.body.classList.remove('dialog_' + panel);
      }
    });

    const toggledElement = document.querySelector('#' + panelId);
    if (toggledElement) {
      toggledElement.classList.toggle('open');
      document.body.classList.toggle('dialog_' + panelId);
      currentPattern && viewer.update();
    }

    if (panelId === 'info') {
      showInfo = !showInfo;

      if (showInfo) {
        info.setPattern(currentPattern, viewer.size);
      }
    }

    if (navigateToFolder) {
      routing.navigateToFolder(panelId);
    }
  }

  routing.addEventListener('folder', folder => showPanel(folder, false));

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

  persistance.addEventListener('newPattern', ({ pattern }) => {
    posthog.capture('save_new_pattern', {
      pattern: pattern.type,
      config: JSON.stringify(pattern.config),
    });
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
    if (showInfo) {
      info.setPattern(currentPattern, viewer.size);
    }
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
          enableScheduler: true,
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
    if (showInfo) {
      info.setPattern(pattern, viewer.size);
    }

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
