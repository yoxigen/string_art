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
    defaultValue: 1,
    type: 'hue',
    attr: {
      colorthumb: true,
    },
    show: ({ isMultiColor }) => isMultiColor,
  },
  {
    key: 'multicolorRange',
    label: 'Multicolor range',
    defaultValue: 360,
    type: 'hue',
    attr: {
      start: ({ multicolorStart }) => multicolorStart,
      type: 'range',
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
