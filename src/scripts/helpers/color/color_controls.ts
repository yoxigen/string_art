import { ControlsConfig } from '../../types/config.types';
import { ColorConfig } from './color.types';

const COLOR_CONTROLS: ControlsConfig<ColorConfig> = [
  {
    key: 'isMultiColor',
    label: 'Use multiple colors',
    defaultValue: false,
    type: 'checkbox',
  },
  {
    key: 'colorCount',
    label: 'Colors count',
    defaultValue: 7,
    type: 'range',
    attr: {
      min: 1,
      max: 20,
      step: 1,
    },
    show: ({ isMultiColor }) => isMultiColor,
  },
  {
    key: 'color',
    label: 'String color',
    defaultValue: '#ff4d00',
    type: 'color',
    show: ({ isMultiColor }) => !isMultiColor,
  },
  {
    key: 'multicolorStart',
    label: 'Multicolor start',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 360,
      step: 1,
      background:
        'linear-gradient(90deg in hsl longer hue, hsl(0 100 50), hsl(360deg 100 50))',
      thumbcolor: ({ multicolorStart }) => `hsl(${multicolorStart}deg 100 50)`,
    },
    show: ({ isMultiColor }) => isMultiColor,
  },
  {
    key: 'multicolorRange',
    label: 'Multicolor range',
    defaultValue: 360,
    type: 'range',
    attr: {
      min: 1,
      max: 360,
      step: 1,
      background: ({ multicolorStart, multicolorRange, reverseColors }) =>
        `linear-gradient(to ${reverseColors ? 'left' : 'right'} in hsl ${
          multicolorRange > 180 ? 'longer' : 'shorter'
        } hue, hsl(${multicolorStart} 100 50), hsl(${
          multicolorStart + multicolorRange
        } 100 50))`,
      thumbcolor: 'white',
    },
    show: ({ isMultiColor }) => isMultiColor,
  },
  {
    key: 'saturation',
    label: 'Saturation',
    defaultValue: 100,
    type: 'range',
    attr: {
      min: 0,
      max: 100,
      step: 1,
    },
    show: ({ isMultiColor }) => isMultiColor,
  },
  {
    key: 'lightness',
    label: 'Lightness',
    type: 'group',
    defaultValue: 'minimized',
    show: ({ isMultiColor }) => isMultiColor,
    children: [
      {
        key: 'multicolorByLightness',
        label: 'Multi lightness',
        defaultValue: false,
        type: 'checkbox',
        show: ({ isMultiColor }) => isMultiColor,
      },
      {
        key: 'minLightness',
        label: 'Minimum lightness',
        defaultValue: 0,
        type: 'range',
        attr: {
          min: 0,
          max: 100,
          step: 1,
          snap: '50',
          thumbcolor: ({ minLightness }) => `hsl(0 0 ${minLightness})`,
          background: 'linear-gradient(to right, black, white)',
        },
        show: ({ multicolorByLightness, isMultiColor }) =>
          multicolorByLightness && isMultiColor,
      },
      {
        key: 'maxLightness',
        label: 'Maximum lightness',
        defaultValue: 100,
        type: 'range',
        attr: {
          min: 0,
          max: 100,
          step: 1,
          snap: '50',
          thumbcolor: ({ maxLightness }) => `hsl(0 0 ${maxLightness})`,
          background: 'linear-gradient(to right, black, white)',
        },
        show: ({ multicolorByLightness, isMultiColor }) =>
          multicolorByLightness && isMultiColor,
      },
    ],
  },
  {
    key: 'colorOrderGroup',
    type: 'group',
    label: 'Order',
    defaultValue: 'minimized',
    show: ({ isMultiColor }) => isMultiColor,
    children: [
      {
        key: 'reverseColors',
        label: 'Reverse colors order',
        defaultValue: false,
        type: 'checkbox',
        show: ({ isMultiColor }) => isMultiColor,
      },
      {
        key: 'repeatColors',
        label: 'Repeat colors',
        defaultValue: true,
        type: 'checkbox',
        show: ({ isMultiColor }) => isMultiColor,
      },
      {
        key: 'mirrorColors',
        label: 'Mirror Colors',
        defaultValue: false,
        type: 'checkbox',
        show: ({ isMultiColor, repeatColors }) => isMultiColor && repeatColors,
      },
    ],
  },
];

export default COLOR_CONTROLS;
