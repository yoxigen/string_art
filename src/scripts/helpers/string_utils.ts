import { roundNumber } from './math_utils';

export function formatFractionAsPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatFractionAsAngle(
  value: number,
  decimalPoints = 0
): string {
  return `${roundNumber((value ?? 0) * 360, decimalPoints)}°`;
}

export function capitalize(value: string): string {
  return value[0].toLocaleUpperCase() + value.slice(1);
}
