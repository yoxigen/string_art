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
    this.elements.toggleBtn.addEventListener('mousedown', () => {
      if (this.elements.root.classList.contains(MINIMIZED_CLASS)) {
        this.elements.root.classList.remove(MINIMIZED_CLASS);
        if (!this.thumbnailsRendered) {
          this.createThumbnails();
          this.thumbnailsRendered = true;
        }
      } else {
        this.elements.root.classList.add(MINIMIZED_CLASS);
      }
    });
  }

  setCurrentPattern(pattern) {
    this.pattern = pattern;
    this.elements.toggleBtn.innerText = pattern.name;
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

      this.elements.root.dispatchEvent(
        new CustomEvent('change', { detail: { pattern: e.target.dataset.pattern } })
      );
    });

    addOnChangeListener(listener => this.elements.root.addEventListener('change', listener));
    removeOnChangeListener(listener => this.elements.root.removeEventListener('change', listener));
  }
}
