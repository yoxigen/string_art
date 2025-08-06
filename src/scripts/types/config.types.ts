import { ColorValue } from '../helpers/color/color.types';

export type ControlType =
  | 'range'
  | 'checkbox'
  | 'color'
  | 'group'
  | 'select'
  | 'number'
  | 'text';

export type GroupValue = 'minimized' | null | undefined;
export type PrimitiveValue = string | number | boolean | GroupValue;

export interface NailsConfig {
  nails: GroupValue;
  nailRadius: number;
  nailsColor: ColorValue;
  nailNumbersFontSize: number;
  showNails: boolean;
  showNailNumbers: boolean;
  margin: number;
}

export interface StringsConfig {
  strings: GroupValue;
  stringWidth: number;
  showStrings: boolean;
}

export interface BackgroundConfig {
  background: GroupValue;
  darkMode: boolean;
  backgroundColor: ColorValue;
  customBackgroundColor: boolean;
  enableBackground: boolean;
}

export type CommonConfig = NailsConfig & StringsConfig & BackgroundConfig;

export type Config<T = Record<string, PrimitiveValue>> = T & CommonConfig;

export type ConfigFunction<
  TConfig = Record<string, PrimitiveValue>,
  TReturn = PrimitiveValue
> = (config: Config<TConfig>) => TReturn;

export type ConfigValueOrFunction<TConfig, TValue = PrimitiveValue> =
  | TValue
  | ConfigFunction<TConfig, TValue>;

export interface ControlConfig<TConfig = Record<string, PrimitiveValue>> {
  key: keyof TConfig;
  label: string;
  type: ControlType;
  defaultValue?: ConfigValueOrFunction<TConfig>;
  displayValue?: ConfigFunction<TConfig>;
  attr?: {
    [key: string]: ConfigValueOrFunction<TConfig>;
  };
  isStructural?: boolean;
  affectsStepCount?: boolean;
  description?: string;
  show?: ConfigFunction<TConfig>;
  children?: ControlsConfig<TConfig>;
  isDisabled?: ConfigFunction<TConfig>;
  options?: Array<string | { label: string; value: string }>;
}

export type ControlsConfig<T = Record<string, PrimitiveValue>> = Array<
  ControlConfig<T>
>;
