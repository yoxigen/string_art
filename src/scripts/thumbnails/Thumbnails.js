import patternTypes from '../pattern_types.js';

const THUMBNAIL_WIDTH = 100;
const MINIMIZED_CLASS = 'minimized';

export class Thumbnails {
  elements = {
    root: document.querySelector('#pattern_select_panel'),
    thumbnails: document.querySelector('#pattern_select_thumbnails'),
    toggleBtn: document.querySelector('#pattern_select_btn'),
    dropdown: document.querySelector('#pattern_select_dropdown'),
  };

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
        if (!e.target.closest('#pattern_select_panel')) {
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

  setCurrentPattern(pattern) {
    this.pattern = pattern;
    this.elements.toggleBtn.innerText = pattern?.name ?? 'Choose a pattern';
  }

  createThumbnails() {
    const thumbnailsFragment = document.createDocumentFragment();
    const patterns = [];

    patternTypes.forEach(PatternType => {
      const canvas = document.createElement('canvas');
      canvas.style.width = canvas.style.height = `${THUMBNAIL_WIDTH}px`;

      const pattern = new PatternType(canvas);
      pattern.config = Object.assign(
        {
          margin: 1,
          enableBackground: false,
          nailRadius: 0.5,
        },
        PatternType.thumbnailConfig
      );

      patterns.push(pattern);

      const li = document.createElement('li');
      thumbnailsFragment.appendChild(li);
      const patternLink = document.createElement('a');
      patternLink.href = `?pattern=${pattern.id}`;
      patternLink.setAttribute('data-pattern', pattern.id);
      patternLink.title = pattern.name;
      patternLink.appendChild(canvas);
      li.appendChild(patternLink);
    });

    this.elements.thumbnails.appendChild(thumbnailsFragment);
    patterns.forEach(pattern => pattern.draw());

    this.elements.thumbnails.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();

      const link = e.target.closest('[data-pattern]');

      if (!link) {
        return false;
      }

      this.elements.root.dispatchEvent(
        new CustomEvent('change', {
          detail: { pattern: link.dataset.pattern },
        })
      );
      this.toggle();
    });
  }

  addOnChangeListener(listener) {
    this.elements.root.addEventListener('change', listener);
  }

  removeOnChangeListener(listener) {
    this.elements.root.removeEventListener('change', listener);
  }
}
