const easing = {
  linear: x => x,
  inOutCirc(x) {
    return x < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
  },
  easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
  },
  fastSlowFast(t) {
    // Clamp t to [0,1] just to be safe
    t = Math.max(0, Math.min(1, t));
    // Custom easing formula: accelerates, slows in middle, then accelerates again
    return 0.5 * (1 - Math.cos(Math.PI * t)) ** 1.5;
  },
  fastInOutSquare(x) {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 2)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 2) / 2;
  },
  fastInOutCubic(x) {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 3)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 3) / 2;
  },
  fastInOutQuint(x) {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, 5)) / 2
      : 0.5 + Math.pow(x * 2 - 1, 5) / 2;
  },
  fastInOut(pow, x) {
    return x <= 0.5
      ? (1 - Math.pow(1 - x * 2, pow)) / 2
      : 0.5 + Math.pow(x * 2 - 1, pow) / 2;
  },
};

easing.fastInOut.requireParams = true;

export default easing;
