import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Color from '../helpers/Color.js';
import { PI2 } from '../helpers/math_utils.js';

const COLOR_CONFIG = Color.getConfig({
  defaults: {
    isMultiColor: true,
    color: '#29f1ff',
    multicolorRange: 264,
    multicolorStart: 53,
    multicolorByLightness: false,
    minLightness: 30,
    maxLightness: 70,
  },
  exclude: ['colorCount'],
});

export default class Comet extends StringArt {
  name = 'Comet';
  id = 'comet';
  controls = [
    Circle.nailsConfig,
    {
      key: 'ringSize',
      label: 'Ring size',
      defaultValue: 0.42,
      type: 'range',
      attr: {
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      displayValue: ({ ringSize }) => `${Math.round(100 * ringSize)}%`,
    },
    Circle.rotationConfig,
    COLOR_CONFIG,
  ];

  resetStructure() {
    if (this.points) {
      this.points.clear();
    }
  }

  setUpDraw() {
    super.setUpDraw();
    const circleConfig = {
      size: this.size,
      n: this.config.n,
      margin: this.config.margin,
      rotation: this.config.rotation,
    };

    if (this.circle) {
      this.circle.setConfig(circleConfig);
    } else {
      this.circle = new Circle(circleConfig);
    }
  }

  getCalc() {
    const { n } = this.config;
    const size = this.getSize();

    return {
      n,
      angleRadians: (PI2 * angle) / maxSteps,
      radius: Math.min(...size) / 2,
      currentSize: size,
      rotationAngle: -Math.PI * 2 * rotation,
    };
  }

  *drawLayer(layerIndex = 0) {
    const layerColor = '#ffffff';

    const { n } = this.config;
    const ringDistance = Math.round(this.config.ringSize * n);

    let prevPoint = this.circle.getPoint(0);
    let prevPointIndex = 0;
    this.renderer.setColor(layerColor);

    for (let i = 0; i < n - ringDistance + 1; i++) {
      const pointIndex = i + ringDistance;
      const point = this.circle.getPoint(pointIndex);

      this.renderer.renderLines(prevPoint, point);
      yield;

      prevPointIndex = i + 1;
      prevPoint = this.circle.getPoint(prevPointIndex);

      this.renderer.renderLines(point, prevPoint);

      yield;
    }
  }

  *generateStrings() {
    yield* this.drawLayer(0);
  }

  getStepCount() {
    const { n } = this.config;
    const ringDistance = Math.round(this.config.ringSize * n);

    return (n - ringDistance) * 2 + 1;
  }

  drawNails() {
    this.circle.drawNails(this.nails);
  }

  static thumbnailConfig = {
    n: 60,
  };
}
