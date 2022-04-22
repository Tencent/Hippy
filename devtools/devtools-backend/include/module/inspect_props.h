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

#pragma once

namespace tdf {
namespace devtools {

constexpr const char *kFrontendKeyQuality = "quality";
constexpr const char *kFrontendKeyMaxWidth = "maxWidth";
constexpr const char *kFrontendKeyMaxHeight = "maxHeight";
constexpr const char *kFrontendKeyFormat = "format";
constexpr const char *kFrontendKeyDeviceWidth = "deviceWidth";
constexpr const char *kFrontendKeyDeviceHeight = "deviceHeight";
constexpr const char *kFrontendKeyMetadata = "metadata";
constexpr const char *kFrontendKeySessionId = "sessionId";
constexpr const char *kFrontendKeyItree = "itree";
constexpr const char *kFrontendKeyRtree = "rtree";
constexpr const char *kFrontendKeyData = "data";
constexpr const char *kFrontendKeyTimestamp = "timestamp";
constexpr const char *kFrontendKeyBase64 = "base64";
constexpr const char *kFrontendKeyMethod = "method";
constexpr const char *kFrontendKeyParams = "params";
constexpr const char *kFrontendKeyId = "id";
constexpr const char *kFrontendKeyNodeId = "nodeId";
constexpr const char *kFrontendKeyStyleSheetId = "styleSheetId";
constexpr const char *kFrontendKeyEdits = "edits";


constexpr const char* kOverflow = "overflow";
constexpr const char* kCollapsable = "collapsable";
constexpr const char* kJustifyContent = "justifyContent";
constexpr const char* kDisplay = "display";
constexpr const char* kPosition = "position";
constexpr const char* kZIndex = "zIndex";
constexpr const char* kOpacity = "opacity";
constexpr const char* kFontSize = "fontSize";
constexpr const char* kLineHeight = "lineHeight";
constexpr const char* kLetterSpacing = "letterSpacing";
constexpr const char* kFontWeight = "fontWeight";
constexpr const char* kFontStyle = "fontStyle";
constexpr const char* kBackgroundSize = "backgroundSize";
constexpr const char* kBackgroundPositionX = "backgroundPositionX";
constexpr const char* kBackgroundPositionY = "backgroundPositionY";
constexpr const char* kTextAlign = "textAlign";
constexpr const char* kResizeMode = "resizeMode";

// Rect
constexpr const char* kLeft = "left";
constexpr const char* kTop = "top";
constexpr const char* kRight = "right";
constexpr const char* kBottom = "bottom";
constexpr const char* kWidth = "width";
constexpr const char* kHeight = "height";
constexpr const char* kMinWidth = "minWidth";
constexpr const char* kMaxWidth = "maxWidth";
constexpr const char* kMinHeight = "minHeight";
constexpr const char* kMaxHeight = "maxHeight";

// Flex
constexpr const char* kFlex = "flex";
constexpr const char* kFlexGrow = "flexGrow";
constexpr const char* kFlexShrink = "flexShrink";
constexpr const char* kFlexBasis = "flexBasis";
constexpr const char* kFlexDirection = "flexDirection";
constexpr const char* kFlexWrap = "flexWrap";

// align
constexpr const char* kAlignItems = "alignItems";
constexpr const char* kAlignSelf = "alignSelf";

// Border
constexpr const char* kBorder = "border";
constexpr const char* kBorderWidth = "borderWidth";
constexpr const char* kBorderLeftWidth = "borderLeftWidth";
constexpr const char* kBorderTopWidth = "borderTopWidth";
constexpr const char* kBorderRightWidth = "borderRightWidth";
constexpr const char* kBorderBottomWidth = "borderBottomWidth";
constexpr const char* kBorderColor = "borderColor";
constexpr const char* kBorderLeftColor = "borderLeftColor";
constexpr const char* kBorderTopColor = "borderTopColor";
constexpr const char* kBorderRightColor = "borderRightColor";
constexpr const char* kBorderBottomColor = "borderBottomColor";
constexpr const char* kBorderStyle = "borderStyle";
constexpr const char* kBorderRadius = "borderRadius";
constexpr const char* kBorderTopLeftRadius = "borderTopLeftRadius";
constexpr const char* kBorderTopRightRadius = "borderTopRightRadius";
constexpr const char* kBorderBottomLeftRadius = "borderBottomLeftRadius";
constexpr const char* kBorderBottomRightRadius = "borderBottomRightRadius";

// Padding
constexpr const char* kPadding = "padding";
constexpr const char* kPaddingLeft = "paddingLeft";
constexpr const char* kPaddingTop = "paddingTop";
constexpr const char* kPaddingRight = "paddingRight";
constexpr const char* kPaddingBottom = "paddingBottom";

// Margin
constexpr const char* kMargin = "margin";
constexpr const char* kMarginLeft = "marginLeft";
constexpr const char* kMarginTop = "marginTop";
constexpr const char* kMarginRight = "marginRight";
constexpr const char* kMarginBottom = "marginBottom";

// shadow
constexpr const char* kShadowColor = "shadowColor";
constexpr const char* kShadowOffset = "shadowOffset";
constexpr const char* kShadowOffsetX = "shadowOffsetX";
constexpr const char* kShadowOffsetY = "shadowOffsetY";
constexpr const char* kShadowOpacity = "shadowOpacity";
constexpr const char* kShadowRadius = "shadowRadius";
constexpr const char* kShadowSpread = "shadowSpread";

// style value define
// general
constexpr const char* kFlexStart = "flex-start";
constexpr const char* kCenter = "center";
constexpr const char* kFlexEnd = "flex-end";
constexpr const char* kStretch = "stretch";
constexpr const char* kBaseline = "baseline";
constexpr const char* kAuto = "auto";
constexpr const char* kNormal = "normal";
constexpr const char* kItalic = "italic";
constexpr const char* kBold = "bold";
constexpr const char* kContain = "contain";
constexpr const char* kCover = "cover";
constexpr const char* kRepeat = "repeat";
// display
constexpr const char* kDisplayFlex = "flex";
constexpr const char* kDisplayNone = "none";
// flex direction
constexpr const char* kFlexDirectionColumn = "column";
constexpr const char* kFlexDirectionColumnReverse = "column-reverse";
constexpr const char* kFlexDirectionRow = "row";
constexpr const char* kFlexDirectionRowReverse = "row-reverse";
// flex wrap
constexpr const char* kFlexWrapNowrap = "nowrap";
constexpr const char* kFlexWrapWrap = "wrap";
constexpr const char* kFlexWrapWrapReverse = "wrap-reverse";
// justify content
constexpr const char* kJustifyContentSpaceBetween = "space-between";
constexpr const char* kJustifyContentSpaceAround = "space-around";
constexpr const char* kJustifyContentSpaceEvenly = "space-evenly";
// overflow
constexpr const char* kOverflowHidden = "hidden";
constexpr const char* kOverflowVisible = "visible";
constexpr const char* kOverflowScroll = "scroll";
// position
constexpr const char* kPositionRelative = "relative";
constexpr const char* kPositionAbsolute = "absolute";
// background size
constexpr const char* kBackgroundSizeFit = "fit";
// font weight
constexpr const char* kFontWeight100 = "100";
constexpr const char* kFontWeight200 = "200";
constexpr const char* kFontWeight300 = "300";
constexpr const char* kFontWeight400 = "400";
constexpr const char* kFontWeight500 = "500";
constexpr const char* kFontWeight600 = "600";
constexpr const char* kFontWeight700 = "700";
constexpr const char* kFontWeight800 = "800";
constexpr const char* kFontWeight900 = "900";

}  // namespace devtools
}  // namespace tdf
