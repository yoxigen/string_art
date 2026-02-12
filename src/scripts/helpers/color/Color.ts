import { ControlConfig, ControlsConfig } from '../../types/config.types';
import { copyConfig, mapControls } from '../config_utils';
import { ColorConfig, ColorMap, ColorValue } from './color.types';
import COLOR_CONTROLS from './color_controls';

export default class Color {
  multiColorStep: number;
  multiColorLightnessStep: number;
  colors: Array<ColorValue>;

  constructor(public config: ColorConfig) {
    const {
      multicolorRange,
      colorCount,
      multicolorByLightness,
      minLightness = 0,
      maxLightness = 100,
      multicolorStart,
      darkMode,
      saturation,
      reverseColors,
      repeatColors,
      mirrorColors,
      isMultiColor,
    } = config;

    if (isMultiColor) {
      this.multiColorStep = multicolorRange / Math.max(1, colorCount - 1);
      this.multiColorLightnessStep = multicolorByLightness
        ? (maxLightness - minLightness) / (Math.max(colorCount, 2) - 1)
        : 1;

      this.colors = new Array(colorCount).fill(null).map((_, colorIndex) => {
        const lightness = multicolorByLightness
          ? minLightness + this.multiColorLightnessStep * colorIndex
          : darkMode
          ? 50
          : 40;
        return `hsl(${
          multicolorStart + colorIndex * this.multiColorStep
        }, ${saturation}%, ${lightness}%)`;
      });

      if (repeatColors && mirrorColors) {
        const [_firstColor, ...restColors] = this.colors;
        restColors.pop();
        this.colors = [...this.colors, ...restColors.reverse()];
      }

      if (reverseColors) {
        this.colors.reverse();
      }
    }
  }

  /**
   * Returns the color to be used in the provided layer index. If no multiColor is used, will use the 'color' config property.
   * @param {number} colorIndex
   * @returns string
   */
  getColor(colorIndex: number): ColorValue {
    const { isMultiColor, colorCount, color, repeatColors } = this.config;

    if (!isMultiColor) {
      return color;
    }

    if (colorIndex >= colorCount) {
      colorIndex = repeatColors
        ? colorIndex % this.colors.length
        : this.colors.length - 1;
    }

    return this.colors[colorIndex];
  }

  /**
   * Returns the color with the opposite hue to the color at this index
   */
  static getOppositeColor(hslColor: ColorValue): ColorValue {
    const hslMatch = hslColor.match(
      /^hsl\((\d+)(?:deg)?(?:,?\s?)(\d+%?)(?:,?\s?)(\d+%?)\)$/
    );
    if (hslMatch) {
      const oppositeHue = (Number(hslMatch[1]) + 180) % 360;
      return `hsl(${oppositeHue}, ${hslMatch[2]}, ${hslMatch[3]})`;
    }

    return null;
  }

  getColorMap(
    options?: Partial<{
      stepCount: number;
      colorCount: number;
    }>
  ): ColorMap {
    options = Object.assign({}, this.config, options);
    if (!options.colorCount) {
      throw new Error("Can't get color map, no colorCount provided!");
    }
    const stepsPerColor = Math.floor(options.stepCount / options.colorCount);
    const colorMap = new Map();
    for (let i = 0; i < options.colorCount; i++) {
      colorMap.set(i * stepsPerColor, this.getColor(i));
    }
    return colorMap;
  }

  static getConfig<TCustomConfig = {}>({
    include,
    exclude,
    defaults = {},
    customControls,
    propMapper,
    groupLabel,
    maxColorCount,
  }: Partial<{
    include: Array<keyof ColorConfig>;
    exclude: Array<keyof ColorConfig>;
    defaults: Partial<ColorConfig>;
    customControls: ControlsConfig<TCustomConfig>;
    propMapper: (
      control: ControlConfig<ColorConfig>
    ) => Partial<ControlConfig<ColorConfig>>;
    groupLabel: string;
    maxColorCount: number;
  }>): ControlConfig<ColorConfig & TCustomConfig> {
    const controls = mapControls(getControls(), propMapper);

    return {
      key: 'colorGroup',
      label: groupLabel ?? 'Color',
      type: 'group',
      children: [...(customControls ?? []), ...controls],
    };

    function getControls(
      controlsConfig?: ControlsConfig<ColorConfig>
    ): ControlsConfig<ColorConfig> {
      return (controlsConfig ?? copyConfig(COLOR_CONTROLS))
        .filter(
          ({ key }) =>
            (!exclude || !exclude.includes(key)) &&
            (!include || include.includes(key))
        )
        .map(control => {
          const finalControl = {
            ...control,
            defaultValue: defaults[control.key] ?? control.defaultValue,
          };

          if (control.type === 'group') {
            finalControl.children = getControls(control.children);
          }

          if (control.key === 'colorCount' && maxColorCount) {
            finalControl.attr.max = maxColorCount;
          }

          return finalControl;
        });
    }
  }
}
