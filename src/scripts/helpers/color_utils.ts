import { ColorFormat, ColorValue, HSL, RGB } from './color/color.types';

const hslRegExp =
  /^hsl\((\d{1,3}(?:\.\d+)?),\s?(\d{1,3}(?:\.\d+)?)%,\s?(\d{1,3}(?:\.\d+)?)%\)$/;
const rgbRegExp = /^rgb\((\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\)$/;
const hexRegExp = /^#([0-9|a-f]{2})([0-9|a-f]{2})([0-9|a-f]{2})$/;

/**
 *
 * @param color Converts a color value string to a different format. For example, rgb(0,0,0) -> #000000.
 * @param targetFormat The target format (source is auto-detected)
 */
export function convertColorFormat(
  color: ColorValue,
  targetFormat: ColorFormat
): ColorValue {
  const format = getColorFormat(color);
  if (format === targetFormat) {
    return color;
  }

  if (format === 'hsl') {
    const [_, h, s, l] = color.match(hslRegExp);
    const rgb = hslToRgb(Number(h), Number(s), Number(l));

    return targetFormat === 'rgb'
      ? getRGBColorValue(rgb)
      : getHexColorValue(rgb);
  }

  const rgb =
    format === 'rgb'
      ? (color
          .match(rgbRegExp)
          .splice(1)
          .map(v => Number(v)) as RGB)
      : (color
          .match(hexRegExp)
          .slice(1)
          .map(v => parseInt(v, 16)) as RGB);

  switch (targetFormat) {
    case 'hsl':
      return getHSLColorValue(rgbToHsl(rgb));
    case 'rgb':
      return getRGBColorValue(rgb);
    case 'hex':
      return getHexColorValue(rgb);
  }
}

function getRGBColorValue(rgb: RGB): ColorValue {
  return `rgb(${rgb.join(', ')})`;
}

function getHSLColorValue([h, s, l]: HSL): ColorValue {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function getHexColorValue(rgb: RGB): ColorValue {
  return `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function getColorFormat(color: ColorValue): ColorFormat {
  if (hslRegExp.test(color)) {
    return 'hsl';
  }

  if (rgbRegExp.test(color)) {
    return 'rgb';
  }

  if (hexRegExp.test(color)) {
    return 'hex';
  }

  throw new Error(`Unknown color format for "${color}"`);
}

function hslToRgb(h: number, s: number, l: number): RGB {
  // normalize inputs
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    // 0 saturation means grayscale, in which case just return the lightness
    const gray = Math.round(l * 255);
    return [gray, gray, gray];
  }

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h / 60;
  const x = chroma * (1 - Math.abs((hPrime % 2) - 1));

  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (hPrime >= 0 && hPrime < 1) {
    r1 = chroma;
    g1 = x;
  } else if (hPrime < 2) {
    r1 = x;
    g1 = chroma;
  } else if (hPrime < 3) {
    g1 = chroma;
    b1 = x;
  } else if (hPrime < 4) {
    g1 = x;
    b1 = chroma;
  } else if (hPrime < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  const m = l - chroma / 2;

  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  // normalize to [0,1]
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    // saturation
    s = delta / (1 - Math.abs(2 * l - 1));

    // hue
    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60;
    if (h < 0) h += 360;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}
