/**
 * Returns the greatest common divisor of two integers
 * https://en.wikipedia.org/wiki/Euclidean_algorithm
 * @param {number} int1
 * @param {number} int2
 * @returns number
 */
export function gcd(int1, int2) {
  if (!int2) return int1;

  return gcd(int2, int1 % int2);
}

/**
 * Fits the first size inside size2
 * @param {[number, number]} size1
 * @param {[number, number]} size2
 */
export function fitInside(size1, size2) {
  const ratio = Math.min(size2[0] / size1[0], size2[1] / size1[1]);
  return size1.map(v => v * ratio);
}

export const PI2 = Math.PI * 2;
