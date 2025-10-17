import { Coordinates } from '../types/general.types';

/**
 * Returns the greatest common divisor of two integers
 * https://en.wikipedia.org/wiki/Euclidean_algorithm
 * @param {number} int1
 * @param {number} int2
 * @returns number
 */
export function gcd(int1: number, int2: number): number {
  if (!int2) return int1;

  return gcd(int2, int1 % int2);
}

export const PI2 = Math.PI * 2;

export function distortionToAspectRatio(distortion: number): [number, number] {
  return distortion < 0
    ? [1 - Math.abs(distortion), 1]
    : [1 / (1 - distortion), 1];
}

export function getDistanceBetweenCoordinates(
  from: Coordinates,
  to: Coordinates
): number {
  return Math.hypot(to[0] - from[0], to[1] - from[1]);
}
