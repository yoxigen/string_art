import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import StarShape from '../helpers/StarShape.js';

export default class Sun extends StringArt {
  name = 'Sun';
  id = 'sun';
  controls = [
    ...StarShape.StarConfig,
    {
      key: 'color',
      label: 'Color',
      defaultValue: '#2ec0ff',
      type: 'color',
    },
  ];

  #star = null;

  setUpDraw() {
    super.setUpDraw();

    const { margin = 0 } = this.config;
    const center = this.size.map(v => v / 2);
    const radius = Math.min(...center) - margin;

    const starConfig = {
      ...this.config,
      radius,
      size: this.size,
    };

    if (this.#star) {
      this.#star.setConfig(starConfig);
    } else {
      this.#star = new StarShape(starConfig);
    }
  }

  *drawStar() {
    const { color } = this.config;

    this.renderer.setColor(color);
    yield* this.#star.generateStrings(this.renderer);
  }

  *generateStrings() {
    yield* this.drawStar();
  }

  drawNails() {
    this.#star.drawNails(this.nails);
  }

  getStepCount() {
    return StarShape.getStepCount(this.config);
  }

  static thumbnailConfig = {
    sideNails: 18,
  };
}
