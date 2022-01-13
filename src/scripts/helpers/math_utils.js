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

export const PI2 = Math.PI * 2;
