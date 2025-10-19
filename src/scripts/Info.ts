import StringArt from './StringArt';
import { Dimensions } from './types/general.types';

class Info {
  elements: {
    infoPanel: HTMLDivElement;
    nailsCount: HTMLSpanElement;
    threadsTotalLength: HTMLSpanElement;
    threadsPerColor: HTMLDivElement;
  };

  constructor() {
    this.elements = {
      infoPanel: document.querySelector('#info_panel'),
      nailsCount: document.querySelector('#nails_count'),
      threadsTotalLength: document.querySelector('#threads_total_length'),
      threadsPerColor: document.querySelector('#threads_per_color'),
    };
  }

  update(pattern: StringArt, size: Dimensions) {
    this.elements.nailsCount.textContent = String(pattern.getNailCount(size));
  }
}

const info = new Info();
export default info;
