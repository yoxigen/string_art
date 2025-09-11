import patternTypes from '../pattern_types';
import CanvasRenderer from '../renderers/CanvasRenderer';
import type StringArt from '../StringArt';
import Persistance from '../Persistance';
import EventBus from '../helpers/EventBus';

const THUMBNAIL_WIDTH_PX = '100px';
const MINIMIZED_CLASS = 'minimized';

export class Thumbnails extends EventBus<{ select: { patternId: string } }> {
  elements: Record<string, HTMLElement> = {
    root: document.querySelector('#pattern_select_panel'),
    thumbnails: document.querySelector('#thumbnails'),
    toggleBtn: document.querySelector('#pattern_select_btn'),
    dropdown: document.querySelector('#pattern_select_dropdown'),
    patternName: document.querySelector('#pattern_name'),
  };

  pattern: StringArt<any>;
  thumbnailsRendered = false;
  _onClickOutside: (e: MouseEvent) => void;

  constructor(persistance: Persistance) {
    super();

    this.elements.toggleBtn.addEventListener('click', () => this.toggle());

    persistance.addEventListener('newPattern', ({ pattern }) => {
      if (this.isOpen) {
        this.createThumbnails();
      } else {
        this.thumbnailsRendered = false;
      }

      this.setCurrentPattern(pattern);
      this.emit('select', { patternId: pattern.id });
    });

    persistance.addEventListener('save', ({ pattern }) => {
      if (this.isOpen) {
        this.createThumbnails();
      } else {
        this.thumbnailsRendered = false;
      }

      this.setCurrentPattern(pattern);
    });

    persistance.addEventListener('deletePattern', ({ pattern }) => {
      if (this.isOpen) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-pattern="${pattern.id}"]`
        );
        thumbnail.remove();
      } else {
        this.thumbnailsRendered = false;
      }
    });

    this.elements.thumbnails.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const link =
        e.target instanceof HTMLElement &&
        (e.target.closest('[data-pattern]') as HTMLElement);

      if (!link) {
        return false;
      }

      this.emit('select', { patternId: link.dataset.pattern });

      this.toggle();
    });
  }

  get isOpen(): boolean {
    return !this.elements.root.classList.contains(MINIMIZED_CLASS);
  }

  toggle() {
    if (!this.isOpen) {
      this.open();
    } else if (this.pattern) {
      this.close();
    }
  }

  open() {
    if (!this.isOpen) {
      this.elements.root.classList.remove(MINIMIZED_CLASS);
      if (!this.thumbnailsRendered) {
        this.createThumbnails();
        this.thumbnailsRendered = true;
      }

      this._onClickOutside = e => {
        if (
          e.target instanceof HTMLElement &&
          !e.target.closest('#pattern_select_panel')
        ) {
          this.toggle();
        }
      };

      document.body.addEventListener('mousedown', this._onClickOutside);
    }
  }

  close() {
    if (this.isOpen) {
      this.elements.root.classList.add(MINIMIZED_CLASS);
      document.body.removeEventListener('mousedown', this._onClickOutside);
      this._onClickOutside = null;
    }
  }

  setCurrentPattern(pattern: StringArt<any>) {
    this.pattern = pattern;
    this.elements.patternName.innerText = pattern?.name ?? 'Choose a pattern';
  }

  #createThumbnailsSection(title: string, patterns: StringArt[]): void {
    const section = document.createElement('section');

    const sectionTitle = document.createElement('h3');
    sectionTitle.className = 'pattern_select_thumbnails_title';
    sectionTitle.innerText = title;
    section.appendChild(sectionTitle);

    const thumbnailsList = document.createElement('ul');
    thumbnailsList.className = 'pattern_select_thumbnails';
    section.appendChild(thumbnailsList);

    const thumbnailsFragment = document.createDocumentFragment();
    const patternThumbnails: Record<string, HTMLElement> = {};

    patterns.forEach(pattern => {
      const patternLink = document.createElement('a');

      patternLink.style.width = patternLink.style.height = THUMBNAIL_WIDTH_PX;
      patternThumbnails[pattern.id] = patternLink;

      const thumbnailConfig = pattern.thumbnailConfig;

      pattern.assignConfig({
        margin: 1,
        enableBackground: false,
        nailRadius: 0.5,
        ...(thumbnailConfig instanceof Function
          ? thumbnailConfig(pattern.config)
          : thumbnailConfig),
      });

      const li = document.createElement('li');
      thumbnailsFragment.appendChild(li);

      patternLink.href = `?pattern=${pattern.id}`;
      patternLink.setAttribute('data-pattern', pattern.id);
      patternLink.title = pattern.name;
      li.appendChild(patternLink);
    });

    thumbnailsList.appendChild(thumbnailsFragment);

    this.elements.thumbnails.appendChild(section);

    patterns.forEach(pattern => {
      const renderer = new CanvasRenderer(patternThumbnails[pattern.id], {
        updateOnResize: false,
      });
      renderer.setSize([100, 100]);
      pattern.draw(renderer);
    });
  }

  createThumbnails() {
    this.elements.thumbnails.innerHTML = '';

    const savedPatterns = Persistance.getSavedPatterns();
    if (savedPatterns.length) {
      this.#createThumbnailsSection(
        'My Patterns',
        Persistance.getSavedPatterns()
      );
    }
    const patterns = patternTypes.map(PatternType => new PatternType());
    // @ts-ignore
    this.#createThumbnailsSection('Built-in patterns', patterns);
  }
}
