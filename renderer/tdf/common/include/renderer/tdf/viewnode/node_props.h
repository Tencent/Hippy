/**
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

namespace tdfrender {
constexpr const char kCustomProps[] = "CustomProps";
inline namespace customprops {}
constexpr const char kImage[] = "Image";
inline namespace image {
constexpr const char kBackgroundColor[] = "backgroundColor";        // int
constexpr const char kCapInsets[] = "capInsets";                    // HippyMap
constexpr const char kDefaultSource[] = "defaultSource";            // String
constexpr const char kHeight[] = "height";                          // float
constexpr const char kImageType[] = "imageType";                    // String
constexpr const char kLeft[] = "left";                              // float
constexpr const char kOnError[] = "onError";                        // boolean
constexpr const char kOnLoad[] = "onLoad";                          // boolean
constexpr const char kOnLoadEnd[] = "onLoadEnd";                    // boolean
constexpr const char kOnLoadStart[] = "onLoadStart";                // boolean
constexpr const char kOnProgress[] = "onProgress";                  // boolean
constexpr const char kResizeMode[] = "resizeMode";                  // String
constexpr const char kSrc[] = "src";                                // String
constexpr const char kTintColor[] = "tintColor";                    // int
constexpr const char kTintColorBlendMode[] = "tintColorBlendMode";  // int
constexpr const char kTop[] = "top";                                // float
constexpr const char kVerticalAlignment[] = "verticalAlignment";    // int
constexpr const char kWidth[] = "width";                            // float
}  // namespace image
constexpr const char kListView[] = "ListView";
inline namespace listview {
constexpr const char kBounces[] = "bounces";                              // boolean
constexpr const char kExposureEventEnabled[] = "exposureEventEnabled";    // boolean
constexpr const char kOnMomentumScrollBegin[] = "onMomentumScrollBegin";  // boolean
constexpr const char kOnMomentumScrollEnd[] = "onMomentumScrollEnd";      // boolean
constexpr const char kOnScrollBeginDrag[] = "onScrollBeginDrag";          // boolean
constexpr const char kOnScrollEnable[] = "onScrollEnable";                // boolean
constexpr const char kOnScrollEndDrag[] = "onScrollEndDrag";              // boolean
constexpr const char kOverScrollEnabled[] = "overScrollEnabled";          // boolean
constexpr const char kPreloadItemNumber[] = "preloadItemNumber";          // int
constexpr const char kRowShouldSticky[] = "rowShouldSticky";              // boolean
constexpr const char kScrollEnabled[] = "scrollEnabled";                  // boolean
constexpr const char kScrollEventThrottle[] = "scrollEventThrottle";      // int
constexpr const char kSuspendViewListener[] = "suspendViewListener";      // int
}  // namespace listview
constexpr const char kListViewItem[] = "ListViewItem";
inline namespace listviewitem {}
constexpr const char kModal[] = "Modal";
inline namespace modal {
constexpr const char kAnimationType[] = "animationType";            // String
constexpr const char kDarkStatusBarText[] = "darkStatusBarText";    // boolean
constexpr const char kImmersionStatusBar[] = "immersionStatusBar";  // boolean
constexpr const char kTransparent[] = "transparent";                // boolean
}  // namespace modal
constexpr const char kPullFooterView[] = "PullFooterView";
inline namespace pullfooterview {
constexpr const char kSticky[] = "sticky";  // boolean
}
constexpr const char kPullHeaderView[] = "PullHeaderView";
inline namespace pullheaderview {}
constexpr const char kRefreshWrapper[] = "RefreshWrapper";
inline namespace refreshwrapper {
constexpr const char kBounceTime[] = "bounceTime";                    // int
constexpr const char kOnScrollEnable[] = "onScrollEnable";            // boolean
constexpr const char kScrollEventThrottle[] = "scrollEventThrottle";  // int
}  // namespace refreshwrapper
constexpr const char kRefreshWrapperItemView[] = "RefreshWrapperItemView";
inline namespace refreshwrapperitemview {}
constexpr const char kScrollView[] = "ScrollView";
inline namespace scrollview {
constexpr const char kContentOffset4Reuse[] = "contentOffset4Reuse";    // HippyMap
constexpr const char kFlingEnabled[] = "flingEnabled";                  // boolean
constexpr const char kInitialContentOffset[] = "initialContentOffset";  // int
constexpr const char kPagingEnabled[] = "pagingEnabled";                // boolean
constexpr const char kScrollEnabled[] = "scrollEnabled";                // boolean
constexpr const char kScrollEventThrottle[] = "scrollEventThrottle";    // int
constexpr const char kScrollMinOffset[] = "scrollMinOffset";            // int
constexpr const char kShowScrollIndicator[] = "showScrollIndicator";    // boolean
}  // namespace scrollview
constexpr const char kText[] = "Text";
inline namespace text {
constexpr const char kColor[] = "color";                                  // Integer
constexpr const char kEnableScale[] = "enableScale";                      // boolean
constexpr const char kFontFamily[] = "fontFamily";                        // String
constexpr const char kFontSize[] = "fontSize";                            // float
constexpr const char kFontStyle[] = "fontStyle";                          // String
constexpr const char kFontWeight[] = "fontWeight";                        // String
constexpr const char kLetterSpacing[] = "letterSpacing";                  // float
constexpr const char kLineHeight[] = "lineHeight";                        // int
constexpr const char kLineSpacingExtra[] = "lineSpacingExtra";            // float
constexpr const char kLineSpacingMultiplier[] = "lineSpacingMultiplier";  // float
constexpr const char kNumberOfLines[] = "numberOfLines";                  // int
constexpr const char kText[] = "text";                                    // String
constexpr const char kTextAlign[] = "textAlign";                          // String
constexpr const char kTextDecorationLine[] = "textDecorationLine";        // String
constexpr const char kTextShadowColor[] = "textShadowColor";              // int
constexpr const char kTextShadowOffset[] = "textShadowOffset";            // HashMap
constexpr const char kTextShadowRadius[] = "textShadowRadius";            // float
}  // namespace text
constexpr const char kTextInput[] = "TextInput";
inline namespace textinput {
constexpr const char kCaret_color[] = "caret_color";                      // int
constexpr const char kColor[] = "color";                                  // int
constexpr const char kDefaultValue[] = "defaultValue";                    // String
constexpr const char kEditable[] = "editable";                            // boolean
constexpr const char kFontFamily[] = "fontFamily";                        // String
constexpr const char kFontSize[] = "fontSize";                            // float
constexpr const char kFontStyle[] = "fontStyle";                          // String
constexpr const char kFontWeight[] = "fontWeight";                        // String
constexpr const char kKeyboardType[] = "keyboardType";                    // String
constexpr const char kLetterSpacing[] = "letterSpacing";                  // float
constexpr const char kMaxLength[] = "maxLength";                          // int
constexpr const char kMultiline[] = "multiline";                          // boolean
constexpr const char kNumberOfLines[] = "numberOfLines";                  // int
constexpr const char kOnBlur[] = "onBlur";                                // boolean
constexpr const char kOnChangeText[] = "onChangeText";                    // boolean
constexpr const char kOnContentSizeChange[] = "onContentSizeChange";      // boolean
constexpr const char kOnEndEditing[] = "onEndEditing";                    // boolean
constexpr const char kOnFocus[] = "onFocus";                              // boolean
constexpr const char kOnSelectionChange[] = "onSelectionChange";          // boolean
constexpr const char kPlaceholder[] = "placeholder";                      // String
constexpr const char kPlaceholderTextColor[] = "placeholderTextColor";    // int
constexpr const char kReturnKeyType[] = "returnKeyType";                  // String
constexpr const char kTextAlign[] = "textAlign";                          // String
constexpr const char kTextAlignVertical[] = "textAlignVertical";          // String
constexpr const char kUnderlineColorAndroid[] = "underlineColorAndroid";  // Integer
constexpr const char kValidator[] = "validator";                          // String
constexpr const char kValue[] = "value";                                  // String
}  // namespace textinput
constexpr const char kView[] = "View";
inline namespace view {
constexpr const char kAccessibilityLabel[] = "accessibilityLabel";                          // String
constexpr const char kAttachedtowindow[] = "attachedtowindow";                              // boolean
constexpr const char kBackgroundColor[] = "backgroundColor";                                // int
constexpr const char kBackgroundImage[] = "backgroundImage";                                // String
constexpr const char kBackgroundPositionX[] = "backgroundPositionX";                        // int
constexpr const char kBackgroundPositionY[] = "backgroundPositionY";                        // int
constexpr const char kBackgroundSize[] = "backgroundSize";                                  // String
constexpr const char kBorderBottomColor[] = "borderBottomColor";                            // int
constexpr const char kBorderBottomLeftRadius[] = "borderBottomLeftRadius";                  // float
constexpr const char kBorderBottomRightRadius[] = "borderBottomRightRadius";                // float
constexpr const char kBorderBottomWidth[] = "borderBottomWidth";                            // float
constexpr const char kBorderColor[] = "borderColor";                                        // int
constexpr const char kBorderLeftColor[] = "borderLeftColor";                                // int
constexpr const char kBorderLeftWidth[] = "borderLeftWidth";                                // float
constexpr const char kBorderRadius[] = "borderRadius";                                      // float
constexpr const char kBorderRightColor[] = "borderRightColor";                              // int
constexpr const char kBorderRightWidth[] = "borderRightWidth";                              // float
constexpr const char kBorderTopColor[] = "borderTopColor";                                  // int
constexpr const char kBorderTopLeftRadius[] = "borderTopLeftRadius";                        // float
constexpr const char kBorderTopRightRadius[] = "borderTopRightRadius";                      // float
constexpr const char kBorderTopWidth[] = "borderTopWidth";                                  // float
constexpr const char kBorderWidth[] = "borderWidth";                                        // float
constexpr const char kClick[] = "click";                                                    // boolean
constexpr const char kCustomProp[] = "customProp";                                          // Object
constexpr const char kDetachedfromwindow[] = "detachedfromwindow";                          // boolean
constexpr const char kFocusable[] = "focusable";                                            // boolean
constexpr const char kInterceptpullupevent[] = "interceptpullupevent";                      // boolean
constexpr const char kIntercepttouchevent[] = "intercepttouchevent";                        // boolean
constexpr const char kLinearGradient[] = "linearGradient";                                  // HippyMap
constexpr const char kLongclick[] = "longclick";                                            // boolean
constexpr const char kNativeBackgroundAndroid[] = "nativeBackgroundAndroid";                // Map
constexpr const char kNextFocusDownId[] = "nextFocusDownId";                                // int
constexpr const char kNextFocusLeftId[] = "nextFocusLeftId";                                // int
constexpr const char kNextFocusRightId[] = "nextFocusRightId";                              // int
constexpr const char kNextFocusUpId[] = "nextFocusUpId";                                    // int
constexpr const char kOpacity[] = "opacity";                                                // float
constexpr const char kOverflow[] = "overflow";                                              // String
constexpr const char kPressin[] = "pressin";                                                // boolean
constexpr const char kPressout[] = "pressout";                                              // boolean
constexpr const char kRenderToHardwareTextureAndroid[] = "renderToHardwareTextureAndroid";  // boolean
constexpr const char kRequestFocus[] = "requestFocus";                                      // boolean
constexpr const char kShadowColor[] = "shadowColor";                                        // int
constexpr const char kShadowOffset[] = "shadowOffset";                                      // HippyMap
constexpr const char kShadowOffsetX[] = "shadowOffsetX";                                    // float
constexpr const char kShadowOffsetY[] = "shadowOffsetY";                                    // float
constexpr const char kShadowOpacity[] = "shadowOpacity";                                    // float
constexpr const char kShadowRadius[] = "shadowRadius";                                      // float
constexpr const char kShadowSpread[] = "shadowSpread";                                      // float
constexpr const char kTouchcancel[] = "touchcancel";                                        // boolean
constexpr const char kTouchend[] = "touchend";                                              // boolean
constexpr const char kTouchmove[] = "touchmove";                                            // boolean
constexpr const char kTouchstart[] = "touchstart";                                          // boolean
constexpr const char kTransform[] = "transform";                                            // ArrayList
constexpr const char kZIndex[] = "zIndex";                                                  // int
}  // namespace view
constexpr const char kViewPager[] = "ViewPager";
inline namespace viewpager {
constexpr const char kInitialPage[] = "initialPage";      // int
constexpr const char kOverflow[] = "overflow";            // String
constexpr const char kPageMargin[] = "pageMargin";        // float
constexpr const char kScrollEnabled[] = "scrollEnabled";  // boolean
}  // namespace viewpager
constexpr const char kViewPagerItem[] = "ViewPagerItem";
inline namespace viewpageritem {}
constexpr const char kWaterfallItem[] = "WaterfallItem";
inline namespace waterfallitem {
constexpr const char kType[] = "type";  // int
}
constexpr const char kWaterfallView[] = "WaterfallView";
inline namespace waterfallview {
constexpr const char kBannerViewMatch[] = "bannerViewMatch";                  // boolean
constexpr const char kColumnSpacing[] = "columnSpacing";                      // int
constexpr const char kContainBannerView[] = "containBannerView";              // boolean
constexpr const char kContentInset[] = "contentInset";                        // HippyMap
constexpr const char kEnableExposureReport[] = "enableExposureReport";        // boolean
constexpr const char kEnableLoadingFooter[] = "enableLoadingFooter";          // boolean
constexpr const char kEnableOnScrollForReport[] = "enableOnScrollForReport";  // boolean
constexpr const char kEnableRefresh[] = "enableRefresh";                      // boolean
constexpr const char kInterItemSpacing[] = "interItemSpacing";                // int
constexpr const char kNumberOfColumns[] = "numberOfColumns";                  // int
constexpr const char kPaddingStartZero[] = "paddingStartZero";                // boolean
constexpr const char kPreloadItemNumber[] = "preloadItemNumber";              // int
constexpr const char kRefreshColor[] = "refreshColor";                        // int
constexpr const char kRefreshColors[] = "refreshColors";                      // HippyArray
}  // namespace waterfallview
constexpr const char kWebView[] = "WebView";
inline namespace webview {
constexpr const char kSource[] = "source";  // HippyMap
constexpr const char kUrl[] = "url";        // String
}  // namespace webview
}  // namespace tdfrender
