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

export function roundNumber(v: number, decimalPoints: number): number {
  const pow10 = Math.pow(10, decimalPoints);
  return Math.round(v * pow10) / pow10;
}

const SMALLEST_DISTANCE = Math.pow(10, -8);
/**
 * Returns the shortest distance between any two points, that isn't 0
 * @param points
 * @returns
 */
export function getClosestDistance(points: Coordinates[]): number {
  if (points.length < 2) return Infinity;

  const ptsByX = [...points].sort((a, b) => a[0] - b[0]);
  const ptsByY = [...points].sort((a, b) => a[1] - b[1]);

  // If two points are closest than SMALLEST_DISTANCE, it's considered that they're on the same place and the same, the distance isn't used
  const recurse = (px: Coordinates[], py: Coordinates[]): number => {
    const n = px.length;
    if (n <= 3) {
      let min = Infinity;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const pointsDist = getDistanceBetweenCoordinates(px[i], px[j]);
          if (pointsDist >= SMALLEST_DISTANCE) {
            min = Math.min(min, pointsDist);
          }
        }
      }
      return min;
    }

    const mid = Math.floor(n / 2);
    const midX = px[mid][0];
    const leftX = px.slice(0, mid);
    const rightX = px.slice(mid);

    const leftY: Coordinates[] = [];
    const rightY: Coordinates[] = [];
    for (const p of py) {
      (p[0] <= midX ? leftY : rightY).push(p);
    }

    const dLeft = recurse(leftX, leftY);
    const dRight = recurse(rightX, rightY);
    let d = Math.min(dLeft, dRight);

    // Build strip around mid line
    const strip = py.filter(p => Math.abs(p[0] - midX) < d);

    // Check up to 7 points ahead for each in strip
    for (let i = 0; i < strip.length; i++) {
      for (
        let j = i + 1;
        j < strip.length && strip[j][1] - strip[i][1] < d;
        j++
      ) {
        const stripDist = getDistanceBetweenCoordinates(strip[i], strip[j]);
        if (stripDist >= SMALLEST_DISTANCE) {
          d = Math.min(d, stripDist);
        }
      }
    }

    return d;
  };

  return recurse(ptsByX, ptsByY);
}
