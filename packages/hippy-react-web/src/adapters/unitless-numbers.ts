/**
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * This source code is based on react-native-web project.
 * https://github.com/necolas/react-native-web/blob/0.11.7/packages/react-native-web/src/modules/unitlessNumbers/index.js
 *
 * Copyright (c) Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const unitlessNumbers = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexOrder: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  fontWeight: true,
  gridRow: true,
  gridColumn: true,
  lineClamp: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
  // transform types
  scale: true,
  scaleX: true,
  scaleY: true,
  scaleZ: true,
  // RN properties
  shadowOpacity: true,
};

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
const prefixes = ['ms', 'Moz', 'O', 'Webkit'];

function prefixKey(prefix: string, key: string) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

Object.keys(unitlessNumbers).forEach((prop) => {
  prefixes.forEach((prefix) => {
    (unitlessNumbers as any)[prefixKey(prefix, prop)] = (unitlessNumbers as any)[prop];
  });
});

export default unitlessNumbers;
