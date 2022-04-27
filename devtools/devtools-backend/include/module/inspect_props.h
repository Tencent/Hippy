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

namespace hippy::devtools {

constexpr char kFrontendKeyQuality[] ="quality";
constexpr char kFrontendKeyMaxWidth[] ="maxWidth";
constexpr char kFrontendKeyMaxHeight[] ="maxHeight";
constexpr char kFrontendKeyFormat[] ="format";
constexpr char kFrontendKeyDeviceWidth[] ="deviceWidth";
constexpr char kFrontendKeyDeviceHeight[] ="deviceHeight";
constexpr char kFrontendKeyMetadata[] ="metadata";
constexpr char kFrontendKeySessionId[] ="sessionId";
constexpr char kFrontendKeyItree[] ="itree";
constexpr char kFrontendKeyRtree[] ="rtree";
constexpr char kFrontendKeyData[] ="data";
constexpr char kFrontendKeyTimestamp[] ="timestamp";
constexpr char kFrontendKeyBase64[] ="base64";
constexpr char kFrontendKeyMethod[] ="method";
constexpr char kFrontendKeyParams[] ="params";
constexpr char kFrontendKeyId[] ="id";
constexpr char kFrontendKeyNodeId[] ="nodeId";
constexpr char kFrontendKeyStyleSheetId[] ="styleSheetId";
constexpr char kFrontendKeyEdits[] ="edits";


constexpr char kOverflow[] ="overflow";
constexpr char kCollapsable[] ="collapsable";
constexpr char kJustifyContent[] ="justifyContent";
constexpr char kDisplay[] ="display";
constexpr char kPosition[] ="position";
constexpr char kZIndex[] ="zIndex";
constexpr char kOpacity[] ="opacity";
constexpr char kFontSize[] ="fontSize";
constexpr char kLineHeight[] ="lineHeight";
constexpr char kLetterSpacing[] ="letterSpacing";
constexpr char kFontWeight[] ="fontWeight";
constexpr char kFontStyle[] ="fontStyle";
constexpr char kBackgroundSize[] ="backgroundSize";
constexpr char kBackgroundPositionX[] ="backgroundPositionX";
constexpr char kBackgroundPositionY[] ="backgroundPositionY";
constexpr char kTextAlign[] ="textAlign";
constexpr char kResizeMode[] ="resizeMode";

// Rect
constexpr char kLeft[] ="left";
constexpr char kTop[] ="top";
constexpr char kRight[] ="right";
constexpr char kBottom[] ="bottom";
constexpr char kWidth[] ="width";
constexpr char kHeight[] ="height";
constexpr char kMinWidth[] ="minWidth";
constexpr char kMaxWidth[] ="maxWidth";
constexpr char kMinHeight[] ="minHeight";
constexpr char kMaxHeight[] ="maxHeight";

// Flex
constexpr char kFlex[] ="flex";
constexpr char kFlexGrow[] ="flexGrow";
constexpr char kFlexShrink[] ="flexShrink";
constexpr char kFlexBasis[] ="flexBasis";
constexpr char kFlexDirection[] ="flexDirection";
constexpr char kFlexWrap[] ="flexWrap";

// align
constexpr char kAlignItems[] ="alignItems";
constexpr char kAlignSelf[] ="alignSelf";

// Border
constexpr char kBorder[] ="border";
constexpr char kBorderWidth[] ="borderWidth";
constexpr char kBorderLeftWidth[] ="borderLeftWidth";
constexpr char kBorderTopWidth[] ="borderTopWidth";
constexpr char kBorderRightWidth[] ="borderRightWidth";
constexpr char kBorderBottomWidth[] ="borderBottomWidth";
constexpr char kBorderColor[] ="borderColor";
constexpr char kBorderLeftColor[] ="borderLeftColor";
constexpr char kBorderTopColor[] ="borderTopColor";
constexpr char kBorderRightColor[] ="borderRightColor";
constexpr char kBorderBottomColor[] ="borderBottomColor";
constexpr char kBorderStyle[] ="borderStyle";
constexpr char kBorderRadius[] ="borderRadius";
constexpr char kBorderTopLeftRadius[] ="borderTopLeftRadius";
constexpr char kBorderTopRightRadius[] ="borderTopRightRadius";
constexpr char kBorderBottomLeftRadius[] ="borderBottomLeftRadius";
constexpr char kBorderBottomRightRadius[] ="borderBottomRightRadius";

// Padding
constexpr char kPadding[] ="padding";
constexpr char kPaddingLeft[] ="paddingLeft";
constexpr char kPaddingTop[] ="paddingTop";
constexpr char kPaddingRight[] ="paddingRight";
constexpr char kPaddingBottom[] ="paddingBottom";

// Margin
constexpr char kMargin[] ="margin";
constexpr char kMarginLeft[] ="marginLeft";
constexpr char kMarginTop[] ="marginTop";
constexpr char kMarginRight[] ="marginRight";
constexpr char kMarginBottom[] ="marginBottom";

// shadow
constexpr char kShadowColor[] ="shadowColor";
constexpr char kShadowOffset[] ="shadowOffset";
constexpr char kShadowOffsetX[] ="shadowOffsetX";
constexpr char kShadowOffsetY[] ="shadowOffsetY";
constexpr char kShadowOpacity[] ="shadowOpacity";
constexpr char kShadowRadius[] ="shadowRadius";
constexpr char kShadowSpread[] ="shadowSpread";

// style value define
// general
constexpr char kFlexStart[] ="flex-start";
constexpr char kCenter[] ="center";
constexpr char kFlexEnd[] ="flex-end";
constexpr char kStretch[] ="stretch";
constexpr char kBaseline[] ="baseline";
constexpr char kAuto[] ="auto";
constexpr char kNormal[] ="normal";
constexpr char kItalic[] ="italic";
constexpr char kBold[] ="bold";
constexpr char kContain[] ="contain";
constexpr char kCover[] ="cover";
constexpr char kRepeat[] ="repeat";
// display
constexpr char kDisplayFlex[] ="flex";
constexpr char kDisplayNone[] ="none";
// flex direction
constexpr char kFlexDirectionColumn[] ="column";
constexpr char kFlexDirectionColumnReverse[] ="column-reverse";
constexpr char kFlexDirectionRow[] ="row";
constexpr char kFlexDirectionRowReverse[] ="row-reverse";
// flex wrap
constexpr char kFlexWrapNowrap[] ="nowrap";
constexpr char kFlexWrapWrap[] ="wrap";
constexpr char kFlexWrapWrapReverse[] ="wrap-reverse";
// justify content
constexpr char kJustifyContentSpaceBetween[] ="space-between";
constexpr char kJustifyContentSpaceAround[] ="space-around";
constexpr char kJustifyContentSpaceEvenly[] ="space-evenly";
// overflow
constexpr char kOverflowHidden[] ="hidden";
constexpr char kOverflowVisible[] ="visible";
constexpr char kOverflowScroll[] ="scroll";
// position
constexpr char kPositionRelative[] ="relative";
constexpr char kPositionAbsolute[] ="absolute";
// background size
constexpr char kBackgroundSizeFit[] ="fit";
// font weight
constexpr char kFontWeight100[] ="100";
constexpr char kFontWeight200[] ="200";
constexpr char kFontWeight300[] ="300";
constexpr char kFontWeight400[] ="400";
constexpr char kFontWeight500[] ="500";
constexpr char kFontWeight600[] ="600";
constexpr char kFontWeight700[] ="700";
constexpr char kFontWeight800[] ="800";
constexpr char kFontWeight900[] ="900";

}  // namespace devtools::devtools
