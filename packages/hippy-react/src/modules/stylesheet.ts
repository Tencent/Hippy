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

import { Device } from '../native';

const ratio = Device.window.scale;
/* eslint-disable-next-line import/no-mutable-exports */
let HAIRLINE_WIDTH = Math.round(0.4 * ratio) / ratio;
if (HAIRLINE_WIDTH === 0) {
  HAIRLINE_WIDTH = 1 / ratio;
}

export interface StyleObj {
  [key: string]: HippyTypes.Style;
}

/**
 * Create new Stylesheet
 * @param {object} styleObj - The style object
 */
function create(styleObj: StyleObj): StyleObj {
  // TODO: validate the style key and value.
  // TODO: Convert the color and pixel unit at create.
  return styleObj;
}


/**
 * Flattens an array of style objects, into one aggregated style object.
 * Alternatively, this method can be used to lookup IDs, returned by
 * StyleSheet.register.
 *
 * > **NOTE**: Exercise caution as abusing this can tax you in terms of
 * > optimizations.
 * >
 * > IDs enable optimizations through the bridge and memory in general. Referring
 * > to style objects directly will deprive you of these optimizations.
 *
 * Example:
 * ```
 * const styles = StyleSheet.create({
 *   listItem: {
 *     flex: 1,
 *     fontSize: 16,
 *     color: 'white'
 *   },
 *   selectedListItem: {
 *     color: 'green'
 *   }
 * });
 *
 * StyleSheet.flatten([styles.listItem, styles.selectedListItem])
 * // returns { flex: 1, fontSize: 16, color: 'green' }
 * ```
 * Alternative use:
 * ```
 * StyleSheet.flatten(styles.listItem);
 * // return { flex: 1, fontSize: 16, color: 'white' }
 * // Simply styles.listItem would return its ID (number)
 * ```
 * This method internally uses `StyleSheetRegistry.getStyleByID(style)`
 * to resolve style objects represented by IDs. Thus, an array of style
 * objects (instances of StyleSheet.create), are individually resolved to,
 * their respective objects, merged as one and then returned. This also explains
 * the alternative use.
 */
function flatten(style: HippyTypes.StyleProp | null | undefined): HippyTypes.Style {
  if (style === null || typeof style !== 'object') {
    return {};
  }

  if (!Array.isArray(style)) {
    return style;
  }

  const result = {};
  for (let i = 0, styleLength = style.length; i < styleLength; ++i) {
    const computedStyle = flatten(style[i]);
    if (computedStyle) {
      Object.entries(computedStyle).forEach(([key, value]) => {
        result[key] = value;
      });
    }
  }
  return result;
}

export const StyleSheet = {
  hairlineWidth: HAIRLINE_WIDTH,
  create,
  flatten,
};

export default StyleSheet;
