import StringArt from '../StringArt.js';
import Circle from '../helpers/Circle.js';
import Color from '../helpers/Color.js';
import { PI2 } from '../helpers/math_utils.js';

class Spirals extends StringArt {
  name = 'Spirals';
  id = 'spirals';
  link =
    'https://www.etsy.com/il-en/listing/974865185/3d-string-art-spiral-mandala-wall?ref=shop_home_active_10&frs=1';
  controls = [
    {
      key: 'radiusIncrease',
      label: 'Radius change',
      defaultValue: 5.7,
      type: 'range',
      attr: { min: 1, max: 20, step: 0.1 },
    },
    {
      key: 'angleStep',
      label: 'Angle step',
      defaultValue: 0.45,
      type: 'range',
      attr: { min: 0, max: 1, step: 0.01 },
    },
    {
      key: 'nSpirals',
      label: 'Number of spirals',
      defaultValue: 3,
      type: 'range',
      attr: { min: 1, max: 20, step: 1 },
    },
    {
      ...Circle.rotationConfig,
      defaultValue: 330 / 360,
    },
    Color.getConfig({
      defaults: {
        isMultiColor: true,
        colorCount: 4,
        color: '#00d5ff',
        multicolorRange: 1,
        multicolorStart: 190,
        multicolorByLightness: true,
        minLightness: 50,
        maxLightness: 88,
        reverseColors: true,
      },
    }),
  ];

  setUpDraw() {
    super.setUpDraw();

    const {
      nSpirals,
      rotation,
      margin,
      radiusIncrease,
      angleStep,
      colorCount,
    } = this.config;

    this.spiralRotations = new Array(nSpirals)
      .fill(null)
      .map((_, i) => (i * PI2) / nSpirals);
    this.rotationAngle = -PI2 * rotation;
    const maxRadius = Math.min(...this.size) / 2 - margin;
    this.nailsPerSpiral = Math.floor(maxRadius / radiusIncrease);
    this.angleIncrease = angleStep / (maxRadius / 50);
    this.color = new Color(this.config);
    this.colorMap = this.color.getColorMap({
      stepCount: this.getStepCount(),
      colorCount,
    });
  }

  *generatePoints() {
    const { nSpirals } = this.config;

    for (let i = 0; i < this.nailsPerSpiral; i++) {
      for (let s = 0; s < nSpirals; s++) {
        const point = this.getPoint(s, i);
        yield { point, nailNumber: `${s}_${i}` };
      }
    }
  }

  getPoint(spiralIndex, index) {
    const [centerx, centery] = this.center;
    const { radiusIncrease } = this.config;

    const angle =
      this.rotationAngle +
      this.angleIncrease * index +
      this.spiralRotations[spiralIndex];
    const radius = index * radiusIncrease;

    return [
      centerx + radius * Math.sin(angle),
      centery + radius * Math.cos(angle),
    ];
  }

  *generateStrings() {
    const points = this.generatePoints();
    let index = 0;
    this.renderer.setColor(this.color.getColor(0));
    let lastPoint = this.center;

    for (const { point } of points) {
      if (this.colorMap) {
        const stepColor = this.colorMap.get(index);
        if (stepColor) {
          this.renderer.setColor(stepColor);
        }
      }

      if (lastPoint) {
        this.renderer.renderLines(lastPoint, point);
      }
      lastPoint = point;
      yield index++;
    }
  }

  getStepCount() {
    const { nSpirals, radiusIncrease, margin } = this.config;
    const maxRadius = Math.min(...this.getSize()) / 2 - margin;
    const n = Math.floor(maxRadius / radiusIncrease);
    return n * nSpirals;
  }

  drawNails() {
    const points = this.generatePoints();
    for (const { point, nailNumber } of points) {
      this.nails.addNail({ point, number: nailNumber });
    }
  }

  static thumbnailConfig = {
    radiusIncrease: 1.4,
    angleStep: 0.11,
  };
}

export default Spirals;
