const easing = {
  linear: x => x,
  inOutCirc(x: number): number {
    return x < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
  },
  easeOutQuint(x: number): number {
    return 1 - Math.pow(1 - x, 5);
  },
  fastSlowFast(t: number): number {
    // Clamp t to [0,1] just to be safe
    t = Math.max(0, Math.min(1, t));
    // Custom easing formula: accelerates, slows in middle, then accelerates again
    return 0.5 * (1 - Math.cos(Math.PI * t)) ** 1.5;
  },
  fastInOutSquare(x: number): number {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 2)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 2) / 2;
  },
  fastInOutCubic(x: number): number {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 3)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 3) / 2;
  },
  fastInOutQuint(x: number): number {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 5)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 5) / 2;
  },
  fastInOut(pow: number, x: number): number {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, pow)) / 2
      : 0.5 + Math.pow(x * 2 - 1, pow) / 2;
  },
  fastInOutFixed(pow: number, fastArea: number, x: number): number {
    if (x > fastArea && x < 1 - fastArea) {
      const y1 = (1 - Math.pow(1 - fastArea * 2, pow)) / 2;
      const y2 = 0.5 + Math.pow((1 - fastArea) * 2 - 1, pow) / 2;

      return y1 + ((x - fastArea) * (y2 - y1)) / (1 - 2 * fastArea);
    }
    return x <= fastArea
      ? (1 - Math.pow(1 - x * 2, pow)) / 2
      : 0.5 + Math.pow(x * 2 - 1, pow) / 2;
  },
};

easing.fastInOut.requirePower = true;
easing.fastInOutFixed.requirePower = true;
easing.fastInOutFixed.requireFastArea = true;

export default easing;
