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

import TDFInspector = ProtocolTdf.TDFInspector;

export const marginOrPaddingNormalize = (flexSpacing: HippyFlexSpacing) => {
  if (!flexSpacing) return null;
  let left = 0;
  let right = 0;
  let bottom = 0;
  let top = 0;
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.all]) {
    left = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    right = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    bottom = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    top = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.vertical]) {
    top = flexSpacing[HIPPY_FLEX_SPACING_KEY.vertical];
    bottom = flexSpacing[HIPPY_FLEX_SPACING_KEY.vertical];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.horizontal]) {
    left = flexSpacing[HIPPY_FLEX_SPACING_KEY.horizontal];
    right = flexSpacing[HIPPY_FLEX_SPACING_KEY.horizontal];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.left]) {
    left = flexSpacing[HIPPY_FLEX_SPACING_KEY.left];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.right]) {
    right = flexSpacing[HIPPY_FLEX_SPACING_KEY.right];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.top]) {
    top = flexSpacing[HIPPY_FLEX_SPACING_KEY.top];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.bottom]) {
    bottom = flexSpacing[HIPPY_FLEX_SPACING_KEY.bottom];
  }

  return {
    left,
    right,
    top,
    bottom,
  };
};

export const borderNormalize = (flexSpacing: HippyFlexSpacing) => {
  if (!flexSpacing) return null;
  let left = 0;
  let right = 0;
  let top = 0;
  let bottom = 0;
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.all]) {
    left = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    right = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    top = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
    bottom = flexSpacing[HIPPY_FLEX_SPACING_KEY.all];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.left]) {
    left = flexSpacing[HIPPY_FLEX_SPACING_KEY.left];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.right]) {
    right = flexSpacing[HIPPY_FLEX_SPACING_KEY.right];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.top]) {
    top = flexSpacing[HIPPY_FLEX_SPACING_KEY.top];
  }
  if (flexSpacing[HIPPY_FLEX_SPACING_KEY.bottom]) {
    bottom = flexSpacing[HIPPY_FLEX_SPACING_KEY.bottom];
  }

  return {
    left,
    right,
    top,
    bottom,
  };
};

export const HIPPY_FLEX_SPACING_KEY = {
  left: 0,
  top: 1,
  right: 2,
  bottom: 3,
  start: 4,
  end: 5,
  horizontal: 6,
  vertical: 7,
  all: 8,
};

/**
 * 获取 DOM 节点的 bounds，包括 margin, padding, border, content
 * @param node DOM node
 * @param param1
 * @returns
 */
export const getDomNodeBounds = (
  node: TDFInspector.ITree,
  { rootWidth, rootHeight, imgWidth, imgHeight }: TDFInspector.RatioOption,
) => {
  if (!node?.bounds)
    return {
      marginBounds: {},
      borderBounds: {},
      paddingBounds: {},
      contentBounds: {},
    };

  const {
    bounds: { bottom, top, left, right },
    flexNodeStyle: { margin = {}, padding = {}, border = {} } = {},
  } = node;

  const normalizedMargin = marginOrPaddingNormalize(margin as unknown as HippyFlexSpacing);
  const normalizedPadding = marginOrPaddingNormalize(padding as unknown as HippyFlexSpacing);
  const normalizedBorder = borderNormalize(border as unknown as HippyFlexSpacing);
  const horizonRatio = imgWidth / rootWidth;
  const verticalRatio = imgHeight / rootHeight;

  const marginBounds = normalizedMargin
    ? {
        left: left - normalizedMargin.left,
        top: top - normalizedMargin.top,
        right: right + normalizedMargin.right,
        bottom: bottom + normalizedMargin.bottom,
        borderLeftWidth: normalizedMargin.left * horizonRatio,
        borderRightWidth: normalizedMargin.right * horizonRatio,
        borderTopWidth: normalizedMargin.top * verticalRatio,
        borderBottomWidth: normalizedMargin.bottom * verticalRatio,
        boxSizing: 'border-box',
      }
    : null;

  const borderBounds = normalizedBorder
    ? {
        left,
        right,
        top,
        bottom,
        borderLeftWidth: normalizedBorder.left * horizonRatio,
        borderRightWidth: normalizedBorder.right * horizonRatio,
        borderTopWidth: normalizedBorder.top * verticalRatio,
        borderBottomWidth: normalizedBorder.bottom * verticalRatio,
        boxSizing: 'border-box',
      }
    : null;
  const paddingBounds =
    normalizedPadding && normalizedBorder
      ? {
          left: left + normalizedBorder.left,
          right: right - normalizedBorder.right,
          top: top + normalizedBorder.top,
          bottom: bottom - normalizedBorder.bottom,
          borderLeftWidth: normalizedPadding.left * horizonRatio,
          borderRightWidth: normalizedPadding.right * horizonRatio,
          borderTopWidth: normalizedPadding.top * verticalRatio,
          borderBottomWidth: normalizedPadding.bottom * verticalRatio,
          boxSizing: 'border-box',
        }
      : null;
  const contentBounds =
    paddingBounds && normalizedPadding
      ? {
          left: paddingBounds.left + normalizedPadding.left,
          right: paddingBounds.right - normalizedPadding.right,
          top: paddingBounds.top + normalizedPadding.top,
          bottom: paddingBounds.bottom - normalizedPadding.bottom,
        }
      : null;

  return {
    marginBounds: boundsNormalize(marginBounds, rootWidth, rootHeight),
    borderBounds: boundsNormalize(borderBounds, rootWidth, rootHeight),
    paddingBounds: boundsNormalize(paddingBounds, rootWidth, rootHeight),
    contentBounds: boundsNormalize(contentBounds, rootWidth, rootHeight),
  };
};

/**
 * 获取 Render 节点的 bounds，包括 margin, padding, border, content
 * @param node render node
 * @param param1
 * @returns
 */
export const getRenderNodeBounds = (node: TDFInspector.RTree, { rootWidth, rootHeight }: TDFInspector.RatioOption) => {
  if (!node?.bounds)
    return {
      marginBounds: {},
      borderBounds: {},
      paddingBounds: {},
      contentBounds: {},
    };

  const {
    bounds: { bottom, top, left, right },
  } = node;

  const contentBounds = {
    left,
    right,
    top,
    bottom,
  };

  return {
    marginBounds: {},
    borderBounds: {},
    paddingBounds: {},
    contentBounds: boundsNormalize(contentBounds, rootWidth, rootHeight),
  };
};

export type HippyFlexSpacing = [
  left: number,
  top: number,
  right: number,
  bottom: number,
  start: number,
  end: number,
  horizontal: number,
  vertical: number,
  all: number,
];

/**
 * 统一bounds单位，positon 用百分比，border 用 px
 * @param bounds
 * @param rootWidth 根节点宽
 * @param rootHeight 根节点高
 * @returns
 */
const boundsNormalize = (
  bounds: TDFInspector.INodeBoundsStyle | null,
  rootWidth: number,
  rootHeight: number,
): TDFInspector.INodeBoundsStyleString => {
  if (!bounds) return {};
  const {
    left,
    right,
    top,
    bottom,
    borderLeftWidth = 0,
    borderRightWidth = 0,
    borderTopWidth = 0,
    borderBottomWidth = 0,
    boxSizing,
  } = bounds;
  return {
    left: `${(left * 100) / rootWidth}%`,
    right: `${(right * 100) / rootWidth}%`,
    top: `${(top * 100) / rootHeight}%`,
    bottom: `${(bottom * 100) / rootHeight}%`,
    width: `${((right - left) * 100) / rootWidth}%`,
    height: `${((bottom - top) * 100) / rootHeight}%`,
    borderLeftWidth: `${borderLeftWidth}px`,
    borderRightWidth: `${borderRightWidth}px`,
    borderTopWidth: `${borderTopWidth}px`,
    borderBottomWidth: `${borderBottomWidth}px`,
    boxSizing,
  };
};
