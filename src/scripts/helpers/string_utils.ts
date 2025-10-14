export function formatFractionAsPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatFractionAsAngle(value: number): string {
  return `${Math.round((value ?? 0) * 360)}°`;
}

export function capitalize(value: string): string {
  return value[0].toLocaleUpperCase() + value.slice(1);
}
