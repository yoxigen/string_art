import Nails from '../Nails';
import Renderer from '../renderers/Renderer';
import {
  ControlConfig,
  ControlsConfig,
  NailsConfig,
} from '../types/config.types';
import { BoundingRect, Coordinates, Dimensions } from '../types/general.types';
import { compareObjects } from '../helpers/object_utils';
import Polygon from './Polygon';
import { formatFractionAsPercent } from '../helpers/string_utils';

export interface StarShapeConfig {
  sideNails: number;
  sides: number;
  maxCurveSize?: number;
  centerRadius?: number;
  rotation?: number;
  center?: Coordinates;
  size?: Dimensions;
  radius?: number;
}

export default class StarShape {
  config: StarShapeConfig;
  center: Coordinates;
  calc: ReturnType<typeof StarShape.getCalc>;

  constructor(config: StarShapeConfig) {
    this.setConfig(config);
  }

  static getCalc({
    radius,
    sides,
    sideNails,
    rotation,
    centerRadius: centerRadiusFraction = 0,
    maxCurveSize = 1,
  }: StarShapeConfig) {
    const centerRadius = radius * centerRadiusFraction;
    const nailSpacing = (radius - centerRadius) / (sideNails - 1); // The distance between nails on the same side, in px
    const sidesAngle = (Math.PI * 2) / sides; // The angle, in radians, between each side
    const rotationAngle = rotation ? (-Math.PI * 2 * rotation) / sides : 0;

    return {
      sideAngle: sidesAngle,
      nailSpacing,
      centerRadius,
      linesPerRound: sides % 2 ? sides * 2 : sides,
      sidesConnectionCount: Math.floor(Math.min(1, maxCurveSize) * sideNails),
      sideSize: radius - centerRadius,
      sides: new Array(sides).fill(null).map((_, side) => {
        const sideAngle = side * sidesAngle + rotationAngle;

        return {
          sinSideAngle: Math.sin(sideAngle),
          cosSideAngle: Math.cos(sideAngle),
        };
      }),
    };
  }

  getPoint(side = 0, index = 0): Coordinates {
    const radius = this.calc.centerRadius + index * this.calc.nailSpacing;
    const { sinSideAngle, cosSideAngle } = this.calc.sides[side];

    return [
      this.center[0] + sinSideAngle * radius,
      this.center[1] + cosSideAngle * radius,
    ];
  }

  setConfig(config: StarShapeConfig) {
    if (
      compareObjects(config, this.config, [
        'radius',
        'sides',
        'sideNails',
        'rotation',
        'center',
        'size',
        'centerRadius',
        'maxCurveSize',
      ])
    ) {
      return;
    }

    if (!config.center && !config.size) {
      throw new Error(
        'StarShape requires a config value for either center or size.'
      );
    }

    const center =
      config.center ?? (config.size.map(v => v / 2) as Coordinates);

    this.config = config;
    this.center = center;
    this.calc = StarShape.getCalc(config);
  }

  /**
   * Given a Nails instance, uses it to draw the nails of this Circle
   */
  drawNails(
    nails: Nails,
    {
      getNumber,
      reverseOrder,
      ...nailsConfig
    }: Partial<
      {
        getNumber: (side: number, sideIndex: number) => string;
        reverseOrder: boolean;
      } & NailsConfig
    > = {}
  ): void {
    const { sides, sideNails } = this.config;

    const groupNails = [];

    for (let side = 0; side < sides; side++) {
      for (let i = 0; i < sideNails; i++) {
        const sideIndex = reverseOrder ? sideNails - i : i;
        groupNails.push({
          point: this.getPoint(side, sideIndex),
          number: getNumber
            ? getNumber(side, sideIndex)
            : sideIndex || this.config.centerRadius
            ? `${side}_${sideIndex}`
            : 0,
        });
      }
    }

    nails.addGroup(groupNails, nailsConfig);
  }

  // In this pattern, strings are connected in a "merry-go-round" way, around the star.
  // With even sides count, the strings go around the star once, while with odd sides count, each round goes twice around the star.
  // The threading is: star at the center (or centerRadius, if > 0), then next side at the edge (outtermost nail) or the size param which represents the count of nails to use,
  // then back to the center for the next side,   // until all sides have been connected both center and edge (for odd-side-count stars) or until all sides have been
  // connected (for odd-side-count), then move up one nail from the center and start another round.
  *drawStrings(
    renderer: Renderer,
    { size }: { size?: number } = {}
  ): Generator<void> {
    const { sideNails: sideNailsConfig, sides } = this.config;
    const { sidesConnectionCount, linesPerRound } = this.calc;

    const sideNails = size
      ? Math.max(1, Math.min(Math.floor(size), sideNailsConfig))
      : sideNailsConfig;

    const minNailIndex = Math.max(0, sideNails - sidesConnectionCount);

    let alternate = false;

    const rounds =
      sides % 2
        ? Math.ceil(Math.min(sideNails, sidesConnectionCount) / 2)
        : sideNails - minNailIndex;

    let prevPointIndex = minNailIndex;
    let prevPoint = this.getPoint(0, prevPointIndex);

    for (let round = 0; round < rounds; round++) {
      const isLastRound = round === rounds - 1;
      let side = 0;

      for (let i = 0; i < linesPerRound; i++) {
        side = (side + 1) % sides;
        alternate = !alternate;
        prevPointIndex = alternate
          ? sideNails - round - 1
          : round + minNailIndex;
        const nextPoint = this.getPoint(side, prevPointIndex);
        renderer.renderLine(prevPoint, nextPoint);
        prevPoint = nextPoint;
        yield;

        if (isLastRound && i === sides - 1 && sides % 2 && sideNails % 2) {
          break;
        }
      }

      if (!isLastRound) {
        prevPointIndex = alternate ? prevPointIndex - 1 : prevPointIndex + 1;
        const nextPoint = this.getPoint(0, prevPointIndex);
        renderer.renderLine(prevPoint, nextPoint);
        prevPoint = nextPoint;
      }
    }
  }

  getStepCount(size?: number) {
    return StarShape.getStepCount(this.config, { size });
  }

  static getStepCount(
    {
      sides,
      sideNails: sideNailsConfig,
      maxCurveSize = 1,
    }: Partial<StarShapeConfig>,
    { size }: { size?: number } = {}
  ) {
    const sidesConnectionCount = Math.floor(
      Math.min(1, maxCurveSize) * sideNailsConfig
    );
    const sideNails = size
      ? Math.min(Math.floor(size), sideNailsConfig)
      : sideNailsConfig;
    const minNailIndex = Math.max(0, sideNails - sidesConnectionCount);

    const rounds =
      sides % 2
        ? Math.ceil(Math.min(sideNails, sidesConnectionCount) / 2)
        : sideNails - minNailIndex;

    const linesPerRound = sides % 2 ? sides * 2 : sides;
    const isOdd = sides % 2 && sideNails % 2;
    return rounds * linesPerRound - (isOdd ? sides : 0);
  }

  getBoundingRect(): BoundingRect {
    const { radius, sides, rotation, sideNails } = this.config;
    const polygon = new Polygon({
      size: [radius * 2, radius * 2],
      sides,
      nailsSpacing: 1 / sideNails,
      margin: 0,
      rotation,
    });

    return polygon.getBoundingRect();
  }

  static nailsConfig: ControlConfig<StarShapeConfig> = Object.freeze({
    key: 'sideNails',
    label: 'Nails per side',
    defaultValue: 40,
    type: 'range',
    attr: { min: 1, max: 200, step: 1 },
    isStructural: true,
  });

  static sidesConfig: ControlConfig<StarShapeConfig> = Object.freeze({
    key: 'sides',
    label: 'Sides',
    defaultValue: 3,
    type: 'range',
    attr: { min: 3, max: 40, step: 1 },
    isStructural: true,
  });

  static maxCurveSize: ControlConfig<StarShapeConfig> = {
    key: 'maxCurveSize',
    label: 'Max curve size',
    description:
      'The maximum number of connections used to create a curve between two sides.',
    defaultValue: 1,
    type: 'range',
    displayValue: ({ maxCurveSize, sideNails }) =>
      Math.floor(maxCurveSize * sideNails),
    attr: {
      min: 0,
      max: 1,
      step: ({ sideNails }) => 1 / sideNails,
    },
    isStructural: true,
  };

  static centerRadiusConfig: ControlConfig<StarShapeConfig> = {
    key: 'centerRadius',
    label: 'Center radius',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: ({ sideNails }) => (sideNails - 1) / sideNails,
      step: 0.01,
    },
    displayValue: ({ centerRadius }) => formatFractionAsPercent(centerRadius),
    isStructural: true,
  };

  static rotationConfig: ControlConfig<StarShapeConfig> = {
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1,
      step: 0.01,
      snap: '0.5',
    },
    displayValue: ({ rotation, sides }) =>
      `${Math.round((rotation * 360) / sides)}°`,
    isStructural: true,
    affectsStepCount: false,
  };

  static StarConfig: ControlsConfig<StarShapeConfig> = [
    StarShape.nailsConfig,
    StarShape.sidesConfig,
    StarShape.centerRadiusConfig,
    StarShape.maxCurveSize,
    StarShape.rotationConfig,
  ];
}
