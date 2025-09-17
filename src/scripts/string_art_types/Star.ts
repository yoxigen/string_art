import StringArt from '../StringArt';
import Circle, { CircleConfig } from '../shapes/Circle';
import StarShape, { StarShapeConfig } from '../shapes/StarShape';
import { ColorValue } from '../helpers/color/color.types';
import { withoutAttribute } from '../helpers/config_utils';
import Renderer from '../renderers/Renderer';
import { ControlsConfig, GroupValue } from '../types/config.types';
import { Coordinates } from '../types/general.types';
import { CalcOptions } from '../types/stringart.types';

interface StarConfig {
  sides: number;
  sideNails: number;
  centerRadius: number;
  ringSize: number;
  rotation: number;
  distortion: number;
  innerColor: ColorValue;
  outerColor: ColorValue;
  ringColor: ColorValue;
  colorGroup: GroupValue;
  isSingleColor: boolean;
  singleColor: ColorValue;
}

type TCalc = {
  circle: Circle;
  star: StarShape;
};

export default class Star extends StringArt<StarConfig, TCalc> {
  static type = 'star';

  name = 'Star';
  id = 'star';
  link =
    'https://www.etsy.com/listing/557818258/string-art-meditation-geometric-yoga?epik=dj0yJnU9Mm1hYmZKdks1eTc3bVY2TkVhS2p2Qlg0N2dyVWJxaTEmcD0wJm49MGlWSXE1SVJ2Vm0xZ0xtaGhITDBWQSZ0PUFBQUFBR0Zwd2lj';
  controls: ControlsConfig<StarConfig> = [
    {
      key: 'sides',
      label: 'Sides',
      defaultValue: 3,
      type: 'range',
      attr: { min: 3, max: 20, step: 1 },
      isStructural: true,
    },
    {
      key: 'sideNails',
      label: 'Nails per side',
      defaultValue: 40,
      type: 'range',
      attr: { min: 1, max: 200, step: 1 },
      isStructural: true,
    },
    StarShape.centerRadiusConfig,
    {
      key: 'ringSize',
      label: 'Outer ring size',
      defaultValue: 0.1,
      type: 'range',
      attr: {
        min: 0,
        max: 0.5,
        step: ({ sideNails, sides }) => 1 / (sideNails * sides),
      },
      displayValue: ({ sideNails, sides, ringSize }) =>
        Math.floor(ringSize * sideNails * sides),
      affectsNails: false,
    },
    withoutAttribute<StarConfig>(Circle.rotationConfig, 'snap'),
    Circle.distortionConfig,
    {
      key: 'colorGroup',
      label: 'Color',
      type: 'group',
      children: [
        {
          key: 'isSingleColor',
          label: 'Is single color',
          type: 'checkbox',
          defaultValue: false,
          affectsNails: false,
          affectsStepCount: false,
        },
        {
          key: 'singleColor',
          label: 'Color',
          defaultValue: '#2ec0ff',
          type: 'color',
          affectsNails: false,
          affectsStepCount: false,
          show: ({ isSingleColor }) => isSingleColor,
        },
        {
          key: 'innerColor',
          label: 'Star color',
          defaultValue: '#2ec0ff',
          type: 'color',
          affectsNails: false,
          affectsStepCount: false,
          show: ({ isSingleColor }) => !isSingleColor,
        },
        {
          key: 'outerColor',
          label: 'Outter color',
          defaultValue: '#2a82c6',
          type: 'color',
          affectsNails: false,
          affectsStepCount: false,
          show: ({ isSingleColor }) => !isSingleColor,
        },
        {
          key: 'ringColor',
          label: 'Ring color',
          defaultValue: '#2ec0ff',
          type: 'color',
          affectsNails: false,
          affectsStepCount: false,
          show: ({ isSingleColor }) => !isSingleColor,
        },
      ],
    },
  ];

  getCalc({ size }: CalcOptions): TCalc {
    const { sides, rotation, distortion, sideNails, margin = 0 } = this.config;
    const circleConfig: CircleConfig = {
      size: size,
      n: sideNails * sides,
      margin,
      rotation: rotation ? rotation / sides : 0,
      distortion,
    };

    const circle = new Circle(circleConfig);

    const starConfig: StarShapeConfig = {
      ...this.config,
      radius: circle.radius,
      size: this.size,
    };

    return {
      circle,
      star: new StarShape(starConfig),
    };
  }

  getAspectRatio(options: CalcOptions): number {
    const { circle } = this.getCalc(options);
    return circle.aspectRatio;
  }

  getArcPoint({
    side,
    sideIndex,
  }: {
    side: number;
    sideIndex: number;
  }): Coordinates {
    return this.calc.circle.getPoint(side * this.config.sideNails + sideIndex);
  }

  *drawStar(renderer: Renderer): Generator<void> {
    const { innerColor, isSingleColor } = this.config;

    if (!isSingleColor) {
      renderer.setColor(innerColor);
    }
    yield* this.calc.star.drawStrings(renderer);
  }

  *drawCircle(renderer: Renderer): Generator<void> {
    const { outerColor, sides, sideNails, isSingleColor } = this.config;
    if (!isSingleColor) {
      renderer.setColor(outerColor);
    }
    let prevPoint = this.calc.star.getPoint(0, 0);
    let alternate = false;
    let isStar = false;

    const rounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
    let side = 0;
    const linesPerRound = sides % 2 ? sides * 4 : sides * 2;

    for (let round = 0; round <= rounds; round++) {
      const linesPerThisRound =
        linesPerRound - (round === rounds ? sides * 2 : 0);

      for (let i = 0; i < linesPerThisRound; i++) {
        const pointPosition = {
          side,
          sideIndex: alternate ? sideNails - round - 1 : round,
        };

        const nextPoint = isStar
          ? this.calc.star.getPoint(pointPosition.side, pointPosition.sideIndex)
          : this.getArcPoint(pointPosition);

        renderer.renderLine(prevPoint, nextPoint);
        prevPoint = nextPoint;

        yield;
        isStar = !isStar;

        if (isStar) {
          side = side !== sides - 1 ? side + 1 : 0;
          alternate = !alternate;
        }
      }
      prevPoint = this.calc.star.getPoint(0, round + 1);
    }
  }

  *drawStrings(renderer: Renderer): Generator<void> {
    const { ringSize, ringColor, isSingleColor, singleColor } = this.config;
    if (isSingleColor) {
      renderer.setColor(singleColor);
    }

    yield* this.drawCircle(renderer);

    if (ringSize !== 0) {
      yield* this.calc.circle.drawRing(renderer, {
        ringSize,
        color: isSingleColor ? null : ringColor,
      });
    }
    yield* this.drawStar(renderer);
  }

  drawNails(): void {
    this.calc.circle.drawNails(this.nails);
    this.calc.star.drawNails(this.nails);
    this.calc.circle.drawNails(this.nails);
  }

  #getCircleStepCount(): number {
    const { sides, sideNails } = this.config;
    const circleRounds = sides % 2 ? Math.ceil(sideNails / 2) : sideNails;
    const linesPerRound = sides % 2 ? sides * 4 : sides * 2;

    return (circleRounds + 1) * linesPerRound - sides * 2;
  }

  getStepCount(): number {
    const { sides, sideNails, ringSize } = this.config;

    const ringCount = ringSize ? sideNails * sides : 0;
    const circleCount = this.#getCircleStepCount();
    const starCount = StarShape.getStepCount(this.config);
    return circleCount + ringCount + starCount;
  }

  thumbnailConfig = ({ sideNails }) => ({
    sideNails: Math.min(sideNails, 18),
  });
}
