import StringArt from './StringArt';

const MAX_FLOAT_DECIMALS = 6;

export function serializeConfig(pattern: StringArt<any>): string {
  const { defaultConfig, config } = pattern;

  const nonDefaultConfigValues = Object.entries(config).map(([key, value]) => {
    if (value === defaultConfig[key]) {
      return null;
    }

    if (typeof value === 'boolean') {
      return `!${value ? 1 : 0}`;
    }

    if (typeof value === 'number') {
      return parseFloat(value.toFixed(MAX_FLOAT_DECIMALS));
    }

    return value;
  });

  while (nonDefaultConfigValues[nonDefaultConfigValues.length - 1] === null) {
    nonDefaultConfigValues.pop();
  }

  if (!nonDefaultConfigValues.length) {
    return '';
  }

  const serializedConfigValues = nonDefaultConfigValues
    .join('_')
    .replace(/\_{2,}/g, match => '~' + match.length + '_');
  return serializedConfigValues;
}

const numberRegExp = /^\-?\d+(\.\d+)?$/;
const booleanRegExp = /^(?:!)([01])$/;

export function deserializeConfig<TConfig>(
  pattern: StringArt<TConfig>,
  serializedCofig: string
): TConfig {
  const serializedConfigValues = serializedCofig
    .replace(/(?:~)(\d+)(?:_)/g, (_, commaCount) =>
      new Array(+commaCount).fill('_').join('')
    )
    .split('_')
    .map(v => {
      if (v === '') {
        return null;
      }

      if (numberRegExp.test(v)) {
        return parseFloat(v);
      }

      const booleanMatch = v.match(booleanRegExp);
      if (booleanMatch) {
        return booleanMatch[1] === '1';
      }

      return v;
    });

  const configKeys = Object.keys(pattern.defaultConfig);

  return serializedConfigValues.reduce((config, serializedValue, i) => {
    if (serializedValue !== null) {
      const key = configKeys[i];
      return { ...config, [key]: serializedValue };
    }

    return config;
  }, {} as TConfig);
}
