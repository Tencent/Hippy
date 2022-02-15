import normalizeCSSColor from 'normalize-css-color';

const processColor = (color?: HippyTypes.color): string | number | undefined => {
  if (!color) return color;

  let int32Color: any = normalizeCSSColor(color);
  if (int32Color === undefined || int32Color === null) {
    return undefined;
  }

  int32Color = ((int32Color << 24) | (int32Color >>> 8)) >>> 0;

  return int32Color;
};

export const normalizeColor = (color?: HippyTypes.color, opacity = 1): void | string => {
  if (!color) return;

  if (typeof color === 'string') {
    return color;
  }
  const colorInt: any = processColor(color);

  const r = (colorInt >> 16) & 255;
  const g = (colorInt >> 8) & 255;
  const b = colorInt & 255;
  const a = ((colorInt >> 24) & 255) / 255;
  const alpha = (a * opacity).toFixed(2);
  return `rgba(${r},${g},${b},${alpha})`;
};
