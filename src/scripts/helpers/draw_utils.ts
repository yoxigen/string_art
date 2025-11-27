export function* connectTwoSides(
  countPerSide: number,
  sides = [0, 1]
): Generator<{ side: number; index: number }> {
  let alternate = false;
  for (let index = 0; index < countPerSide; index++) {
    yield { side: sides[alternate ? 1 : 0], index };
    yield { side: sides[alternate ? 0 : 1], index };

    alternate = !alternate;
  }
}

export function getConnectTwoSidesStepCount(countPerSide: number): number {
  return countPerSide * 2;
}
