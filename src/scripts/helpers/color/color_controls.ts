import { ControlsConfig } from '../../types/config.types';
import { ColorConfig } from './color.types';

const COLOR_CONTROLS: ControlsConfig<ColorConfig> = [
  {
    key: 'isMultiColor',
    label: 'Use multiple colors',
    defaultValue: false,
    type: 'checkbox',
    affectsNails: false,
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
    affectsNails: false,
  },
  {
    key: 'color',
    label: 'String color',
    defaultValue: '#ff4d00',
    type: 'color',
    show: ({ isMultiColor }) => !isMultiColor,
    affectsNails: false,
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
    affectsNails: false,
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
    affectsNails: false,
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
    affectsNails: false,
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
        affectsNails: false,
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
        affectsNails: false,
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
        affectsNails: false,
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
        affectsNails: false,
      },
      {
        key: 'repeatColors',
        label: 'Repeat colors',
        defaultValue: true,
        type: 'checkbox',
        show: ({ isMultiColor }) => isMultiColor,
        affectsNails: false,
      },
      {
        key: 'mirrorColors',
        label: 'Mirror Colors',
        defaultValue: false,
        type: 'checkbox',
        show: ({ isMultiColor, repeatColors }) => isMultiColor && repeatColors,
        affectsNails: false,
      },
    ],
  },
];

export default COLOR_CONTROLS;
