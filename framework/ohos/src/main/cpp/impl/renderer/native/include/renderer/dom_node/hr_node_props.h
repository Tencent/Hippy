/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

namespace hippy {
inline namespace render {
inline namespace native {

class HRNodeProps {
public:
  constexpr static const char * ALIGN_ITEMS = "alignItems";
  constexpr static const char * ALIGN_SELF = "alignSelf";
  constexpr static const char * OVERFLOW = "overflow";
  constexpr static const char * BOTTOM = "bottom";
  constexpr static const char * COLLAPSABLE = "collapsable";
  constexpr static const char * FLEX = "flex";
  constexpr static const char * FLEX_GROW = "flexGrow";
  constexpr static const char * FLEX_SHRINK = "flexShrink";
  constexpr static const char * FLEX_BASIS = "flexBasis";
  constexpr static const char * DIRECTION = "direction";
  constexpr static const char * FLEX_DIRECTION = "flexDirection";
  constexpr static const char * FLEX_WRAP = "flexWrap";
  constexpr static const char * HEIGHT = "height";
  constexpr static const char * JUSTIFY_CONTENT = "justifyContent";
  constexpr static const char * LEFT = "left";
  constexpr static const char * DISPLAY = "display";
  constexpr static const char * MARGIN = "margin";
  constexpr static const char * MARGIN_VERTICAL = "marginVertical";
  constexpr static const char * MARGIN_HORIZONTAL = "marginHorizontal";
  constexpr static const char * MARGIN_LEFT = "marginLeft";
  constexpr static const char * MARGIN_RIGHT = "marginRight";
  constexpr static const char * MARGIN_TOP = "marginTop";
  constexpr static const char * MARGIN_BOTTOM = "marginBottom";
  constexpr static const char * PADDING = "padding";
  constexpr static const char * PADDING_VERTICAL = "paddingVertical";
  constexpr static const char * PADDING_HORIZONTAL = "paddingHorizontal";
  constexpr static const char * PADDING_LEFT = "paddingLeft";
  constexpr static const char * PADDING_RIGHT = "paddingRight";
  constexpr static const char * PADDING_TOP = "paddingTop";
  constexpr static const char * PADDING_BOTTOM = "paddingBottom";
  constexpr static const char * POSITION = "position";
  constexpr static const char * RIGHT = "right";
  constexpr static const char * TOP = "top";
  constexpr static const char * WIDTH = "width";
  constexpr static const char * MIN_WIDTH = "minWidth";
  constexpr static const char * MAX_WIDTH = "maxWidth";
  constexpr static const char * MIN_HEIGHT = "minHeight";
  constexpr static const char * MAX_HEIGHT = "maxHeight";
  constexpr static const char * BORDER_WIDTH = "borderWidth";
  constexpr static const char * BORDER_LEFT_WIDTH = "borderLeftWidth";
  constexpr static const char * BORDER_TOP_WIDTH = "borderTopWidth";
  constexpr static const char * BORDER_RIGHT_WIDTH = "borderRightWidth";
  constexpr static const char * BORDER_BOTTOM_WIDTH = "borderBottomWidth";
  constexpr static const char * BORDER_COLOR = "borderColor";
  constexpr static const char * BORDER_LEFT_COLOR = "borderLeftColor";
  constexpr static const char * BORDER_TOP_COLOR = "borderTopColor";
  constexpr static const char * BORDER_RIGHT_COLOR = "borderRightColor";
  constexpr static const char * BORDER_BOTTOM_COLOR = "borderBottomColor";
  constexpr static const char * BORDER_STYLE = "borderStyle";
  constexpr static const char * BORDER_LEFT_STYLE = "borderLeftStyle";
  constexpr static const char * BORDER_TOP_STYLE = "borderTopStyle";
  constexpr static const char * BORDER_RIGHT_STYLE = "borderRightStyle";
  constexpr static const char * BORDER_BOTTOM_STYLE = "borderBottomStyle";
  constexpr static const char * SHADOW_COLOR = "shadowColor";
  constexpr static const char * SHADOW_OFFSET = "shadowOffset";
  constexpr static const char * SHADOW_OFFSET_X = "shadowOffsetX";
  constexpr static const char * SHADOW_OFFSET_Y = "shadowOffsetY";
  constexpr static const char * SHADOW_OPACITY = "shadowOpacity";
  constexpr static const char * SHADOW_RADIUS = "shadowRadius";
  constexpr static const char * SHADOW_SPREAD = "shadowSpread";
  constexpr static const char * LINEAR_GRADIENT = "linearGradient";
  constexpr static const char * ENABLED = "enabled";
  constexpr static const char * OPACITY = "opacity";
  constexpr static const char * BACKGROUND_COLOR = "backgroundColor";
  constexpr static const char * BACKGROUND_COLORS = "backgroundColors";
  constexpr static const char * COLORS = "colors";
  constexpr static const char * COLOR = "color";
  constexpr static const char * BACKGROUND_IMAGE = "backgroundImage";
  constexpr static const char * BACKGROUND_POSITION_X = "backgroundPositionX";
  constexpr static const char * BACKGROUND_POSITION_Y = "backgroundPositionY";
  constexpr static const char * BACKGROUND_SIZE = "backgroundSize";
  constexpr static const char * FONT_SIZE = "fontSize";
  constexpr static const char * LETTER_SPACING = "letterSpacing";
  constexpr static const char * FONT_WEIGHT = "fontWeight";
  constexpr static const char * FONT_STYLE = "fontStyle";
  constexpr static const char * FONT_FAMILY = "fontFamily";
  constexpr static const char * LINE_HEIGHT = "lineHeight";
  constexpr static const char * LINE_SPACING_MULTIPLIER = "lineSpacingMultiplier";
  constexpr static const char * LINE_SPACING_EXTRA = "lineSpacingExtra";
  constexpr static const char * NUMBER_OF_LINES = "numberOfLines";
  constexpr static const char * ELLIPSIZE_MODE = "ellipsizeMode";
  constexpr static const char * BREAK_STRATEGY = "breakStrategy";
  constexpr static const char * ON = "on";
  constexpr static const char * RESIZE_MODE = "resizeMode";
  constexpr static const char * RESIZE_METHOD = "resizeMethod";
  constexpr static const char * GAUSSIAN_BLUR = "gaussianBlur";
  constexpr static const char * TEXT_ALIGN = "textAlign";
  constexpr static const char * TEXT_ALIGN_VERTICAL = "textAlignVertical";
  constexpr static const char * TEXT_DECORATION_LINE = "textDecorationLine";
  constexpr static const char * TEXT_DECORATION_COLOR = "textDecorationColor";
  constexpr static const char * TEXT_DECORATION_STYLE = "textDecorationStyle";
  constexpr static const char * TEXT_SHADOW_OFFSET = "textShadowOffset";
  constexpr static const char * TEXT_SHADOW_RADIUS = "textShadowRadius";
  constexpr static const char * TEXT_SHADOW_COLOR = "textShadowColor";
  constexpr static const char * ON_CLICK = "click";
  constexpr static const char * ON_LONG_CLICK = "longclick";
  constexpr static const char * ON_PRESS_IN = "pressin";
  constexpr static const char * ON_PRESS_OUT = "pressout";
  constexpr static const char * ON_TOUCH_DOWN = "touchstart";
  constexpr static const char * ON_TOUCH_MOVE = "touchmove";
  constexpr static const char * ON_TOUCH_END = "touchend";
  constexpr static const char * ON_TOUCH_CANCEL = "touchcancel";
  constexpr static const char * ON_INTERCEPT_TOUCH_EVENT = "onInterceptTouchEvent";
  constexpr static const char * ON_INTERCEPT_PULL_UP_EVENT = "onInterceptPullUpEvent";
  constexpr static const char * ON_ATTACHED_TO_WINDOW = "attachedtowindow";
  constexpr static const char * ON_DETACHED_FROM_WINDOW = "detachedfromwindow";

  constexpr static const char * BORDER_RADIUS = "borderRadius";
  constexpr static const char * BORDER_TOP_LEFT_RADIUS = "borderTopLeftRadius";
  constexpr static const char * BORDER_TOP_RIGHT_RADIUS = "borderTopRightRadius";
  constexpr static const char * BORDER_BOTTOM_LEFT_RADIUS = "borderBottomLeftRadius";
  constexpr static const char * BORDER_BOTTOM_RIGHT_RADIUS = "borderBottomRightRadius";

  constexpr static const char * TRANSFORM = "transform";
  constexpr static const char * Z_INDEX = "zIndex";

  constexpr static const float FONT_SIZE_SP = 14.0;

  constexpr static const char * VIEW_CLASS_NAME = "View";
  constexpr static const char * TEXT_CLASS_NAME = "Text";
  constexpr static const char * IMAGE_CLASS_NAME = "Image";
  constexpr static const char * TEXT_INPUT_CLASS_NAME = "TextInput";
  constexpr static const char * IMAGE_SPAN_TEXT = "[img]";

  constexpr static const char * VERTICAL_ALIGN = "verticalAlign";

  constexpr static const char * PROPS = "props";
  constexpr static const char * ROOT_NODE = "RootNode";
  constexpr static const char * CUSTOM_PROP = "customProp";
  constexpr static const char * CUSTOM_PROP_IMAGE_TYPE = "imageType";

  constexpr static const char * PROP_ACCESSIBILITY_LABEL = "accessibilityLabel";
  constexpr static const char * FOCUSABLE = "focusable";
  constexpr static const char * NEXT_FOCUS_DOWN_ID = "nextFocusDownId";
  constexpr static const char * NEXT_FOCUS_UP_ID = "nextFocusUpId";
  constexpr static const char * NEXT_FOCUS_LEFT_ID = "nextFocusLeftId";
  constexpr static const char * NEXT_FOCUS_RIGHT_ID = "nextFocusRightId";
  constexpr static const char * REQUEST_FOCUS = "requestFocus";

  constexpr static const char * VISIBILITY = "visibility";
  constexpr static const char * VISIBLE = "visible";
  constexpr static const char * HIDDEN = "hidden";
  constexpr static const char * REPEAT_COUNT = "repeatCount";
  constexpr static const char * ATTRIBUTES = "attributes";
  constexpr static const char * BACKGROUND_RIPPLE = "nativeBackgroundAndroid";
  constexpr static const char * OVER_PULL = "bounces";
  constexpr static const char * HAS_STABLE_IDS = "hasStableIds";
};

} // namespace native
} // namespace render
} // namespace hippy
