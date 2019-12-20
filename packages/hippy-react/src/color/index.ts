/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */

import Hippy from '@localTypes/hippy';
import baseColor from './color-parser';
import { Device } from '../native';
import { warn } from '../utils';

type Color = string | number;


interface ColorParserOption {
  platform?: Hippy.Platform
}

/**
 * Parse the color value to integer that native understand.
 *
 * @param {string} color - The color value.
 * @param {object} options - Color options.
 * @param {android|ios} options.platform - Current executing platform.
 */
function colorParse(color: Color, options: ColorParserOption = {}) {
  if (Number.isInteger((color as number))) {
    return color;
  }
  let int32Color = baseColor(color);
  if (!options.platform) {
    /* eslint-disable-next-line no-param-reassign */
    options.platform = __PLATFORM__ || Device.platform.OS;
  }
  if (int32Color === null) {
    return 0;
  }

  int32Color = (int32Color << 24 | int32Color >>> 8) >>> 0;
  if (options.platform === 'android') {
    int32Color |= 0;
  }
  return int32Color;
}

/**
 * Parse the color values array to integer array that native understand.
 *
 * @param {string[]} colorArray The color values array.
 * @param {object} options Color options.
 * @param {android|ios} options.platform Current executing platform.
 */
function colorArrayParse(colorArray: Color[], options?: ColorParserOption) {
  if (!Array.isArray(colorArray)) {
    warn('Input color value is not a array', colorArray);
    return [0];
  }
  return colorArray.map(color => colorParse(color, options));
}

export {
  Color,
  colorParse,
  colorArrayParse,
};
