import patternTypes from '../pattern_types.js';

const THUMBNAIL_WIDTH = 100;

export class Gallery {
  elements = {
    thumbnails: document.querySelector('#pattern_select_thumbnails'),
    toggleBtn: document.querySelector('#pattern_select_btn'),
    dropdown: document.querySelector('#pattern_select_dropdown'),
  };

  constructor() {
    this.elements.toggleBtn.addEventListener('mousedown', () => {
      if (this.elements.dropdown.hasAttribute('hidden')) {
        this.elements.dropdown.removeAttribute('hidden');
        if (!this.thumbnailsRendered) {
          this.createThumbnails();
          this.thumbnailsRendered = true;
        }
      } else {
        this.elements.dropdown.setAttribute('hidden', 'hidden');
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
      pattern.config = {
        margin: 1,
        enableBackground: false,
        nailRadius: 0.5,
      };

      patterns.push(pattern);

      const li = document.createElement('li');
      thumbnailsFragment.appendChild(li);
      const patternLink = document.createElement('a');
      patternLink.href = `?pattern=${pattern.id}`;
      patternLink.title = pattern.name;
      patternLink.appendChild(canvas);
      li.appendChild(patternLink);
    });

    this.elements.thumbnails.appendChild(thumbnailsFragment);
    patterns.forEach(pattern => pattern.draw());
  }
}
