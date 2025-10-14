export function formatFractionAsPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function capitalize(value: string): string {
  return value[0].toLocaleUpperCase() + value.slice(1);
}
