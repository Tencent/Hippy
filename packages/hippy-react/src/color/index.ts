/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-mixed-operators */

import Hippy from '@localTypes/hippy';
import { Device } from '../native';
import { warn } from '../utils';
import baseColor from './color-parser';

type Color = string | number;

// eslint-disable-next-line no-underscore-dangle
declare const __PLATFORM__: Hippy.Platform;

interface ColorParserOption {
  platform?: Hippy.Platform
}

/**
 * Parse the color value to integer that native understand.
 *
 * @param {string} color - The color value.
 * @param {object} options - Color options.
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
