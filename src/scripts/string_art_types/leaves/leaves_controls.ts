import { roundNumber } from '../../helpers/math_utils';
import { formatFractionAsAngle } from '../../helpers/string_utils';
import { ControlsConfig } from '../../types/config.types';
import { LeavesConfig } from './LeavesBase';

const leavesCommonControls: ControlsConfig<LeavesConfig> = [
  {
    key: 'angle',
    label: 'Layer angle',
    defaultValue: 0.088,
    displayValue: ({ angle }) => `${roundNumber((180 * angle) / 3, 2)}°`,
    type: 'range',
    attr: { min: 0.02, max: 0.15, step: 0.001 },
    isStructural: true,
  },
  {
    key: 'maxDensity',
    label: 'Max density',
    defaultValue: 5,
    type: 'range',
    attr: { min: 1, max: 20, step: 0.01 },
    isStructural: true,
  },
  {
    key: 'rotation',
    label: 'Rotation',
    defaultValue: 0,
    type: 'range',
    attr: {
      min: 0,
      max: 1,
      step: 0.0025,
    },
    displayValue: ({ rotation }) => formatFractionAsAngle(rotation),
    isStructural: true,
    affectsStepCount: false,
  },
];

export default leavesCommonControls;
