export function createArray<T>(
  size: number,
  mapper: (index: number) => T
): T[] {
  return new Array(size).fill(null).map((_, i) => mapper(i));
}
