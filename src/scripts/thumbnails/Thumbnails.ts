import patternTypes from '../pattern_types.js';
import CanvasRenderer from '../renderers/CanvasRenderer.js';
import type StringArt from '../StringArt.js';

const THUMBNAIL_WIDTH_PX = '100px';
const MINIMIZED_CLASS = 'minimized';

type ThumbnailsSelectEventListener = (
  event: CustomEvent<{ pattern: string }>
) => any;

export class Thumbnails {
  elements: Record<string, HTMLElement> = {
    root: document.querySelector('#pattern_select_panel'),
    thumbnails: document.querySelector('#pattern_select_thumbnails'),
    toggleBtn: document.querySelector('#pattern_select_btn'),
    dropdown: document.querySelector('#pattern_select_dropdown'),
  };

  pattern: StringArt<any>;
  thumbnailsRendered = false;
  _onClickOutside: (e: MouseEvent) => void;

  constructor() {
    this.elements.toggleBtn.addEventListener('click', () => this.toggle());
  }

  toggle() {
    if (this.elements.root.classList.contains(MINIMIZED_CLASS)) {
      this.open();
    } else if (this.pattern) {
      this.close();
    }
  }

  open() {
    if (this.elements.root.classList.contains(MINIMIZED_CLASS)) {
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
    if (!this.elements.root.classList.contains(MINIMIZED_CLASS)) {
      this.elements.root.classList.add(MINIMIZED_CLASS);
      document.body.removeEventListener('mousedown', this._onClickOutside);
      this._onClickOutside = null;
    }
  }

  setCurrentPattern(pattern: StringArt<any>) {
    this.pattern = pattern;
    this.elements.toggleBtn.innerText = pattern?.name ?? 'Choose a pattern';
  }

  createThumbnails() {
    const thumbnailsFragment = document.createDocumentFragment();
    const patterns = [];

    patternTypes.forEach(PatternType => {
      const patternLink = document.createElement('a');
      const renderer = new CanvasRenderer(patternLink);

      patternLink.style.width = patternLink.style.height = THUMBNAIL_WIDTH_PX;

      const pattern = new PatternType(renderer);
      pattern.config = {
        margin: 1,
        enableBackground: false,
        nailRadius: 0.5,
        ...PatternType.thumbnailConfig,
      };

      patterns.push(pattern);

      const li = document.createElement('li');
      thumbnailsFragment.appendChild(li);

      patternLink.href = `?pattern=${pattern.id}`;
      patternLink.setAttribute('data-pattern', pattern.id);
      patternLink.title = pattern.name;
      li.appendChild(patternLink);
    });

    this.elements.thumbnails.appendChild(thumbnailsFragment);
    patterns.forEach(pattern => pattern.draw());

    this.elements.thumbnails.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const link =
        e.target instanceof HTMLElement &&
        (e.target.closest('[data-pattern]') as HTMLElement);

      if (!link) {
        return false;
      }

      this.elements.root.dispatchEvent(
        new CustomEvent('select', {
          detail: { pattern: link.dataset.pattern },
        })
      );
      this.toggle();
    });
  }

  addOnSelectListener(listener: ThumbnailsSelectEventListener) {
    this.elements.root.addEventListener('select', listener);
  }

  removeOnSelectListener(listener: ThumbnailsSelectEventListener) {
    this.elements.root.removeEventListener('select', listener);
  }
}
